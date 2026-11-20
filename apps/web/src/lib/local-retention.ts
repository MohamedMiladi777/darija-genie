"use client"

type SlotState = Record<string, unknown>

type HistoryEntry =
  | { assistant: { utterance: string; slots: SlotState } }
  | { user: { utterance: string } }

type StoredMessage = {
  id: number
  sender: "assistant" | "user"
  text: string
  translation?: string
  timestamp: string
}

type RestaurantChatSnapshotV1 = {
  version: 1
  scenario: string
  sessionId: string
  updatedAt: string
  history: HistoryEntry[]
  messages: StoredMessage[]
  nextId: number
}

type ProfileSnapshotV1 = {
  version: 1
  updatedAt: string
  preferences: {
    script: string
    interactionModes: string
    fontSize: string
  }
}

export const PROFILE_STORAGE_KEY = "darija-genie:profile:v1"
export const RESTAURANT_CHAT_STORAGE_KEY = "darija-genie:restaurant-chat:v1"
export const QUIZ_PROGRESS_PREFIX = "darija-genie:quiz-progress:v1:"
export const LOCAL_RETENTION_CHANGE_EVENT = "darija-genie:local-retention-change"

export type QuizProgressSnapshotV1 = {
  version: 1
  scenario: string
  updatedAt: string
  state: Record<string, unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function saveProfileSnapshotFromLocalPreferences(): void {
  const snapshot: ProfileSnapshotV1 = {
    version: 1,
    updatedAt: nowIso(),
    preferences: {
      script: window.localStorage.getItem("darija-genie:text-script") ?? "latin",
      interactionModes:
        window.localStorage.getItem("darija-genie:interaction-modes") ?? "text",
      fontSize: window.localStorage.getItem("darija-genie:font-size") ?? "medium",
    },
  }
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(snapshot))
}

export function loadProfileSnapshot(): ProfileSnapshotV1 | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
  } catch {
    return null
  }
  const parsed = safeParse(raw)
  if (!isRecord(parsed)) return null
  if (parsed.version !== 1) return null
  if (!isRecord(parsed.preferences)) return null
  if (
    typeof parsed.preferences.script !== "string" ||
    typeof parsed.preferences.interactionModes !== "string" ||
    typeof parsed.preferences.fontSize !== "string"
  ) {
    return null
  }
  return {
    version: 1,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    preferences: {
      script: parsed.preferences.script,
      interactionModes: parsed.preferences.interactionModes,
      fontSize: parsed.preferences.fontSize,
    },
  }
}

export function loadRestaurantChatSnapshot(): RestaurantChatSnapshotV1 | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(RESTAURANT_CHAT_STORAGE_KEY)
  } catch {
    return null
  }
  const parsed = safeParse(raw)
  if (!isRecord(parsed) || parsed.version !== 1) return null
  if (
    typeof parsed.scenario !== "string" ||
    typeof parsed.sessionId !== "string" ||
    typeof parsed.updatedAt !== "string" ||
    !Array.isArray(parsed.history) ||
    !Array.isArray(parsed.messages) ||
    typeof parsed.nextId !== "number"
  ) {
    return null
  }

  const messages: StoredMessage[] = []
  for (const message of parsed.messages) {
    if (!isRecord(message)) continue
    if (
      typeof message.id !== "number" ||
      (message.sender !== "assistant" && message.sender !== "user") ||
      typeof message.text !== "string" ||
      typeof message.timestamp !== "string"
    ) {
      continue
    }
    messages.push({
      id: message.id,
      sender: message.sender,
      text: message.text,
      translation:
        typeof message.translation === "string" ? message.translation : undefined,
      timestamp: message.timestamp,
    })
  }

  const history: HistoryEntry[] = []
  for (const entry of parsed.history) {
    if (!isRecord(entry)) continue
    if ("assistant" in entry && isRecord(entry.assistant)) {
      const utterance =
        typeof entry.assistant.utterance === "string" ? entry.assistant.utterance : ""
      const slots = isRecord(entry.assistant.slots) ? entry.assistant.slots : {}
      history.push({ assistant: { utterance, slots } })
      continue
    }
    if ("user" in entry && isRecord(entry.user)) {
      const utterance = typeof entry.user.utterance === "string" ? entry.user.utterance : ""
      history.push({ user: { utterance } })
    }
  }

  if (history.length === 0 || messages.length === 0) return null

  return {
    version: 1,
    scenario: parsed.scenario,
    sessionId: parsed.sessionId,
    updatedAt: parsed.updatedAt,
    history,
    messages,
    nextId: Math.max(parsed.nextId, messages[messages.length - 1]?.id ?? 0),
  }
}

export function saveRestaurantChatSnapshot(params: {
  scenario: string
  sessionId?: string
  history: HistoryEntry[]
  messages: Array<{
    id: number
    sender: "assistant" | "user"
    text: string
    translation?: string
    timestamp: Date
  }>
  nextId: number
}): string {
  const sessionId = params.sessionId ?? createSessionId()
  const snapshot: RestaurantChatSnapshotV1 = {
    version: 1,
    scenario: params.scenario,
    sessionId,
    updatedAt: nowIso(),
    history: params.history.slice(-120),
    messages: params.messages.slice(-120).map((message) => ({
      id: message.id,
      sender: message.sender,
      text: message.text,
      translation: message.translation,
      timestamp: message.timestamp.toISOString(),
    })),
    nextId: params.nextId,
  }
  try {
    window.localStorage.setItem(RESTAURANT_CHAT_STORAGE_KEY, JSON.stringify(snapshot))
    window.dispatchEvent(new Event(LOCAL_RETENTION_CHANGE_EVENT))
  } catch {
    // The chat remains usable if browser storage is disabled or full.
  }
  return sessionId
}

export function getQuizProgressStorageKey(scenario: string): string {
  return `${QUIZ_PROGRESS_PREFIX}${scenario}`
}

export function loadQuizProgressSnapshot(
  scenario: string
): QuizProgressSnapshotV1 | null {
  const parsed = safeParse(
    window.localStorage.getItem(getQuizProgressStorageKey(scenario))
  )
  if (!isRecord(parsed) || parsed.version !== 1 || parsed.scenario !== scenario) {
    return null
  }
  if (typeof parsed.updatedAt !== "string" || !isRecord(parsed.state)) return null
  return {
    version: 1,
    scenario,
    updatedAt: parsed.updatedAt,
    state: parsed.state,
  }
}

export function saveQuizProgressSnapshot(
  scenario: string,
  state: Record<string, unknown>
): void {
  const snapshot: QuizProgressSnapshotV1 = {
    version: 1,
    scenario,
    updatedAt: nowIso(),
    state,
  }
  try {
    window.localStorage.setItem(
      getQuizProgressStorageKey(scenario),
      JSON.stringify(snapshot)
    )
    window.dispatchEvent(new Event(LOCAL_RETENTION_CHANGE_EVENT))
  } catch {
    // The quiz remains usable if browser storage is disabled or full.
  }
}

export function clearQuizProgressSnapshot(scenario: string): void {
  try {
    window.localStorage.removeItem(getQuizProgressStorageKey(scenario))
    window.dispatchEvent(new Event(LOCAL_RETENTION_CHANGE_EVENT))
  } catch {
    // Ignore unavailable storage.
  }
}

export function clearRestaurantChatSnapshot(): void {
  try {
    window.localStorage.removeItem(RESTAURANT_CHAT_STORAGE_KEY)
    window.dispatchEvent(new Event(LOCAL_RETENTION_CHANGE_EVENT))
  } catch {
    // Ignore unavailable storage.
  }
}

export function clearLocalProfileAndRestaurantChat(): void {
  clearRestaurantChatSnapshot()
  window.localStorage.removeItem(PROFILE_STORAGE_KEY)
}
