import {
  InMemoryRunner,
  isFinalResponse,
  LlmAgent,
  stringifyContent,
} from "@google/adk"

import { GENIECHAT_SYSTEM_PROMPT } from "@/lib/geniechat-system-prompt"

type SlotState = Record<string, unknown>
type HistoryEntry =
  | { assistant: { utterance: string; slots: SlotState } }
  | { user: { utterance: string } }

const usesVertexAi = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true"
const apiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.GEMINI_API_KEY
const hasCredentials = usesVertexAi
  ? Boolean(
      process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION
    )
  : Boolean(apiKey)

if (!usesVertexAi && apiKey && !process.env.GOOGLE_GENAI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = apiKey
}

const agent = new LlmAgent({
  name: "darija_genie",
  description: "A Moroccan Darija restaurant conversation tutor.",
  model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  instruction: GENIECHAT_SYSTEM_PROMPT,
  generateContentConfig: {
    temperature: 0.45,
    maxOutputTokens: 1024,
  },
})
const runner = new InMemoryRunner({ agent, appName: "darija_genie" })

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isHistory(value: unknown): value is HistoryEntry[] {
  if (!Array.isArray(value) || value.length > 50) return false
  return value.every((entry, index) => {
    if (!isRecord(entry) || Object.keys(entry).length !== 1) return false
    if (index % 2 === 0) {
      const assistant = entry.assistant
      return (
        isRecord(assistant) &&
        typeof assistant.utterance === "string" &&
        isRecord(assistant.slots)
      )
    }
    const user = entry.user
    return isRecord(user) && typeof user.utterance === "string"
  })
}

function parseReply(rawReply: string): { assistant: string; slots: SlotState } {
  const marker = /(?:^|\n)\s*(?:SLOT_STATE_JSON|SLOT_STATE|SLOT_JSON)\s*:?\s*/i
  const match = marker.exec(rawReply)
  const assistantBlock = match ? rawReply.slice(0, match.index) : rawReply
  const assistant = assistantBlock
    .replace(/^\s*(?:#+\s*)?\**\s*ASSISTANT\s*\**\s*:?\s*/i, "")
    .trim()

  if (!assistant)
    throw new Error("Gemini response is missing an assistant utterance.")
  if (!match) return { assistant, slots: {} }

  const slotBlock = rawReply
    .slice(match.index + match[0].length)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
  const start = slotBlock.indexOf("{")
  const end = slotBlock.lastIndexOf("}")
  if (start < 0 || end < start) return { assistant, slots: {} }

  try {
    const parsed: unknown = JSON.parse(slotBlock.slice(start, end + 1))
    if (!isRecord(parsed)) return { assistant, slots: {} }
    return { assistant, slots: isRecord(parsed.slots) ? parsed.slots : parsed }
  } catch {
    return { assistant, slots: {} }
  }
}

async function runAgent(history: HistoryEntry[]): Promise<string> {
  let finalText = ""
  for await (const event of runner.runEphemeral({
    userId: crypto.randomUUID(),
    newMessage: {
      role: "user",
      parts: [{ text: `INPUT:\n${JSON.stringify(history)}\nEnd of input.` }],
    },
  })) {
    if (event.errorMessage) throw new Error(event.errorMessage)
    if (isFinalResponse(event)) {
      const text = stringifyContent(event).trim()
      if (text) finalText = text
    }
  }

  return finalText
}

export async function POST(request: Request): Promise<Response> {
  if (!hasCredentials) {
    return Response.json(
      {
        error: usesVertexAi
          ? "GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION must be configured on the server."
          : "GOOGLE_GENAI_API_KEY is not configured on the server.",
      },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    )
  }
  if (!isRecord(body) || !isHistory(body.history)) {
    return Response.json(
      { error: "Invalid conversation history." },
      { status: 400 }
    )
  }

  try {
    const rawReply = await runAgent(body.history)
    if (!rawReply) {
      return Response.json(
        { error: "Gemini returned an empty response." },
        { status: 502 }
      )
    }
    return Response.json(parseReply(rawReply))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini is unavailable."
    const timedOut = error instanceof Error && error.name === "AbortError"
    return Response.json(
      { error: timedOut ? "Gemini took too long to respond." : message },
      { status: timedOut ? 504 : 502 }
    )
  }
}
