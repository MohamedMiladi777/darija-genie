const VOCHAI_BASE_URL =
  process.env.VOCHAI_BASE_URL ?? "https://aui-transcription-api.fly.dev/api/v1"
const vochaiApiKey = process.env.VOCHAI_API_KEY ?? process.env.VOCHAI_TOKEN

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
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

async function uploadAudio(file: File, token: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file, file.name || "geniechat-recording.webm")

  const uploadResponse = await fetch(`${VOCHAI_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    signal: AbortSignal.timeout(120_000),
  })
  const uploadPayload = await readJson(uploadResponse)

  if (!uploadResponse.ok) {
    throw new Error(
      getErrorMessage(uploadPayload, "Vochai could not upload the recording.")
    )
  }

  if (!isRecord(uploadPayload) || typeof uploadPayload.audio_uri !== "string") {
    throw new Error("Vochai upload response is invalid.")
  }

  return uploadPayload.audio_uri
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
    throw new Error(
      getErrorMessage(
        transcribePayload,
        "Vochai could not transcribe the recording."
      )
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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json(
      { error: "Request body must be valid multipart form data." },
      { status: 400 }
    )
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return Response.json(
      { error: "Audio file is required in the 'file' field." },
      { status: 400 }
    )
  }

  if (file.size === 0) {
    return Response.json(
      { error: "The audio file is empty." },
      { status: 400 }
    )
  }

  try {
    const audioUri = await uploadAudio(file, vochaiApiKey)
    const result = await transcribeAudio(audioUri, vochaiApiKey)
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
