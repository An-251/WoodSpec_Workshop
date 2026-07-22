import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Bot, CheckCircle2, Mic, RotateCcw, SendHorizontal, Sparkles, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { buildInterviewPrompt, getFallbackInterviewTurn, openingQuestion } from "@/data/reference/designInterview"
import { materialOptions } from "@/data/reference/materials"
import { productTemplates } from "@/data/reference/products"
import { rankPromptSuggestions } from "@/data/reference/promptSuggestions"
import Cabinet3DCardPreview from "@/features/configurator/components/Cabinet3DCardPreview"
import { calculateEstimatedPrice, layoutOptions } from "@/features/configurator/utils"
import { hasGeminiApiKey, requestGeminiFinalPrompt, requestGeminiGeneratedTemplate, requestGeminiInterviewTurn } from "@/services/geminiInterviewService"

const INTERVIEW_STORAGE_KEY = "woodspec_design_chat"
const CHAT_LIMIT_SECONDS = 30

function createMessage(role, text, meta = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    ...meta,
  }
}

function getSuggestionConfiguration(suggestion) {
  const product = productTemplates.find((item) => item.id === suggestion.productId) ?? productTemplates[0]
  const material = materialOptions.find((item) => item.id === suggestion.materialId) ?? materialOptions[0]
  const color = material.colors.find((item) => item.id === suggestion.colorId) ?? material.colors[0]
  const layout = layoutOptions.find((item) => item.id === suggestion.layoutId) ?? layoutOptions[0]
  const configuration = {
    product,
    productName: product.name,
    dimensions: suggestion.dimensions ?? product.defaultDimensions,
    material,
    color,
    layout,
    designDetails: suggestion.designDetails,
    requestDetails: suggestion.requestDetails,
    generatedSpec: null,
  }

  return {
    ...configuration,
    estimatedPrice: calculateEstimatedPrice(configuration),
  }
}

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

function getSavedState() {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    return JSON.parse(window.sessionStorage.getItem(INTERVIEW_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function buildAnswers(messages) {
  const userMessages = messages.filter((message) => message.role === "user")
  const answers = {}

  userMessages.forEach((message, index) => {
    if (index === 0) {
      answers.productNeed = message.text
      return
    }

    if (index === 1) {
      answers.usage = message.text
      return
    }

    if (index === 2) {
      answers.style = message.text
      return
    }

    answers[`extra-${index}`] = message.text
  })

  return answers
}

function DashboardDesignAssistant({ prompt, onPromptChange, configuratorPath, onApplySuggestion }) {
  const savedState = useMemo(() => getSavedState(), [])
  const initialAssistantMessage = useMemo(
    () => createMessage(
      "assistant",
      "Anh chị muốn làm vật dụng gì và đặt ở không gian nào? Cứ nhắn tự nhiên như đang trao đổi với tư vấn viên.",
      { hint: openingQuestion.hint }
    ),
    []
  )
  const [messages, setMessages] = useState(savedState.messages ?? [initialAssistantMessage])
  const [draft, setDraft] = useState(savedState.draft ?? "")
  const [startedAt, setStartedAt] = useState(savedState.startedAt ?? null)
  const [isThinking, setIsThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState(savedState.generatedTemplate ?? null)
  const [hasCompletedInterview, setHasCompletedInterview] = useState(savedState.hasCompletedInterview ?? false)
  const [statusMessage, setStatusMessage] = useState(savedState.statusMessage ?? "")
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const userMessageCount = messages.filter((message) => message.role === "user").length
  const shouldShowRecommendations = hasCompletedInterview && prompt.trim().length > 0
  const recommendations = useMemo(() => {
    if (!shouldShowRecommendations) {
      return []
    }

    return [
      ...(generatedTemplate ? [generatedTemplate] : []),
      ...rankPromptSuggestions(prompt).filter((item) => item.id !== generatedTemplate?.id),
    ]
  }, [generatedTemplate, prompt, shouldShowRecommendations])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (!startedAt || hasCompletedInterview) {
      return undefined
    }

    const elapsedMs = Date.now() - startedAt
    const timeout = window.setTimeout(() => {
      if (userMessageCount > 0 && !isThinking) {
        finalizeConversation(messages)
      }
    }, Math.max(0, CHAT_LIMIT_SECONDS * 1000 - elapsedMs))

    return () => window.clearTimeout(timeout)
  // Timer này cố ý dùng snapshot hội thoại hiện tại để không tự reset mốc xử lý nhanh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedInterview, isThinking, messages, startedAt, userMessageCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [messages, isThinking])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.sessionStorage.setItem(
      INTERVIEW_STORAGE_KEY,
      JSON.stringify({
        messages,
        draft,
        startedAt,
        generatedTemplate,
        hasCompletedInterview,
        statusMessage,
        prompt,
      })
    )
  }, [draft, generatedTemplate, hasCompletedInterview, messages, prompt, startedAt, statusMessage])

  useEffect(() => {
    if (savedState.prompt && !prompt) {
      onPromptChange(savedState.prompt)
    }
  }, [onPromptChange, prompt, savedState.prompt])

  function startListening() {
    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      setStatusMessage("Trình duyệt chưa hỗ trợ nhập giọng nói, anh chị có thể nhập bằng bàn phím.")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "vi-VN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setIsListening(true)
      setStatusMessage("Đang nghe câu trả lời...")
    }
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ""
      setDraft(transcript)
      setStatusMessage("Đã nhận giọng nói, anh chị có thể sửa lại rồi gửi.")
    }
    recognition.onerror = () => {
      setStatusMessage("Chưa nghe rõ, anh chị thử lại hoặc nhập bằng bàn phím.")
    }
    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  async function generateAiTemplate(finalPrompt) {
    if (!hasGeminiApiKey()) {
      setGeneratedTemplate(null)
      return
    }

    try {
      const template = await requestGeminiGeneratedTemplate({ prompt: finalPrompt })
      setGeneratedTemplate(template)
      setStatusMessage("Đã tạo thêm một mẫu riêng khớp với nội dung trò chuyện.")
    } catch (error) {
      setGeneratedTemplate(null)
      setStatusMessage(`Chưa tạo được mẫu riêng, hệ thống dùng mẫu có sẵn phù hợp. ${error.message}`)
    }
  }

  async function finalizeConversation(nextMessages = messages) {
    const answers = buildAnswers(nextMessages)
    const localPrompt = buildInterviewPrompt(answers)

    if (!localPrompt) {
      return
    }

    setIsThinking(true)
    setHasCompletedInterview(false)

    try {
      const result = hasGeminiApiKey()
        ? await requestGeminiFinalPrompt({ answers })
        : { reply: "Mình đã tổng hợp nhu cầu và chọn mẫu phù hợp nhất.", prompt: localPrompt }
      const finalPrompt = result.prompt || localPrompt

      onPromptChange(finalPrompt)
      setHasCompletedInterview(true)
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", `${result.reply || "Mình đã đủ dữ liệu để đề xuất mẫu."} Mẫu phù hợp đang hiện ngay bên dưới.`, { done: true }),
      ])
      setStatusMessage("Đã chốt nhu cầu và hiển thị mẫu phù hợp.")
      await generateAiTemplate(finalPrompt)
    } catch (error) {
      onPromptChange(localPrompt)
      setHasCompletedInterview(true)
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", "Mình đã dùng thông tin hiện có để tạo mẫu phù hợp. Anh chị có thể chọn mẫu và chỉnh tiếp từng chi tiết.", { done: true }),
      ])
      setStatusMessage(`Không gọi được Gemini, đã dùng bộ xử lý nội bộ. ${error.message}`)
      await generateAiTemplate(localPrompt)
    } finally {
      setIsThinking(false)
    }
  }

  async function handleSendMessage() {
    const messageText = draft.trim()

    if (!messageText || isThinking) {
      return
    }

    const firstStartedAt = startedAt ?? Date.now()
    const nextMessages = [...messages, createMessage("user", messageText)]
    const answers = buildAnswers(nextMessages)
    const nextTurnCount = nextMessages.filter((message) => message.role === "user").length

    setStartedAt(firstStartedAt)
    setMessages(nextMessages)
    setDraft("")
    setIsThinking(true)
    setStatusMessage("Đang hiểu nhu cầu và tìm mẫu phù hợp...")

    try {
      const turn = hasGeminiApiKey()
        ? await requestGeminiInterviewTurn({
          answers,
          transcript: messageText,
          turnCount: nextTurnCount,
        })
        : getFallbackInterviewTurn(answers, nextTurnCount)
      const shouldFinish = turn.ready || nextTurnCount >= 3 || Date.now() - firstStartedAt > CHAT_LIMIT_SECONDS * 1000

      if (shouldFinish) {
        if (turn.prompt) {
          onPromptChange(turn.prompt)
        }
        setIsThinking(false)
        await finalizeConversation(nextMessages)
        return
      }

      const assistantText = [turn.reply, turn.question].filter(Boolean).join(" ")
      setMessages([...nextMessages, createMessage("assistant", assistantText, { hint: turn.hint })])
      setStatusMessage(hasGeminiApiKey() ? "Gemini đã hỏi tiếp theo ngữ cảnh." : "Đang dùng câu hỏi nội bộ vì chưa có API key.")
    } catch (error) {
      const fallbackTurn = getFallbackInterviewTurn(answers, nextTurnCount)

      if (fallbackTurn.ready || nextTurnCount >= 2) {
        setIsThinking(false)
        await finalizeConversation(nextMessages)
        return
      }

      setMessages([...nextMessages, createMessage("assistant", [fallbackTurn.reply, fallbackTurn.question].filter(Boolean).join(" "), { hint: fallbackTurn.hint })])
      setStatusMessage(`Gemini chưa phản hồi, chuyển sang câu hỏi nội bộ. ${error.message}`)
    } finally {
      setIsThinking(false)
    }
  }

  function handleResetInterview() {
    recognitionRef.current?.stop()
    const nextInitialMessage = createMessage(
      "assistant",
      "Anh chị muốn làm vật dụng gì và đặt ở không gian nào? Cứ nhắn tự nhiên như đang trao đổi với tư vấn viên.",
      { hint: openingQuestion.hint }
    )

    setMessages([nextInitialMessage])
    setDraft("")
    setStartedAt(null)
    setIsThinking(false)
    setGeneratedTemplate(null)
    setHasCompletedInterview(false)
    setStatusMessage("")
    window.sessionStorage?.removeItem(INTERVIEW_STORAGE_KEY)
    onPromptChange("")
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-xl border border-[#ead8ca] bg-white shadow-[0_4px_20px_rgba(43,33,24,0.08)]">
        <div className="border-b border-[#ead8ca] bg-[#fffaf6] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-[#ead8ca] bg-white px-3 py-2 text-sm font-semibold text-[#735b2d]">
                <Bot className="size-4" />
                Trợ lý thiết kế
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.01em] text-[#231a11] md:text-4xl">
                WoodSpec biến ý tưởng nội thất gỗ thành thiết kế sẵn sàng báo giá.
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#52443a]">
                Trò chuyện tự nhiên với trợ lý, nhận mẫu phù hợp và tinh chỉnh trực tiếp trên mô hình 3D.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-[520px] bg-[#fbf8f3]">
          <div className="flex min-h-[520px] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-sm bg-[#854f19] text-white"
                        : "rounded-bl-sm border border-[#ead8ca] bg-white text-[#352820]"
                    }`}
                  >
                    <p>{message.text}</p>
                    {message.hint && (
                      <p className={`mt-2 text-xs ${message.role === "user" ? "text-white/80" : "text-[#847468]"}`}>
                        {message.hint}
                      </p>
                    )}
                    {message.done && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#854f19]">
                        <CheckCircle2 className="size-3" />
                        Đã có mẫu đề xuất
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-[#ead8ca] bg-white px-4 py-3 text-sm font-semibold text-[#735b2d] shadow-sm">
                    Đang suy nghĩ...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[#ead8ca] bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-16 flex-1 resize-none rounded-xl border border-[#d7c3b5] bg-white px-4 py-3 text-sm leading-6 text-[#231a11] outline-none focus:border-[#854f19]"
                  placeholder="Ví dụ: Tôi cần tủ giày cho lối vào, để khoảng 20 đôi, có chỗ ngồi và nhìn kín gọn..."
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={startListening} className="border-[#d7c3b5] bg-white text-[#854f19]">
                    <Mic />
                    {isListening ? "Dừng" : "Nói"}
                  </Button>
                  <Button type="button" onClick={handleSendMessage} disabled={!draft.trim() || isThinking} className="bg-[#854f19] hover:bg-[#7a4a22]">
                    <SendHorizontal />
                    Gửi
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-h-5 text-xs font-semibold text-[#735b2d]">{statusMessage}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleResetInterview} className="border-[#d7c3b5] bg-white text-[#854f19]">
                    <RotateCcw />
                    Làm lại
                  </Button>
                  <Button
                    type="button"
                    onClick={() => finalizeConversation(messages)}
                    disabled={isThinking || userMessageCount === 0}
                    className="bg-[#854f19] hover:bg-[#7a4a22]"
                  >
                    <Sparkles />
                    Tạo mẫu ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </article>

      {shouldShowRecommendations ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {recommendations.map((suggestion, index) => {
            const configuration = getSuggestionConfiguration(suggestion)
            const matchedKeywords = suggestion.matchedKeywords ?? []
            const matchedText = matchedKeywords.length > 0 ? matchedKeywords.join(", ") : "Đề xuất theo nội dung trò chuyện"

            return (
              <article key={suggestion.id} className={`overflow-hidden rounded-xl border bg-white shadow-[0_4px_20px_rgba(43,33,24,0.08)] ${index === 0 ? "border-[#854f19]" : "border-[#ead8ca]"}`}>
                <div className="bg-[#fff1e8] p-4">
                  <div className="relative h-56 overflow-hidden rounded-lg border border-[#ead8ca] bg-[#f3eee6]">
                    <Cabinet3DCardPreview configuration={configuration} className="absolute inset-0 size-full" />
                    <div className="absolute left-3 top-3 rounded-md border border-white/60 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#735b2d] shadow-sm">
                      {suggestion.generatedByAi ? "Đề xuất AI" : index === 0 ? "Phù hợp nhất" : `Gợi ý ${index + 1}`}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold text-[#231a11]">{suggestion.label}</h2>
                      <span className="rounded-full bg-[#fcdba1] px-3 py-1 text-xs font-bold text-[#735b2d]">
                        {suggestion.generatedByAi ? "AI" : `${suggestion.confidence}%`}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#52443a]">{configuration.requestDetails?.usage ?? suggestion.requestDetails.usage}</p>
                  </div>

                  <div className="rounded-lg bg-[#fffaf6] p-3 text-sm leading-6 text-[#735b2d]">
                    <p className="font-semibold text-[#231a11]">{suggestion.generatedByAi ? "Tạo theo mô tả" : "Từ khóa khớp"}</p>
                    <p className="mt-1">{suggestion.generatedByAi ? "Gemini đã dựng mẫu riêng từ prompt chính." : matchedText}</p>
                  </div>

                  <Link to={configuratorPath} onClick={() => onApplySuggestion(suggestion, prompt)}>
                    <Button className="w-full bg-[#854f19] hover:bg-[#7a4a22]">
                      <Wand2 />
                      Chọn và chỉnh chi tiết
                      <ArrowRight />
                    </Button>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d7c3b5] bg-[#fffaf6] px-5 py-6 text-sm leading-6 text-[#735b2d]">
          Chưa hiển thị mẫu trước khi trò chuyện. Sau khi anh chị gửi đủ nhu cầu hoặc bấm “Tạo mẫu ngay”, mẫu phù hợp sẽ tự hiện ra.
        </div>
      )}
    </section>
  )
}

export default DashboardDesignAssistant
