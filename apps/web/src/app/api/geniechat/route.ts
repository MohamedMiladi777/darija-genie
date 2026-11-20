import { GENIECHAT_SYSTEM_PROMPT } from "@/lib/geniechat-system-prompt"
import { loadValueBankPrompt } from "@/lib/value-bank"

export const runtime = "nodejs"
export const maxDuration = 60

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

const geminiApiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.GEMINI_API_KEY
const geminiModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
const hasGeminiCredentials = Boolean(geminiApiKey)
const hasCredentials = usesOpenAiProvider
  ? hasOpenAiCredentials
  : hasGeminiCredentials

const DEFAULT_SCENARIO_SLUG = "restaurant"
const MAX_HISTORY_ENTRIES = 120
const MAX_HISTORY_ENTRY_LENGTH = 4_000

class ProviderHttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

function withValueBankPrompt(basePrompt: string, valueBankPrompt: string | null): string {
  if (!valueBankPrompt) return basePrompt
  return `${basePrompt}\n\n${valueBankPrompt}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isHistory(value: unknown): value is HistoryEntry[] {
  if (!Array.isArray(value) || value.length > MAX_HISTORY_ENTRIES) return false
  let previousRole: "assistant" | "user" | null = null

  return value.every((entry) => {
    if (!isRecord(entry) || Object.keys(entry).length !== 1) return false
    if (isRecord(entry.assistant)) {
      const valid =
        previousRole !== "assistant" &&
        typeof entry.assistant.utterance === "string" &&
        entry.assistant.utterance.length <= MAX_HISTORY_ENTRY_LENGTH &&
        isRecord(entry.assistant.slots)
      if (valid) previousRole = "assistant"
      return valid
    }
    if (isRecord(entry.user)) {
      const valid =
        previousRole !== "user" &&
        typeof entry.user.utterance === "string" &&
        entry.user.utterance.length <= MAX_HISTORY_ENTRY_LENGTH
      if (valid) previousRole = "user"
      return valid
    }
    return false
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

function compactHistory(history: HistoryEntry[]): HistoryEntry[] {
  // Keep the latest 20 turns in the provider request. The browser may retain a
  // longer transcript; slot state remains represented in each assistant entry.
  let recent = history.slice(-40)
  if (recent.length > 0 && "user" in recent[0]!) recent = recent.slice(1)
  return recent.map((entry) =>
    "user" in entry
      ? { user: { utterance: entry.user.utterance.slice(-1_500) } }
      : {
          assistant: {
            utterance: entry.assistant.utterance.slice(-2_000),
            slots: entry.assistant.slots,
          },
        }
  )
}

async function runGeminiAgent(history: HistoryEntry[], systemPrompt: string): Promise<string> {
  if (!geminiApiKey) throw new Error("GOOGLE_GENAI_API_KEY is not configured.")

  const prompt = `INPUT:\n${JSON.stringify(compactHistory(history))}\nEnd of input.`
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.45, maxOutputTokens: 1024 },
        }),
        signal: AbortSignal.timeout(25_000),
      })
      const payload: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        const message =
          isRecord(payload) &&
          isRecord(payload.error) &&
          typeof payload.error.message === "string"
            ? payload.error.message
            : `Gemini request failed (${response.status}).`
        const transient = response.status === 429 || response.status >= 500
        if (transient && attempt < 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          lastError = new Error(message)
          continue
        }
        throw new ProviderHttpError(message, response.status)
      }

      if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
        throw new Error("Gemini returned an invalid response.")
      }
      const firstCandidate = payload.candidates[0]
      const content =
        isRecord(firstCandidate) && isRecord(firstCandidate.content)
          ? firstCandidate.content
          : null
      const parts = content && Array.isArray(content.parts) ? content.parts : []
      const text = parts
        .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim()
      if (!text) {
        const reason =
          isRecord(firstCandidate) && typeof firstCandidate.finishReason === "string"
            ? firstCandidate.finishReason
            : "unknown"
        throw new Error(`Gemini returned no text (finish reason: ${reason}).`)
      }
      return text
    } catch (error) {
      lastError = error
      const retryable =
        (error instanceof Error &&
          error.name !== "TimeoutError" &&
          error.name !== "AbortError" &&
          /fetch failed|ECONNRESET|ETIMEDOUT|UNAVAILABLE|overloaded|RESOURCE_EXHAUSTED/i.test(
            error.message
          ))
      if (retryable && attempt < 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        continue
      }
      throw error
    }
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
          content: `INPUT:\n${JSON.stringify(compactHistory(history))}\nEnd of input.`,
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
      throw new ProviderHttpError(payload.error.message, response.status)
    }
    throw new ProviderHttpError("GPT is unavailable.", response.status)
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

  return runGeminiAgent(history, systemPrompt)
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
        error:
          "GOOGLE_GENAI_API_KEY is not configured on the server. Add it to Vercel Project Settings → Environment Variables, then redeploy.",
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
  const history = body.history.slice(-MAX_HISTORY_ENTRIES)

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
    const timedOut =
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    const upstreamBusy =
      error instanceof ProviderHttpError &&
      (error.status === 429 || error.status === 503)
    return Response.json(
      {
        error: timedOut
          ? usesOpenAiProvider
            ? "GPT took too long to respond."
            : "Gemini took too long to respond."
          : message,
      },
      { status: timedOut ? 504 : upstreamBusy ? 503 : 502 }
    )
  }
}

/** A safe deployment diagnostic: reports configuration state, never secrets. */
export function GET(): Response {
  const provider = usesOpenAiProvider ? "openai" : "gemini"
  const configured = usesOpenAiProvider
    ? hasOpenAiCredentials
    : hasGeminiCredentials
  return Response.json(
    {
      ok: configured,
      provider,
      configured,
      model: usesOpenAiProvider ? openAiModel : geminiModel,
      message: configured
        ? "GenieChat API is configured."
        : `Missing ${usesOpenAiProvider ? "OPENAI_API_KEY" : "GOOGLE_GENAI_API_KEY"} in the Vercel project environment.`,
    },
    { status: configured ? 200 : 503 }
  )
}
