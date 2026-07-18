import { useEffect, useMemo, useState } from "react"
import { Activity, Database, MousePointerClick, RefreshCcw, Route, Search } from "lucide-react"

import {
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
  const [emailFilter, setEmailFilter] = useState("")
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [error, setError] = useState("")
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

  const loadSessions = async () => {
    if (!configured) return
    setLoadingSessions(true)
    setError("")

    try {
      const nextSessions = await fetchInteractionSessions({ email: emailFilter, limit: 100 })
      setSessions(nextSessions)
      setSelectedSessionId((current) => current || nextSessions[0]?.sessionId || "")
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
    loadSessions()
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
          <div className="mt-4 space-y-2">
            {sessions.map((session) => {
              const status = getSessionStatus(session)

              return (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`w-full rounded-[13px] border p-3 text-left ${
                    selectedSessionId === session.sessionId
                      ? "border-[#854f19] bg-[#fff1e8]"
                      : "border-[#ead8ca] bg-[#fffdf9] hover:bg-[#fff8f5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#231a11]">{session.email}</p>
                      <p className="mt-1 truncate text-[12px] text-[#8a796b]">{session.sessionId}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-[#52443a]">
                    <span>{formatDate(session.loginAt || session.createdAt)}</span>
                    <span className="font-bold">{session.eventCount || 0} event</span>
                  </div>
                </button>
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
              {loadingEvents && <span className="text-[13px] text-[#8a796b]">Đang tải...</span>}
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
