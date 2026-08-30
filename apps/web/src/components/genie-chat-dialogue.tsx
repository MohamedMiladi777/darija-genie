"use client"

import { FormEvent, useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { LoaderCircle, RefreshCw, Send } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { useStoredPreference } from "@/components/preference-selector"

type SlotState = Record<string, unknown>
type HistoryEntry =
  | { assistant: { utterance: string; slots: SlotState } }
  | { user: { utterance: string } }

type Message = {
  id: number
  sender: "assistant" | "user"
  text: string
  translation?: string
  timestamp: Date
}

type ChatReply = { assistant: string; translation: string; slots: SlotState }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

async function requestReply(history: HistoryEntry[]): Promise<ChatReply> {
  const response = await fetch("/api/geniechat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history }),
  })
  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Unable to reach GenieChat."
    )
  }

  if (!isRecord(payload) || typeof payload.assistant !== "string") {
    throw new Error("GenieChat returned an invalid response.")
  }

  return {
    assistant: payload.assistant,
    translation:
      typeof payload.translation === "string" ? payload.translation : "",
    slots: isRecord(payload.slots) ? payload.slots : {},
  }
}

function ScenarioCard({ scenario }: { scenario: string }): React.JSX.Element {
  const shopping = scenario.startsWith("shopping")

  return (
    <Card className="gap-0 overflow-hidden rounded-[14px] bg-card py-0 shadow-none ring-border md:rounded-2xl">
      <div className="relative h-[140px] w-full md:h-44">
        <Image
          src={
            shopping
              ? "/assets/scenarios/shopping.jpg"
              : "/assets/genie-chat/restaurant.jpg"
          }
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 672px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex min-h-16 flex-col justify-center border-t border-border px-3 py-2 font-[family-name:var(--font-inter)]">
        <h2 className="text-sm leading-5 font-medium text-foreground">
          {shopping ? "Shopping Scenario" : "Restaurant Scenario"}
        </h2>
        <p className="pt-0.5 text-xs leading-4 text-muted-foreground">
          {shopping
            ? "Practice shopping and conversing in a Moroccan souk"
            : "Practice ordering and conversing at a restaurant"}
        </p>
      </div>
    </Card>
  )
}

function MessageBubble({ message }: { message: Message }): React.JSX.Element {
  const [showTranslation, setShowTranslation] = useState(false)
  const fontSize = useStoredPreference("darija-genie:font-size", "medium")
  const messageSize =
    fontSize === "large"
      ? "text-xl leading-9"
      : fontSize === "small"
        ? "text-base leading-7"
        : "text-lg leading-8"
  const assistant = message.sender === "assistant"
  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <article
      className={`flex items-end gap-2.5 ${assistant ? "" : "justify-end"}`}
    >
      {assistant ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#162456] pb-px font-[family-name:var(--font-inter)] text-xs font-bold text-[#f2efe4]">
          S
        </div>
      ) : null}
      <div
        className={`max-w-[85%] min-w-0 font-[family-name:var(--font-inter)] sm:max-w-[75%] ${assistant ? "" : "text-right"}`}
      >
        <p className="px-1 text-[10px] leading-[15px] text-muted-foreground/70">
          {assistant ? "Server" : "You"}
        </p>
        <div
          className={`mt-1.5 px-4 py-2.5 shadow-xs ${
            assistant
              ? "rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-border bg-card text-foreground"
              : "rounded-t-2xl rounded-br-sm rounded-bl-2xl bg-[#162456] text-white"
          }`}
        >
          <p
            className={`text-left font-[family-name:var(--font-simplified-arabic)] break-words ${messageSize}`}
            dir="auto"
          >
            {message.text}
          </p>
        </div>
        {assistant ? (
          <div className="px-1 pt-2">
            <button
              type="button"
              aria-expanded={showTranslation}
              onClick={() => setShowTranslation((visible) => !visible)}
              className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-xs font-medium text-[#1e40af] hover:underline dark:text-[#8fc6ff]"
            >
              <Image
                src="/assets/genie-chat/translate.svg"
                alt=""
                width={14}
                height={14}
                className="size-3.5 dark:brightness-0 dark:invert"
              />
              {showTranslation ? "Hide translation" : "Translate"}
            </button>
            {showTranslation ? (
              <p
                className="mt-2 rounded-xl border border-border bg-muted px-3 py-2 font-[family-name:var(--font-inter)] text-sm leading-6 text-foreground"
                dir="ltr"
              >
                {message.translation || "Translation unavailable."}
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="px-1 pt-1.5 text-[10px] leading-[15px] text-muted-foreground/70">
          {time}
        </p>
      </div>
    </article>
  )
}

export default function GenieChatDialogue({
  scenario,
}: {
  scenario: string
}): React.JSX.Element {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const nextId = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)

  const createMessage = useCallback(
    (
      sender: Message["sender"],
      text: string,
      translation?: string
    ): Message => ({
      id: nextId.current++,
      sender,
      text,
      translation,
      timestamp: new Date(),
    }),
    []
  )

  const initialize = useCallback(async () => {
    setLoading(true)
    setError(null)
    setHistory([])
    setMessages([])

    try {
      const reply = await requestReply([])
      setHistory([
        { assistant: { utterance: reply.assistant, slots: reply.slots } },
      ])
      setMessages([
        createMessage("assistant", reply.assistant, reply.translation),
      ])
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to start GenieChat."
      )
    } finally {
      setLoading(false)
    }
  }, [createMessage])

  useEffect(() => {
    const timer = window.setTimeout(() => void initialize(), 0)
    return () => window.clearTimeout(timer)
  }, [initialize])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, loading])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || loading || history.length === 0) return

    const previousHistory = history
    const userTurn: HistoryEntry = { user: { utterance: text } }
    const nextHistory = [...history, userTurn]

    setInput("")
    setError(null)
    setLoading(true)
    setHistory(nextHistory)
    setMessages((current) => [...current, createMessage("user", text)])

    try {
      const reply = await requestReply(nextHistory)
      const assistantTurn: HistoryEntry = {
        assistant: { utterance: reply.assistant, slots: reply.slots },
      }
      setHistory((current) => [...current, assistantTurn])
      setMessages((current) => [
        ...current,
        createMessage("assistant", reply.assistant, reply.translation),
      ])
    } catch (caught) {
      setHistory(previousHistory)
      setError(
        caught instanceof Error ? caught.message : "Unable to retrieve a reply."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-5"
        aria-live="polite"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <ScenarioCard scenario={scenario} />
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading ? (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#162456] text-[#f2efe4]">
                S
              </span>
              <span className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs">
                <LoaderCircle className="size-4 animate-spin" /> Genie is
                thinking
              </span>
            </div>
          ) : null}
          {error ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
            >
              <span>{error}</span>
              {history.length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void initialize()}
                  className="shrink-0"
                >
                  <RefreshCw className="size-3.5" /> Retry
                </Button>
              ) : null}
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-card px-4 py-3">
        <form
          onSubmit={sendMessage}
          className="mx-auto flex w-full max-w-2xl items-end gap-2"
        >
          <label htmlFor="geniechat-message" className="sr-only">
            Message GenieChat
          </label>
          <textarea
            id="geniechat-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Write your response..."
            rows={1}
            disabled={loading || history.length === 0}
            className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 font-[family-name:var(--font-simplified-arabic)] text-base leading-7 text-foreground outline-none placeholder:text-muted-foreground focus:border-[#1447e6] focus:ring-2 focus:ring-[#1447e6]/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={loading || !input.trim() || history.length === 0}
            className="size-10 rounded-xl bg-[#162456] text-white hover:bg-[#1e40af]"
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </footer>
    </>
  )
}
