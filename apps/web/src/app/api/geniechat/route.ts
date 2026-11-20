import {
  InMemoryRunner,
  isFinalResponse,
  LlmAgent,
  stringifyContent,
} from "@google/adk"

import { GENIECHAT_SYSTEM_PROMPT } from "@/lib/geniechat-system-prompt"
import { loadValueBankPrompt } from "@/lib/value-bank"

type SlotState = Record<string, unknown>
type HistoryEntry =
  | { assistant: { utterance: string; slots: SlotState } }
  | { user: { utterance: string } }

type ParsedReply = {
  assistant: string
  translation: string
  slots: SlotState
}

const llmProvider = (process.env.GENIECHAT_PROVIDER ?? "gemini").toLowerCase()
const usesOpenAiProvider = llmProvider === "openai" || llmProvider === "gpt"

const openAiApiKey = process.env.OPENAI_API_KEY ?? process.env.GPT_API_KEY
const openAiBaseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
  /\/+$/,
  ""
)
const openAiModel = process.env.OPENAI_MODEL ?? process.env.GPT_MODEL ?? "gpt-4o-mini"
const hasOpenAiCredentials = Boolean(openAiApiKey)

const usesVertexAi = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true"
const apiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.GEMINI_API_KEY
const hasApiKey = Boolean(apiKey)
const hasVertexTarget = Boolean(
  process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION
)
const hasLocalVertexCredentials = Boolean(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
)
const runningOnGoogleInfra = Boolean(
  process.env.K_SERVICE ||
    process.env.FUNCTION_TARGET ||
    process.env.GAE_SERVICE ||
    process.env.CLOUD_RUN_JOB
)
const vertexReady =
  usesVertexAi && hasVertexTarget && (hasLocalVertexCredentials || runningOnGoogleInfra)

if (apiKey && !process.env.GOOGLE_GENAI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = apiKey
}

if (!vertexReady) {
  process.env.GOOGLE_GENAI_USE_VERTEXAI = "false"
}

const hasGeminiCredentials = vertexReady || hasApiKey
const hasCredentials = usesOpenAiProvider
  ? hasOpenAiCredentials
  : hasGeminiCredentials

const DEFAULT_SCENARIO_SLUG = "restaurant"

function withValueBankPrompt(basePrompt: string, valueBankPrompt: string | null): string {
  if (!valueBankPrompt) return basePrompt
  return `${basePrompt}\n\n${valueBankPrompt}`
}

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

function parseReply(rawReply: string): ParsedReply {
  const translationMarker =
    /(?:^|\n)\s*(?:ENGLISH_TRANSLATION|TRANSLATION)\s*:?\s*/i
  const slotMarker =
    /(?:^|\n)\s*(?:SLOT_STATE_JSON|SLOT_STATE|SLOT_JSON)\s*:?\s*/i
  const translationMatch = translationMarker.exec(rawReply)
  const slotMatch = slotMarker.exec(rawReply)
  const assistantEnd = Math.min(
    translationMatch?.index ?? rawReply.length,
    slotMatch?.index ?? rawReply.length
  )
  let assistant = rawReply
    .slice(0, assistantEnd)
    .replace(/^\s*(?:#+\s*)?\**\s*ASSISTANT\s*\**\s*:?\s*/i, "")
    .trim()

  if (!assistant) {
    throw new Error("Gemini response is missing an assistant utterance.")
  }

  const translation = translationMatch
    ? rawReply
        .slice(
          translationMatch.index + translationMatch[0].length,
          slotMatch?.index ?? rawReply.length
        )
        .trim()
    : ""

  if (!slotMatch) {
    assistant = assistant
      .replace(/```(?:json)?[\s\S]*?```/gi, "")
      .replace(/\{[\s\S]*\}\s*$/g, "")
      .trim()
    return { assistant, translation, slots: {} }
  }

  const slotBlock = rawReply
    .slice(slotMatch.index + slotMatch[0].length)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
  const start = slotBlock.indexOf("{")
  const end = slotBlock.lastIndexOf("}")
  if (start < 0 || end < start) return { assistant, translation, slots: {} }

  try {
    const rawJson = slotBlock.slice(start, end + 1)
    const parsed: unknown = JSON.parse(rawJson)
    if (!isRecord(parsed)) return { assistant, translation, slots: {} }
    assistant = assistant.replace(rawJson, "").trim()
    if (!assistant) assistant = "سمحو ليا، نكمل معاكم الطلب خطوة بخطوة."
    return {
      assistant,
      translation,
      slots: isRecord(parsed.slots) ? parsed.slots : parsed,
    }
  } catch {
    return { assistant, translation, slots: {} }
  }
}

const DEFAULT_SLOTS = {
  greeting: null,
  guest_name: null,
  party_size: null,
  seating: null,
  diet: null,
  food_category: null,
  dish: null,
  portion: null,
  drink: null,
  special_requests: null,
  wait_time: null,
  confirmation: null,
  payment: null,
  split_bill: null,
  closing: null,
} as const

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value
  if (typeof value !== "string") return null
  const match = value.match(/\d+/)
  if (!match) return null
  const parsed = Number.parseInt(match[0], 10)
  return Number.isInteger(parsed) ? parsed : null
}

function normalizeNone(value: string | null): string | null {
  if (!value) return null
  if (/^(walou|walo|none|nope)$/i.test(value)) return "والو"
  if (/^(ما?كاينش|بلا)$/i.test(value)) return "والو"
  return value
}

function normalizePayment(value: string | null): string | null {
  if (!value) return null
  if (/(cash|كاش|ليسب|ليسپ|esp[eè]ce)/i.test(value)) return "كاش"
  if (/(card|carte|كارط|بطاقة)/i.test(value)) return "بالاكارط"
  return value.replace(/\bب\s+(?=[\u0600-\u06FF])/g, "ب")
}

function normalizeSplitBill(value: string | null, userUtterance: string | null): string | null {
  const user = userUtterance ?? ""
  if (/(^|\s)(ana|أنا)\b/i.test(user) && /(khal[il]?s|n[kg]h?al?l?is|نخلص)/i.test(user)) {
    return "مجموعين"
  }
  if (!value) return null
  if (/(separate|كل واحد|بوحدو)/i.test(value)) return "كل واحد بوحدو"
  if (/(together|group|مجموع|مع بعض|أنا نخلص)/i.test(value)) return "مجموعين"
  return value
}

function normalizeFoodCategory(value: string | null): string | null {
  if (!value) return null
  if (/(bjouj|bijouj|both|بجوج|بزوج)/i.test(value)) return "بجوج"
  return value
}

function isAffirmative(text: string | null): boolean {
  if (!text) return false
  return /^(ok|okay|yes|yeah|yep|ah|eh|oui|safi|wakha|واخا|ايوا|نعم|آه)\b/i.test(
    text.trim()
  )
}

function getLatestAssistantSlots(history: HistoryEntry[]): SlotState {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i]
    if (!entry) continue
    if ("assistant" in entry && isRecord(entry.assistant.slots)) {
      return entry.assistant.slots
    }
  }
  return {}
}

function getLatestUserUtterance(history: HistoryEntry[]): string | null {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i]
    if (!entry) continue
    if ("user" in entry) return entry.user.utterance
  }
  return null
}

function normalizeSlots(
  previousSlots: SlotState,
  nextSlots: SlotState,
  latestUserUtterance: string | null
): SlotState {
  const merged: SlotState = { ...previousSlots, ...nextSlots }

  const normalized: SlotState = { ...DEFAULT_SLOTS }
  normalized.greeting = asText(merged.greeting)
  normalized.guest_name = asText(merged.guest_name)
  normalized.party_size = parseInteger(merged.party_size)
  normalized.seating = asText(merged.seating)
  normalized.diet = normalizeNone(asText(merged.diet))
  normalized.food_category = normalizeFoodCategory(asText(merged.food_category))
  normalized.dish = asText(merged.dish)
  normalized.portion = asText(merged.portion)
  normalized.drink = normalizeNone(asText(merged.drink))
  normalized.special_requests = normalizeNone(asText(merged.special_requests))
  normalized.wait_time = asText(merged.wait_time)

  const confirmation = asText(merged.confirmation)
  normalized.confirmation =
    confirmation === "confirmed" || confirmation === "not_confirmed" ? confirmation : null
  if (normalized.confirmation === "not_confirmed" && isAffirmative(latestUserUtterance)) {
    normalized.confirmation = "confirmed"
  }

  normalized.payment = normalizePayment(asText(merged.payment))
  normalized.split_bill = normalizeSplitBill(asText(merged.split_bill), latestUserUtterance)
  normalized.closing = asText(merged.closing)

  if (normalized.payment && normalized.split_bill) {
    normalized.confirmation = "confirmed"
  }

  return normalized
}

async function runAgent(history: HistoryEntry[], systemPrompt: string): Promise<string> {
  const agent = new LlmAgent({
    name: "darija_genie",
    description: "A Moroccan Darija restaurant conversation tutor.",
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    instruction: systemPrompt,
    generateContentConfig: {
      temperature: 0.45,
      maxOutputTokens: 1024,
    },
  })
  const runner = new InMemoryRunner({ agent, appName: "darija_genie" })
  const maxAttempts = 3
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let finalText = ""
    try {
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
    } catch (error) {
      lastError = error
      // Brand-new models (e.g. gemini-3.8-flash) can return transient
      // "high demand" 503s — retry briefly before surfacing the failure.
      const message = error instanceof Error ? error.message : ""
      const transient =
        /high demand|UNAVAILABLE|overloaded|RESOURCE_EXHAUSTED/i.test(message)
      if (transient && attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
        continue
      }
      throw error
    }

    return finalText
  }

  throw lastError
}

async function runOpenAiAgent(history: HistoryEntry[], systemPrompt: string): Promise<string> {
  const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: openAiModel,
      temperature: 0.45,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `INPUT:\n${JSON.stringify(history)}\nEnd of input.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (
      isRecord(payload) &&
      isRecord(payload.error) &&
      typeof payload.error.message === "string"
    ) {
      throw new Error(payload.error.message)
    }
    throw new Error("GPT is unavailable.")
  }

  if (!isRecord(payload) || !Array.isArray(payload.choices) || payload.choices.length === 0) {
    throw new Error("GPT returned an invalid response.")
  }

  const firstChoice = payload.choices[0]
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new Error("GPT returned an invalid message payload.")
  }

  const content = firstChoice.message.content
  if (typeof content === "string" && content.trim()) {
    return content.trim()
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (isRecord(part) && typeof part.text === "string") return part.text
        return ""
      })
      .join("")
      .trim()

    if (text) return text
  }

  throw new Error("GPT returned an empty response.")
}

async function runWithProvider(history: HistoryEntry[], systemPrompt: string): Promise<string> {
  if (usesOpenAiProvider) {
    return runOpenAiAgent(history, systemPrompt)
  }

  return runAgent(history, systemPrompt)
}

export async function POST(request: Request): Promise<Response> {
  if (!hasCredentials) {
    if (usesOpenAiProvider) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is not configured on the server. Set OPENAI_API_KEY (or GPT_API_KEY) when GENIECHAT_PROVIDER=openai.",
        },
        { status: 503 }
      )
    }

    return Response.json(
      {
        error: usesVertexAi
          ? "Vertex AI is enabled but no local ADC credentials were found. Set GOOGLE_APPLICATION_CREDENTIALS, or switch to API key mode by setting GOOGLE_GENAI_USE_VERTEXAI=false and GOOGLE_GENAI_API_KEY."
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
  const history = body.history

  try {
    const valueBankPrompt = await loadValueBankPrompt(DEFAULT_SCENARIO_SLUG)
    const systemPrompt = withValueBankPrompt(
      GENIECHAT_SYSTEM_PROMPT,
      valueBankPrompt
    )
    const rawReply = await runWithProvider(history, systemPrompt)
    if (!rawReply) {
      return Response.json(
        {
          error: usesOpenAiProvider
            ? "GPT returned an empty response."
            : "Gemini returned an empty response.",
        },
        { status: 502 }
      )
    }
    const parsed = parseReply(rawReply)
    const slots = normalizeSlots(
      getLatestAssistantSlots(history),
      parsed.slots,
      getLatestUserUtterance(history)
    )
    return Response.json({ ...parsed, slots })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : usesOpenAiProvider
          ? "GPT is unavailable."
          : "Gemini is unavailable."
    const timedOut = error instanceof Error && error.name === "AbortError"
    return Response.json(
      {
        error: timedOut
          ? usesOpenAiProvider
            ? "GPT took too long to respond."
            : "Gemini took too long to respond."
          : message,
      },
      { status: timedOut ? 504 : 502 }
    )
  }
}
