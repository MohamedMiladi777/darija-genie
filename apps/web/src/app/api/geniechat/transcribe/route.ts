const VOCHAI_BASE_URL =
  process.env.VOCHAI_BASE_URL ?? "https://aui-transcription-api.fly.dev/api/v1"
const vochaiApiKey = process.env.VOCHAI_API_KEY ?? process.env.VOCHAI_TOKEN

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

/** Vochai HTTP failure carrying the status (and Retry-After when 429). */
class VochaiHttpError extends Error {
  status: number
  retryAfterMs: number

  constructor(message: string, status: number, retryAfterMs: number) {
    super(message)
    this.status = status
    this.retryAfterMs = retryAfterMs
  }
}

// Per Vochai docs: retry only 429 (after Retry-After), 500, 502, 504 —
// never other 4xx, and never while a request is still in flight.
const RETRYABLE_STATUSES = new Set([429, 500, 502, 504])

async function withRetries<T>(operation: () => Promise<T>): Promise<T> {
  const maxRetries = 2
  let attempt = 0
  for (;;) {
    try {
      return await operation()
    } catch (error) {
      const retryable =
        error instanceof VochaiHttpError &&
        RETRYABLE_STATUSES.has(error.status) &&
        attempt < maxRetries
      if (!retryable) throw error
      attempt += 1
      await new Promise((resolve) =>
        setTimeout(resolve, error.retryAfterMs || attempt * 1500)
      )
    }
  }
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null)
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback
  if (typeof payload.message === "string" && payload.message) return payload.message
  if (typeof payload.error === "string" && payload.error) return payload.error
  return fallback
}

async function transcribeAudio(
  audioUri: string,
  token: string
): Promise<{
  transcript: string
  durationSeconds: number | null
  processingTime: number | null
}> {
  const transcribeResponse = await fetch(`${VOCHAI_BASE_URL}/transcribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audio_uri: audioUri }),
    signal: AbortSignal.timeout(600_000),
  })
  const transcribePayload = await readJson(transcribeResponse)

  if (!transcribeResponse.ok) {
    throw new VochaiHttpError(
      getErrorMessage(
        transcribePayload,
        "Vochai could not transcribe the recording."
      ),
      transcribeResponse.status,
      // Retry-After is in seconds per the HTTP spec
      (Number(transcribeResponse.headers.get("Retry-After")) || 0) * 1000
    )
  }

  if (
    !isRecord(transcribePayload) ||
    typeof transcribePayload.transcript !== "string"
  ) {
    throw new Error("Vochai transcription response is invalid.")
  }

  return {
    transcript: transcribePayload.transcript,
    durationSeconds:
      typeof transcribePayload.duration_seconds === "number"
        ? transcribePayload.duration_seconds
        : null,
    processingTime:
      typeof transcribePayload.processing_time === "number"
        ? transcribePayload.processing_time
        : null,
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!vochaiApiKey) {
    return Response.json(
      { error: "VOCHAI_API_KEY is not configured on the server." },
      { status: 503 }
    )
  }

  // Fast path: stream the browser's multipart body straight to Vochai
  // instead of formData()-parsing and re-encoding it (saves ~0.5s/call).
  // Vochai expects the same multipart shape ("file" field) the client sends.
  const contentType = request.headers.get("content-type")
  if (!contentType?.includes("multipart/form-data") || !request.body) {
    return Response.json(
      { error: "Request body must be valid multipart form data with a 'file' field." },
      { status: 400 }
    )
  }

  try {
    const uploadResponse = await fetch(`${VOCHAI_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vochaiApiKey}`,
        "Content-Type": contentType,
      },
      body: request.body,
      // @ts-expect-error -- `duplex` is required for streaming request bodies
      // but missing from TypeScript's RequestInit types.
      duplex: "half",
      signal: AbortSignal.timeout(120_000),
    })
    const uploadPayload = await readJson(uploadResponse)

    if (!uploadResponse.ok) {
      // Empty/oversized/unsupported files surface here with Vochai's message.
      throw new Error(
        getErrorMessage(uploadPayload, "Vochai could not upload the recording.")
      )
    }

    if (!isRecord(uploadPayload) || typeof uploadPayload.audio_uri !== "string") {
      throw new Error("Vochai upload response is invalid.")
    }

    const audioUri: string = uploadPayload.audio_uri
    const result = await withRetries(() => transcribeAudio(audioUri, vochaiApiKey))
    return Response.json({ audioUri, ...result })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError"
    const message =
      error instanceof Error ? error.message : "Vochai is unavailable."

    return Response.json(
      { error: isTimeout ? "Vochai took too long to respond." : message },
      { status: isTimeout ? 504 : 502 }
    )
  }
}
