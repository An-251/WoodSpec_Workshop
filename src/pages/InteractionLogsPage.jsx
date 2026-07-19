import { useEffect, useMemo, useState } from "react"
import { Activity, Database, Download, MousePointerClick, RefreshCcw, Route, Search, Trash2 } from "lucide-react"

import {
  deleteInteractionSession,
  fetchInteractionEvents,
  fetchInteractionSessions,
  getInteractionApiUrl,
  isInteractionApiConfigured,
} from "@/services/interactionApi"

function formatDate(value) {
  if (!value) return "Chưa có"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString("vi-VN")
}

function formatCsvDate(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toISOString()
}

function getRawJson(value) {
  try {
    return JSON.stringify(value ?? {})
  } catch {
    return ""
  }
}

function escapeCsvValue(value) {
  const text = String(value ?? "")
  if (!/[",\r\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

function buildInteractionCsvFromGroups(groups) {
  const rows = [
    [
      "session_id",
      "email",
      "session_login_at",
      "session_end_at",
      "event_id",
      "event_type",
      "event_target",
      "event_path",
      "event_elapsed_seconds",
      "event_at",
      "event_raw_json",
    ],
    ...groups.flatMap(({ session, events }) =>
      events.map((event) => [
        session?.sessionId,
        session?.email,
        formatCsvDate(session?.loginAt || session?.createdAt),
        formatCsvDate(session?.logoutAt || session?.disconnectAt),
        event._id || event.id || "",
        event.type || "",
        event.target || "",
        event.path || "",
        event.elapsedSeconds ?? "",
        formatCsvDate(event.at),
        getRawJson(event.raw || event),
      ]),
    ),
  ]

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n")
}

function buildInteractionCsv(session, events) {
  return buildInteractionCsvFromGroups([{ session, events }])
}

function downloadCsv(filename, csv) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function sanitizeFileSegment(value) {
  return String(value || "session").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "session"
}

function getEmailExportFileSegment(emails) {
  if (emails.length <= 3) return emails.map(sanitizeFileSegment).join("_")
  return `${emails.length}_emails`
}

function eventIcon(type) {
  if (type === "click") return MousePointerClick
  if (type === "route_view") return Route
  return Activity
}

function getSessionStatus(session) {
  if (session?.logoutAt) {
    return {
      label: "Đã đăng xuất",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
      at: session.logoutAt,
    }
  }

  if (session?.disconnectAt) {
    return {
      label: "Đã rời web",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
      at: session.disconnectAt,
    }
  }

  return {
    label: "Đang mở",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
    at: session?.lastSeenAt || session?.updatedAt,
  }
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">{label}</p>
      <p className="mt-2 text-[20px] font-black text-[#231a11]">{value}</p>
    </div>
  )
}

function InteractionLogsPage() {
  const [sessions, setSessions] = useState([])
  const [events, setEvents] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [selectedEmails, setSelectedEmails] = useState([])
  const [emailFilter, setEmailFilter] = useState("")
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)
  const [exportingEmailsCsv, setExportingEmailsCsv] = useState(false)
  const [deletingSessionId, setDeletingSessionId] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const configured = isInteractionApiConfigured()

  const selectedSession = useMemo(
    () => sessions.find((session) => session.sessionId === selectedSessionId),
    [selectedSessionId, sessions],
  )

  const eventCounts = useMemo(
    () =>
      events.reduce((total, event) => {
        total[event.type] = (total[event.type] || 0) + 1
        return total
      }, {}),
    [events],
  )

  const emailOptions = useMemo(
    () =>
      Array.from(new Set(sessions.map((session) => session.email).filter(Boolean))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [sessions],
  )

  const loadSessions = async () => {
    if (!configured) return
    setLoadingSessions(true)
    setError("")
    setMessage("")

    try {
      const nextSessions = await fetchInteractionSessions({ email: emailFilter, limit: 100 })
      setSessions(nextSessions)
      setSelectedSessionId((current) =>
        nextSessions.some((session) => session.sessionId === current) ? current : nextSessions[0]?.sessionId || "",
      )
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured])

  useEffect(() => {
    setSelectedEmails((currentEmails) => currentEmails.filter((email) => emailOptions.includes(email)))
  }, [emailOptions])

  useEffect(() => {
    if (!selectedSessionId || !configured) {
      setEvents([])
      return
    }

    let active = true
    setLoadingEvents(true)
    setError("")

    fetchInteractionEvents(selectedSessionId, { limit: 1500 })
      .then((nextEvents) => {
        if (active) setEvents(nextEvents)
      })
      .catch((nextError) => {
        if (active) setError(nextError.message)
      })
      .finally(() => {
        if (active) setLoadingEvents(false)
      })

    return () => {
      active = false
    }
  }, [configured, selectedSessionId])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSelectedSessionId("")
    setMessage("")
    loadSessions()
  }

  const toggleSelectedEmail = (email) => {
    setSelectedEmails((currentEmails) =>
      currentEmails.includes(email)
        ? currentEmails.filter((currentEmail) => currentEmail !== email)
        : [...currentEmails, email],
    )
  }

  const handleSelectAllEmails = () => {
    setSelectedEmails(emailOptions)
    setMessage("")
  }

  const handleClearSelectedEmails = () => {
    setSelectedEmails([])
    setMessage("")
  }

  const handleExportSelectedEmailsCsv = async () => {
    if (selectedEmails.length === 0) return

    setExportingEmailsCsv(true)
    setError("")
    setMessage("")

    try {
      const sessionMap = new Map()

      for (const email of selectedEmails) {
        const emailSessions = await fetchInteractionSessions({ email, limit: 200 })
        emailSessions.forEach((session) => {
          if (session.sessionId) sessionMap.set(session.sessionId, session)
        })
      }

      const exportSessions = Array.from(sessionMap.values()).filter((session) => selectedEmails.includes(session.email))

      if (exportSessions.length === 0) {
        setMessage("Các email đã chọn chưa có session để xuất CSV.")
        return
      }

      const groups = await Promise.all(
        exportSessions.map(async (session) => ({
          session,
          events: await fetchInteractionEvents(session.sessionId, { limit: 5000 }),
        })),
      )
      const eventTotal = groups.reduce((total, group) => total + group.events.length, 0)

      if (eventTotal === 0) {
        setMessage("Các email đã chọn chưa có event để xuất CSV.")
        return
      }

      const csv = buildInteractionCsvFromGroups(groups)
      const emailSegment = getEmailExportFileSegment(selectedEmails)
      downloadCsv(`woodspec-raw-interaction-${emailSegment}.csv`, csv)
      setMessage(`Đã xuất ${eventTotal} event từ ${selectedEmails.length} email thành một file CSV.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setExportingEmailsCsv(false)
    }
  }

  const handleExportCsv = async () => {
    if (!selectedSession) return

    setExportingCsv(true)
    setError("")
    setMessage("")

    try {
      const exportEvents = await fetchInteractionEvents(selectedSession.sessionId, { limit: 5000 })
      setEvents(exportEvents)

      if (exportEvents.length === 0) {
        setMessage("Session này chưa có event để xuất CSV.")
        return
      }

      const csv = buildInteractionCsv(selectedSession, exportEvents)
      const email = sanitizeFileSegment(selectedSession.email)
      const sessionId = sanitizeFileSegment(selectedSession.sessionId)
      downloadCsv(`woodspec-raw-interaction-${email}-${sessionId}.csv`, csv)
      setMessage(`Đã xuất ${exportEvents.length} event thành CSV.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setExportingCsv(false)
    }
  }

  const handleDeleteSession = async (session) => {
    const accepted = window.confirm(`Xóa log phiên ${session.sessionId}?`)
    if (!accepted) return

    setDeletingSessionId(session.sessionId)
    setError("")
    setMessage("")

    try {
      await deleteInteractionSession(session.sessionId)
      setSessions((currentSessions) => currentSessions.filter((item) => item.sessionId !== session.sessionId))

      if (selectedSessionId === session.sessionId) {
        setSelectedSessionId("")
        setEvents([])
      }
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setDeletingSessionId("")
    }
  }

  if (!configured) {
    return (
      <section className="rounded-[18px] border border-[#ead8ca] bg-white p-8 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Log thao tác</p>
        <h2 className="mt-2 text-[30px] font-bold text-[#231a11]">Chưa cấu hình backend log</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-6 text-[#52443a]">
          Thêm `VITE_INTERACTION_API_URL=http://localhost:5500` vào file `.env` frontend, chạy lại Vite, rồi mở trang này.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Log thao tác</p>
            <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">Raw interaction data</h2>
            <p className="mt-2 text-[15px] text-[#52443a]">Nguồn dữ liệu: {getInteractionApiUrl()}</p>
          </div>
          <button
            type="button"
            onClick={loadSessions}
            disabled={loadingSessions}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCcw size={17} />
            Tải lại
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-left text-[14px] font-bold text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-[14px] font-bold text-emerald-700">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-[18px] border border-[#ead8ca] bg-white p-4 shadow-[0_14px_36px_rgba(82,68,58,0.06)] md:flex-row">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-[13px] border border-[#ead8ca] px-3">
          <Search size={17} className="text-[#8a796b]" />
          <input
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            placeholder="Lọc theo email tester"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
          />
        </div>
        <button type="submit" className="h-11 rounded-[13px] border border-[#ead8ca] px-4 text-[14px] font-bold text-[#52443a]">
          Lọc session
        </button>
      </form>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="rounded-[18px] border border-[#ead8ca] bg-white p-4 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#854f19]" />
            <h3 className="font-bold text-[#231a11]">Sessions</h3>
          </div>

          {emailOptions.length > 0 && (
            <div className="mt-4 border-b border-[#ead8ca] pb-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Email xuất CSV</p>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllEmails}
                    className="text-[12px] font-bold text-[#854f19] hover:underline"
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelectedEmails}
                    className="text-[12px] font-bold text-[#8a796b] hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div className="mt-3 max-h-40 space-y-2 overflow-auto pr-1">
                {emailOptions.map((email) => (
                  <label
                    key={email}
                    className="flex min-h-10 items-center gap-3 rounded-[12px] border border-[#ead8ca] bg-[#fffdf9] px-3 py-2 text-[13px] font-bold text-[#231a11]"
                    title={email}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email)}
                      onChange={() => toggleSelectedEmail(email)}
                      className="size-4 accent-[#854f19]"
                    />
                    <span className="min-w-0 flex-1 truncate">{email}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={handleExportSelectedEmailsCsv}
                disabled={selectedEmails.length === 0 || exportingEmailsCsv}
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#854f19] px-3 text-[13px] font-bold text-white transition hover:bg-[#6f4114] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} />
                {exportingEmailsCsv ? "Đang xuất..." : `Xuất CSV tổng (${selectedEmails.length})`}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {sessions.map((session) => {
              const status = getSessionStatus(session)

              return (
                <div
                  key={session.sessionId}
                  className={`w-full rounded-[13px] border p-3 text-left ${
                    selectedSessionId === session.sessionId
                      ? "border-[#854f19] bg-[#fff1e8]"
                      : "border-[#ead8ca] bg-[#fffdf9] hover:bg-[#fff8f5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setSelectedSessionId(session.sessionId)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[14px] font-bold text-[#231a11]">{session.email}</p>
                      <p className="mt-1 truncate text-[12px] text-[#8a796b]">{session.sessionId}</p>
                    </button>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${status.tone}`}>
                      {status.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session)}
                      disabled={deletingSessionId === session.sessionId}
                      aria-label="Xóa log phiên"
                      title="Xóa log phiên"
                      className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionId(session.sessionId)}
                    className="mt-2 flex w-full items-center justify-between gap-3 text-left text-[12px] text-[#52443a]"
                  >
                    <span>{formatDate(session.loginAt || session.createdAt)}</span>
                    <span className="font-bold">{session.eventCount || 0} event</span>
                  </button>
                </div>
              )
            })}

            {!loadingSessions && sessions.length === 0 && (
              <p className="rounded-[13px] bg-[#fffdf9] px-4 py-6 text-center text-[14px] text-[#8a796b]">
                Chưa có session nào.
              </p>
            )}
            {loadingSessions && <p className="px-3 py-4 text-[14px] text-[#8a796b]">Đang tải session...</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <StatBox label="Tổng event" value={events.length} />
            <StatBox label="Click" value={eventCounts.click || 0} />
            <StatBox label="Route view" value={eventCounts.route_view || 0} />
            <StatBox label="Session" value={selectedSession ? "Đã chọn" : "Chưa chọn"} />
          </div>

          {selectedSession && (
            <div className="rounded-[18px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#854f19]">Chi tiết session</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Email</p>
                  <p className="mt-1 font-semibold text-[#231a11]">{selectedSession.email}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Id</p>
                  <p className="mt-1 font-semibold text-[#231a11]">{selectedSession._id}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Thời gian login</p>
                  <p className="mt-1 font-semibold text-[#231a11]">{formatDate(selectedSession.loginAt || selectedSession.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Viewport</p>
                  <p className="mt-1 font-semibold text-[#231a11]">
                    {selectedSession.viewport?.width || "-"} x {selectedSession.viewport?.height || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Timezone</p>
                  <p className="mt-1 font-semibold text-[#231a11]">{selectedSession.timezone || "-"}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Trạng thái</p>
                  <p className="mt-1 font-semibold text-[#231a11]">{getSessionStatus(selectedSession).label}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#8a796b]">Rời web / đăng xuất</p>
                  <p className="mt-1 font-semibold text-[#231a11]">
                    {formatDate(selectedSession.disconnectAt || selectedSession.logoutAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[18px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#231a11]">Raw events</h3>
              <div className="flex items-center gap-2">
                {loadingEvents && <span className="text-[13px] text-[#8a796b]">Đang tải...</span>}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={!selectedSession || exportingCsv || loadingEvents}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] font-bold text-[#52443a] transition hover:bg-[#fff8f5] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Xuất raw interaction data CSV"
                  title="Xuất raw interaction data CSV"
                >
                  <Download size={16} />
                  {exportingCsv ? "Đang xuất..." : "CSV"}
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {events.map((event) => {
                const Icon = eventIcon(event.type)

                return (
                  <div key={event._id} className="rounded-[13px] border border-[#ead8ca] bg-[#fffdf9] p-3">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="flex min-w-0 gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#fff1e8] text-[#854f19]">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#231a11]">{event.type}</p>
                          <p className="mt-1 break-words text-[13px] text-[#52443a]">{event.target || "-"}</p>
                          <p className="mt-1 text-[12px] text-[#8a796b]">{event.path || "-"}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-left md:text-right">
                        <p className="text-[12px] font-bold text-[#854f19]">{event.elapsedSeconds || 0}s</p>
                        <p className="mt-1 text-[12px] text-[#8a796b]">{formatDate(event.at)}</p>
                      </div>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-[12px] font-bold text-[#854f19]">Raw JSON</summary>
                      <pre className="mt-2 max-h-64 overflow-auto rounded-[12px] bg-[#231a11] p-3 text-[12px] text-white">
                        {JSON.stringify(event.raw || event, null, 2)}
                      </pre>
                    </details>
                  </div>
                )
              })}

              {!loadingEvents && selectedSession && events.length === 0 && (
                <p className="rounded-[13px] bg-[#fffdf9] px-4 py-6 text-center text-[14px] text-[#8a796b]">
                  Session này chưa có event.
                </p>
              )}
              {!selectedSession && (
                <p className="rounded-[13px] bg-[#fffdf9] px-4 py-6 text-center text-[14px] text-[#8a796b]">
                  Chọn một session để xem raw events.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InteractionLogsPage
