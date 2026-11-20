"use client"

import Link from "next/link"
import { useMemo, useState, useSyncExternalStore } from "react"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MicIcon,
  RestaurantIcon,
  ShoppingIcon,
  VolumeIcon,
} from "@/components/icons"
import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

type ExerciseKind = "build" | "complete" | "match" | "listen" | "speak" | "image"
type FeedbackState = "success" | "error" | null

type Exercise = {
  id: ExerciseKind
  title: string
  instruction: string
  correctAnswer: string
}

type ExerciseResult = {
  exerciseId: ExerciseKind
  title: string
  correct: boolean
  response: string
  correctAnswer: string
}

type QuizAttempt = {
  version: 1
  scenario: ScenarioId
  completedAt: string
  correctCount: number
  totalCount: number
  results: ExerciseResult[]
}

const QUIZ_ATTEMPTS_KEY = "darija-genie:quiz-attempts:v1"
const QUIZ_ATTEMPTS_CHANGE_EVENT = "darija-genie:quiz-attempts-change"

const scenarios: Array<{
  id: ScenarioId
  title: string
  titleArabic: string
  description: string
  topics: string
}> = [
  {
    id: "restaurant-1",
    title: "Restaurant",
    titleArabic: "فالمطعم",
    description: "Order food, make requests, and ask for the bill.",
    topics: "Food & drinks · Polite requests",
  },
  {
    id: "shopping-1",
    title: "Shopping",
    titleArabic: "فالسوق",
    description: "Ask prices, find what you need, and make a purchase.",
    topics: "Prices & items · Everyday exchanges",
  },
]

const exercises: Exercise[] = [
  {
    id: "build",
    title: "Build a sentence",
    instruction: "Arrange the words to translate the sentence below.",
    correctAnswer: "Bghit atay ‘afak",
  },
  {
    id: "complete",
    title: "Complete the sentence",
    instruction: "Choose a word from the bank to fill the blank.",
    correctAnswer: "atay",
  },
  {
    id: "match",
    title: "Match the pairs",
    instruction: "Connect each Darija word with its English meaning.",
    correctAnswer: "atay → Tea, lma → Water, khobz → Bread, lḥsab → The bill",
  },
  {
    id: "listen",
    title: "Listen and write",
    instruction: "Play the audio, then type what you hear.",
    correctAnswer: "bghit atay afak",
  },
  {
    id: "speak",
    title: "Speak the sentence",
    instruction: "Listen to the phrase, then say it aloud.",
    correctAnswer: "بغيت أتاي عافاك",
  },
  {
    id: "image",
    title: "Select the correct image",
    instruction: "Choose the picture that matches the Darija word.",
    correctAnswer: "Image 2 — Moroccan tea",
  },
]

const buildWords = ["‘afak", "atay", "Bghit", "hada"]
const buildAnswer = ["Bghit", "atay", "‘afak"]
const completeWords = ["khobz", "atay", "lma"]
const matchLeft = ["atay", "lma", "khobz", "lḥsab"]
const matchRight = ["Bread", "Tea", "The bill", "Water"]
const matchAnswer: Record<string, string> = {
  atay: "Tea",
  lma: "Water",
  khobz: "Bread",
  lḥsab: "The bill",
}

function scenarioLabel(scenario: ScenarioId): string {
  return scenario.startsWith("shopping") ? "Shopping · Lesson 1" : "Restaurant · Lesson 1"
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[’']/g, "").replace(/\s+/g, " ").trim()
}

function parseAttempts(raw: string): QuizAttempt[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (attempt): attempt is QuizAttempt =>
        Boolean(attempt) &&
        typeof attempt === "object" &&
        attempt.version === 1 &&
        typeof attempt.scenario === "string" &&
        typeof attempt.completedAt === "string" &&
        Array.isArray(attempt.results)
    )
  } catch {
    return []
  }
}

function readAttempts(): QuizAttempt[] {
  try {
    return parseAttempts(window.localStorage.getItem(QUIZ_ATTEMPTS_KEY) ?? "[]")
  } catch {
    return []
  }
}

function storeAttempt(attempt: QuizAttempt): void {
  try {
    const previous = readAttempts().filter((item) => item.scenario !== attempt.scenario)
    window.localStorage.setItem(
      QUIZ_ATTEMPTS_KEY,
      JSON.stringify([attempt, ...previous].slice(0, 20))
    )
    window.dispatchEvent(new Event(QUIZ_ATTEMPTS_CHANGE_EVENT))
  } catch {
    // The quiz should still complete when browser storage is unavailable.
  }
}

export function TestingScenarioChooser(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-[#f6f2e7] text-[#1f2f63]">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-7 sm:px-8 md:py-10">
        <p className="text-[11px] tracking-[0.2em] text-[#8f8068] uppercase">Learn / Testing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Test your Darija.</h1>
        <p className="mt-1.5 text-sm text-[#6f6b61] sm:text-base">A little practice goes a long way.</p>

        <section className="mt-9" aria-labelledby="choose-scenario">
          <p className="text-[11px] tracking-[0.2em] text-[#9b7a55] uppercase">Scenario practice</p>
          <h2 id="choose-scenario" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Where would you like to practise?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6b61] sm:text-base">
            Choose a familiar situation. You&apos;ll work through a short set of exercises, one at a time.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
            {scenarios.map((scenario, index) => (
              <Link
                key={scenario.id}
                href={`/learning/scenarios/${scenario.id}/quiz`}
                aria-label={`Start ${scenario.title} practice`}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#1f2f63] focus-visible:ring-offset-2"
              >
                <Card className="h-full overflow-hidden rounded-2xl border border-[#d2c3a7] bg-[#fffdf8] p-0 shadow-[0_2px_0_#cabb9e] transition-transform group-hover:-translate-y-0.5">
                  <div
                    className={`relative flex h-36 items-center justify-center sm:h-40 ${
                      scenario.id.startsWith("restaurant") ? "bg-[#ece1ca]" : "bg-[#e7e8dc]"
                    }`}
                  >
                    <span className="absolute left-5 top-5 text-xs tracking-[0.18em] text-[#a86d3f]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex size-20 items-center justify-center rounded-t-[40px] rounded-b-md border border-[#d8c8ab] bg-[#f8f3e7] text-[#a86d3f] shadow-[0_2px_0_#d3c4a8]">
                      {scenario.id.startsWith("restaurant") ? (
                        <RestaurantIcon aria-hidden="true" className="size-9" />
                      ) : (
                        <ShoppingIcon aria-hidden="true" className="size-9" />
                      )}
                    </span>
                    <span className="absolute bottom-5 right-5 text-[10px] tracking-[0.16em] text-[#7e7463]">
                      LESSON 1
                    </span>
                  </div>
                  <CardContent className="flex min-h-[210px] flex-col px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold sm:text-2xl">{scenario.title}</h3>
                      <span lang="ary" dir="rtl" className="font-[family-name:var(--font-simplified-arabic)] text-xl text-[#a86d3f] sm:text-2xl">
                        {scenario.titleArabic}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-[#6f6b61]">{scenario.description}</p>
                    <p className="mt-3 text-xs text-[#a86d3f]">{scenario.topics}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e5decd] pt-4 text-xs text-[#7e7463] sm:text-sm">
                      <span>6 exercises · Beginner</span>
                      <span className="inline-flex shrink-0 items-center font-semibold text-[#1f2f63]">
                        Start practice
                        <ArrowRightIcon
                          aria-hidden="true"
                          className="ml-1 size-4 transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export function TestingStudio({ scenario }: { scenario: ScenarioId }): React.JSX.Element {
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<ExerciseResult[]>([])

  const [selectedBuildWords, setSelectedBuildWords] = useState<string[]>([])
  const [selectedCompleteWord, setSelectedCompleteWord] = useState<string | null>(null)
  const [leftChoice, setLeftChoice] = useState<string | null>(null)
  const [rightChoice, setRightChoice] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [listenText, setListenText] = useState("")
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const exercise = exercises[exerciseIndex]!
  const progressValue = (exerciseIndex / exercises.length) * 100
  const correctCount = results.filter((result) => result.correct).length

  function resetExerciseState() {
    setFeedback(null)
    setSelectedBuildWords([])
    setSelectedCompleteWord(null)
    setLeftChoice(null)
    setRightChoice(null)
    setMatches({})
    setListenText("")
    setSelectedImage(null)
  }

  function canCheck(): boolean {
    switch (exercise.id) {
      case "build":
        return selectedBuildWords.length > 0
      case "complete":
        return Boolean(selectedCompleteWord)
      case "match":
        return Object.keys(matches).length === matchLeft.length
      case "listen":
        return listenText.trim().length > 0
      case "speak":
        return true
      case "image":
        return selectedImage !== null
    }
  }

  function submitExercise() {
    let correct = false
    let response = ""

    switch (exercise.id) {
      case "build":
        response = selectedBuildWords.join(" ")
        correct = normalizeText(response) === normalizeText(buildAnswer.join(" "))
        break
      case "complete":
        response = selectedCompleteWord ?? ""
        correct = response === "atay"
        break
      case "match":
        response = matchLeft.map((word) => `${word} → ${matches[word] ?? "—"}`).join(", ")
        correct = matchLeft.every((word) => matches[word] === matchAnswer[word])
        break
      case "listen":
        response = listenText.trim()
        correct = normalizeText(response) === normalizeText("bghit atay afak")
        break
      case "speak":
        response = "Practised aloud"
        correct = true
        break
      case "image":
        response = selectedImage === null ? "" : `Image ${selectedImage}`
        correct = selectedImage === 2
        break
    }

    setResults((current) => [
      ...current.filter((result) => result.exerciseId !== exercise.id),
      {
        exerciseId: exercise.id,
        title: exercise.title,
        correct,
        response,
        correctAnswer: exercise.correctAnswer,
      },
    ])
    setFeedback(correct ? "success" : "error")
  }

  function continueAfterFeedback() {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((index) => index + 1)
      resetExerciseState()
      return
    }

    const attempt: QuizAttempt = {
      version: 1,
      scenario,
      completedAt: new Date().toISOString(),
      correctCount: results.filter((result) => result.correct).length,
      totalCount: exercises.length,
      results,
    }
    storeAttempt(attempt)
    setCompleted(true)
  }

  if (completed) {
    const missed = results.filter((result) => !result.correct)
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f6f2e7] px-5 py-10 text-[#1f2f63]">
        <Card className="w-full max-w-lg rounded-2xl border-[#d9ccb4] bg-[#fffdf8] p-6 shadow-[0_2px_0_#cabb9e] sm:p-8">
          <p className="text-[11px] tracking-[0.2em] text-[#a86d3f] uppercase">Practice complete</p>
          <h1 className="mt-2 text-3xl font-semibold">Nice work.</h1>
          <p className="mt-2 text-sm leading-6 text-[#6f6b61]">
            You got <span className="font-semibold text-[#1f2f63]">{correctCount} of {exercises.length}</span> correct.
            {missed.length > 0
              ? " Your missed answers are saved in Review for this scenario."
              : " You answered every exercise correctly."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/learning/scenarios/${scenario}/review`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1f2f63] px-4 text-sm font-medium text-white hover:bg-[#1a2858]"
            >
              Review answers
            </Link>
            <Link
              href={`/learning/scenarios/${scenario}/quiz`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d9ccb4] bg-[#fffdf8] px-4 text-sm font-medium text-[#1f2f63] hover:bg-[#f1eadb]"
            >
              Try again
            </Link>
          </div>
          <Link
            href={`/learning/scenarios/${scenario}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#a86d3f] hover:underline"
          >
            <ArrowLeftIcon className="size-4" /> Back to scenario
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#f6f2e7] text-[#1f2f63]">
      <header className="border-b border-[#dfd7c8] bg-[#f6f2e7]">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 py-4 sm:px-8">
          <Link
            href={`/learning/scenarios/${scenario}`}
            aria-label="Exit practice and return to scenario"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#7e7463] hover:bg-[#ebe4d6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f2f63]"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-5" />
          </Link>
          <div className="flex-1">
            <div
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin={0}
              aria-valuemax={exercises.length}
              aria-valuenow={exerciseIndex}
              className="h-2 overflow-hidden rounded-full bg-[#e5dece]"
            >
              <div
                className="h-full rounded-full bg-[#a86d3f] transition-[width] duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
          <span className="min-w-12 text-right text-xs tabular-nums text-[#7e7463]">
            {exerciseIndex + 1} / {exercises.length}
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-7 pb-36 sm:px-8 sm:py-10">
        <div className="mb-7 flex items-center justify-between gap-3">
          <p className="text-[11px] tracking-[0.16em] text-[#a86d3f] uppercase">
            {scenarioLabel(scenario)}
          </p>
          <Link
            href={`/learning/scenarios/${scenario}/review`}
            className="text-xs font-medium text-[#7e7463] underline-offset-4 hover:text-[#1f2f63] hover:underline"
          >
            Review past answers
          </Link>
        </div>

        <p className="text-xs font-medium text-[#a86d3f]">
          Question {exerciseIndex + 1}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{exercise.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">{exercise.instruction}</p>

        <div className="mt-7">
          {exercise.id === "build" ? (
            <div className="space-y-5">
              <div className="inline-flex rounded-xl border border-[#d9ccb4] bg-[#fffdf8] px-4 py-3 text-base sm:text-lg">
                I would like tea, please.
              </div>
              <div className="min-h-20 rounded-xl border border-[#e4dccb] bg-[#faf6ee] p-3 sm:p-4">
                {selectedBuildWords.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedBuildWords.map((word, index) => (
                      <button
                        key={`${word}-${index}`}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() =>
                          setSelectedBuildWords((current) =>
                            current.filter((_, currentIndex) => currentIndex !== index)
                          )
                        }
                        className="rounded-lg border border-[#cdbb9d] bg-white px-3 py-2 text-sm font-medium disabled:opacity-70"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-sm text-[#8f8068]">Choose words to build the sentence.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {buildWords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    disabled={Boolean(feedback) || selectedBuildWords.includes(word)}
                    onClick={() => setSelectedBuildWords((current) => [...current, word])}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-default ${
                      selectedBuildWords.includes(word)
                        ? "border-[#d9ccb4] bg-[#eee8dc] text-[#9b927f]"
                        : "border-[#d9ccb4] bg-[#fffdf8] hover:bg-[#f1eadb]"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {exercise.id === "complete" ? (
            <div className="space-y-7">
              <div className="inline-flex rounded-xl border border-[#d9ccb4] bg-[#fffdf8] px-4 py-3 text-base sm:text-lg">
                I would like tea, please.
              </div>
              <p className="text-center text-2xl sm:text-3xl">
                Bghit{" "}
                <span className="inline-flex min-w-28 justify-center rounded-lg border border-dashed border-[#cdbb9d] bg-[#faf6ee] px-3 py-2">
                  {selectedCompleteWord ?? "…"}
                </span>{" "}
                ‘afak.
              </p>
              <div className="flex justify-center gap-2">
                {completeWords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    disabled={Boolean(feedback)}
                    aria-pressed={selectedCompleteWord === word}
                    onClick={() => setSelectedCompleteWord(word)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
                      selectedCompleteWord === word
                        ? "border-[#a86d3f] bg-[#f1e7d5]"
                        : "border-[#d9ccb4] bg-[#fffdf8] hover:bg-[#f1eadb]"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {exercise.id === "match" ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.18em] text-[#7e7463] uppercase">Darija</p>
                {matchLeft.map((word) => (
                  <button
                    key={word}
                    type="button"
                    disabled={Boolean(feedback) || Boolean(matches[word])}
                    aria-pressed={leftChoice === word}
                    onClick={() => {
                      setLeftChoice(word)
                      if (rightChoice) {
                        setMatches((current) => ({ ...current, [word]: rightChoice }))
                        setLeftChoice(null)
                        setRightChoice(null)
                      }
                    }}
                    className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm ${
                      leftChoice === word
                        ? "border-[#1f2f63] bg-[#eff2f8]"
                        : "border-[#d9ccb4] bg-[#fffdf8]"
                    }`}
                  >
                    {word}
                    {matches[word] ? <span className="text-xs text-[#a86d3f]">Matched</span> : null}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.18em] text-[#7e7463] uppercase">English</p>
                {matchRight.map((word) => (
                  <button
                    key={word}
                    type="button"
                    disabled={Boolean(feedback) || Object.values(matches).includes(word)}
                    aria-pressed={rightChoice === word}
                    onClick={() => {
                      setRightChoice(word)
                      if (leftChoice) {
                        setMatches((current) => ({ ...current, [leftChoice]: word }))
                        setLeftChoice(null)
                        setRightChoice(null)
                      }
                    }}
                    className={`flex min-h-12 w-full items-center rounded-lg border px-4 text-left text-sm ${
                      rightChoice === word
                        ? "border-[#1f2f63] bg-[#eff2f8]"
                        : "border-[#d9ccb4] bg-[#fffdf8]"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#7e7463] sm:col-span-2">
                {Object.keys(matches).length} of {matchLeft.length} pairs matched
              </p>
            </div>
          ) : null}

          {exercise.id === "listen" ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-[#d9ccb4] bg-[#fffdf8] p-5">
                <button
                  type="button"
                  aria-label="Play sample pronunciation"
                  onClick={() => {
                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel()
                      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Bghit atay afak"))
                    }
                  }}
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1f2f63] text-white"
                >
                  <VolumeIcon aria-hidden="true" className="size-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold">Listen to the sentence</p>
                  <p className="mt-1 text-xs text-[#a86d3f]">Tap to play the sample</p>
                </div>
              </div>
              <label className="block">
                <span className="text-[10px] tracking-[0.18em] text-[#7e7463] uppercase">Write what you hear</span>
                <textarea
                  value={listenText}
                  disabled={Boolean(feedback)}
                  onChange={(event) => setListenText(event.target.value)}
                  className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#d9ccb4] bg-[#fffdf8] px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1f2f63]"
                  placeholder="Type the sentence in Latin Darija…"
                />
              </label>
            </div>
          ) : null}

          {exercise.id === "speak" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#d9ccb4] bg-[#fffdf8] p-5">
                <p dir="rtl" className="font-[family-name:var(--font-simplified-arabic)] text-2xl font-semibold">بغيت أتاي عافاك</p>
                <p className="mt-2 text-sm text-[#a86d3f]">Bghit atay ‘afak</p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel()
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Bghit atay afak"))
                  }
                }}
                className="h-12 w-full rounded-xl bg-[#1f2f63] text-white hover:bg-[#1a2858]"
              >
                <MicIcon aria-hidden="true" className="mr-2 size-4" />
                Listen and practise aloud
              </Button>
              <p className="text-center text-xs text-[#7e7463]">
                Practise the phrase, then continue when you&apos;re ready.
              </p>
            </div>
          ) : null}

          {exercise.id === "image" ? (
            <div>
              <div className="mb-5 text-center">
                <p className="text-[10px] tracking-[0.18em] text-[#7e7463] uppercase">Which picture means</p>
                <p className="mt-1 text-2xl font-semibold">
                  atay <span lang="ary" dir="rtl" className="ml-1 font-[family-name:var(--font-simplified-arabic)] text-[#a86d3f]">أتاي</span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 1, emoji: "🥛", label: "Milk" },
                  { id: 2, emoji: "🫖", label: "Tea" },
                  { id: 3, emoji: "🥧", label: "Pie" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={Boolean(feedback)}
                    aria-label={item.label}
                    aria-pressed={selectedImage === item.id}
                    onClick={() => setSelectedImage(item.id)}
                    className={`flex min-h-32 flex-col items-center justify-center rounded-xl border bg-[#fffdf8] p-3 transition-colors sm:min-h-40 ${
                      selectedImage === item.id
                        ? "border-[#1f2f63] bg-[#eff2f8] ring-1 ring-[#1f2f63]"
                        : "border-[#d9ccb4] hover:bg-[#f1eadb]"
                    }`}
                  >
                    <span aria-hidden="true" className="text-5xl sm:text-6xl">{item.emoji}</span>
                    <span className="mt-3 text-xs text-[#7e7463]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="sticky bottom-0 mt-auto border-t border-[#dfd7c8] bg-[#f6f2e7]/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {feedback ? (
            <div
              role="status"
              className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                feedback === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {feedback === "success" ? (
                    <CheckIcon aria-hidden="true" className="size-5" />
                  ) : (
                    <span aria-hidden="true" className="text-lg leading-none">×</span>
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {feedback === "success" ? "That’s right!" : "Not quite this time"}
                  </p>
                  {feedback === "error" ? (
                    <p className="mt-1 text-xs leading-5">Answer: {exercise.correctAnswer}</p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                onClick={continueAfterFeedback}
                className="h-11 w-full shrink-0 rounded-xl bg-[#1f2f63] text-white hover:bg-[#1a2858] sm:w-auto sm:min-w-36"
              >
                {exerciseIndex === exercises.length - 1 ? "See results" : "Continue"}
                <ArrowRightIcon aria-hidden="true" className="ml-2 size-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={submitExercise}
              disabled={!canCheck()}
              className="h-12 w-full rounded-xl bg-[#1f2f63] text-white hover:bg-[#1a2858] disabled:bg-[#ddd6c7] disabled:text-[#8f8068]"
            >
              {exercise.id === "speak" ? "Continue" : "Check answer"}
              <ArrowRightIcon aria-hidden="true" className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </footer>
    </main>
  )
}

function subscribeToAttempts(onChange: () => void): () => void {
  window.addEventListener("storage", onChange)
  window.addEventListener(QUIZ_ATTEMPTS_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(QUIZ_ATTEMPTS_CHANGE_EVENT, onChange)
  }
}

function getAttemptsSnapshot(): string {
  try {
    return window.localStorage.getItem(QUIZ_ATTEMPTS_KEY) ?? "[]"
  } catch {
    return "[]"
  }
}

export function ScenarioReview({ scenario }: { scenario: ScenarioId }): React.JSX.Element {
  const snapshot = useSyncExternalStore(subscribeToAttempts, getAttemptsSnapshot, () => null)
  const attempts = useMemo(() => parseAttempts(snapshot ?? "[]"), [snapshot])
  const attempt = attempts.find((item) => item.scenario === scenario) ?? null
  const loaded = snapshot !== null

  const missed = attempt?.results.filter((result) => !result.correct) ?? []

  return (
    <main className="min-h-dvh bg-[#f6f2e7] px-5 py-7 text-[#1f2f63] sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/learning/scenarios/${scenario}`}
          className="inline-flex items-center gap-2 text-sm text-[#a86d3f] hover:underline"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" /> Back to scenario
        </Link>
        <p className="mt-8 text-[11px] tracking-[0.18em] text-[#a86d3f] uppercase">Review</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your practice, revisited.</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f6b61]">{scenarioLabel(scenario)}</p>

        {!loaded ? (
          <Card className="mt-6 animate-pulse rounded-xl border-[#d9ccb4] bg-[#fffdf8] p-6">
            <div className="h-4 w-1/2 rounded bg-[#e9e1d2]" />
            <div className="mt-3 h-4 w-3/4 rounded bg-[#e9e1d2]" />
          </Card>
        ) : !attempt ? (
          <Card className="mt-6 rounded-xl border-[#d9ccb4] bg-[#fffdf8] p-6 sm:p-8">
            <p className="text-base font-semibold">Your review will appear here after your first practice.</p>
            <p className="mt-2 text-sm leading-6 text-[#6f6b61]">
              Finish a scenario quiz and we&apos;ll keep the answers you missed on this device, ready to revisit.
            </p>
            <Link
              href={`/learning/scenarios/${scenario}/quiz`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#1f2f63] px-4 text-sm font-medium text-white hover:bg-[#1a2858]"
            >
              Start practice
            </Link>
          </Card>
        ) : (
          <>
            <Card className="mt-6 rounded-xl border-[#d9ccb4] bg-[#fffdf8] p-5 sm:p-6">
              <p className="text-xs text-[#7e7463]">
                Last practice · {new Date(attempt.completedAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-xl font-semibold">
                {attempt.correctCount} of {attempt.totalCount} correct
              </p>
              <p className="mt-1 text-sm text-[#6f6b61]">
                {missed.length
                  ? `${missed.length} answer${missed.length === 1 ? "" : "s"} to revisit`
                  : "Everything was correct — great work!"}
              </p>
            </Card>

            {missed.length ? (
              <section className="mt-7" aria-labelledby="missed-answers">
                <h2 id="missed-answers" className="text-lg font-semibold">Let&apos;s revisit these</h2>
                <div className="mt-3 space-y-3">
                  {missed.map((result) => (
                    <Card key={result.exerciseId} className="rounded-xl border-[#d9ccb4] bg-[#fffdf8] p-4 sm:p-5">
                      <p className="text-sm font-semibold">{result.title}</p>
                      <p className="mt-2 text-xs text-[#7e7463]">Your answer</p>
                      <p className="mt-0.5 text-sm">{result.response || "No answer entered"}</p>
                      <p className="mt-3 text-xs text-[#7e7463]">Correct answer</p>
                      <p className="mt-0.5 text-sm font-medium text-emerald-800">{result.correctAnswer}</p>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            <Link
              href={`/learning/scenarios/${scenario}/quiz`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1f2f63] px-4 text-sm font-medium text-white hover:bg-[#1a2858]"
            >
              Practise again <ArrowRightIcon aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
