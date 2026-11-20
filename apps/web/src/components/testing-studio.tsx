"use client"

import Link from "next/link"
import { startTransition, useEffect, useMemo, useState, useSyncExternalStore } from "react"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  RestaurantIcon,
  ShoppingIcon,
  VolumeIcon,
} from "@/components/icons"
import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import restaurantBank from "../../../../content/value-bank/restaurant-v2.json"
import {
  clearQuizProgressSnapshot,
  loadQuizProgressSnapshot,
  saveQuizProgressSnapshot,
} from "@/lib/local-retention"

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
const matchAnswer: Record<string, string> = {
  atay: "Tea",
  lma: "Water",
  khobz: "Bread",
  lḥsab: "The bill",
}

type RestaurantVocab = (typeof restaurantBank.items)[number]

const restaurantVocab = restaurantBank.items.filter(
  (item) => item.kind === "vocab"
) as RestaurantVocab[]

function restaurantPool(key: string): RestaurantVocab[] {
  return restaurantVocab
    .filter((item) => item.pool === key)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

const restaurantStarters = restaurantPool("starters")
const restaurantMains = restaurantPool("mains")
const restaurantDrinks = restaurantPool("drinks")
const restaurantVariants = restaurantVocab
  .filter((item) => item.forms.length > 1)
  .slice(0, 4)

function normalizeArabic(value: string): string {
  return value.trim().replace(/\s+/g, " ")
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
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-7 sm:px-8 md:py-10">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Learn / Testing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Test your Darija.</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">A little practice goes a long way.</p>

        <section className="mt-9" aria-labelledby="choose-scenario">
          <p className="text-[11px] tracking-[0.2em] text-primary uppercase">Scenario practice</p>
          <h2 id="choose-scenario" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Where would you like to practise?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
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
                <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <div
                    className={`relative flex h-36 items-center justify-center sm:h-40 ${
                      scenario.id.startsWith("restaurant")
                        ? "bg-[#ece1ca] dark:bg-[#302b20]"
                        : "bg-[#e7e8dc] dark:bg-[#292b24]"
                    }`}
                  >
                    <span className="absolute left-5 top-5 text-xs tracking-[0.18em] text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex size-20 items-center justify-center rounded-t-[40px] rounded-b-md border border-border bg-background text-primary shadow-sm">
                      {scenario.id.startsWith("restaurant") ? (
                        <RestaurantIcon aria-hidden="true" className="size-9" />
                      ) : (
                        <ShoppingIcon aria-hidden="true" className="size-9" />
                      )}
                    </span>
                    <span className="absolute bottom-5 right-5 text-[10px] tracking-[0.16em] text-muted-foreground">
                      LESSON 1
                    </span>
                  </div>
                  <CardContent className="flex min-h-[210px] flex-col px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold sm:text-2xl">{scenario.title}</h3>
                      <span lang="ary" dir="rtl" className="font-[family-name:var(--font-simplified-arabic)] text-xl text-primary sm:text-2xl">
                        {scenario.titleArabic}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">{scenario.description}</p>
                    <p className="mt-3 text-xs text-primary">{scenario.topics}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:text-sm">
                      <span>6 exercises · Beginner</span>
                      <span className="inline-flex shrink-0 items-center font-semibold text-foreground">
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
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const saved = loadQuizProgressSnapshot(scenario)?.state
    startTransition(() => {
      if (saved) {
        if (typeof saved.exerciseIndex === "number") {
          setExerciseIndex(
            Math.max(0, Math.min(exercises.length - 1, saved.exerciseIndex))
          )
        }
        if (saved.feedback === "success" || saved.feedback === "error") {
          setFeedback(saved.feedback)
        }
        if (Array.isArray(saved.results)) setResults(saved.results as ExerciseResult[])
        if (Array.isArray(saved.selectedBuildWords)) {
          setSelectedBuildWords(
            saved.selectedBuildWords.filter((word): word is string => typeof word === "string")
          )
        }
        if (typeof saved.selectedCompleteWord === "string") {
          setSelectedCompleteWord(saved.selectedCompleteWord)
        }
        if (typeof saved.leftChoice === "string") setLeftChoice(saved.leftChoice)
        if (typeof saved.rightChoice === "string") setRightChoice(saved.rightChoice)
        if (saved.matches && typeof saved.matches === "object") {
          setMatches(saved.matches as Record<string, string>)
        }
        if (typeof saved.listenText === "string") setListenText(saved.listenText)
        if (typeof saved.selectedImage === "number") setSelectedImage(saved.selectedImage)
      }
      setRestored(true)
    })
  }, [scenario])

  useEffect(() => {
    if (!restored || completed) return
    const hasProgress =
      exerciseIndex > 0 ||
      results.length > 0 ||
      Boolean(feedback) ||
      selectedBuildWords.length > 0 ||
      Boolean(selectedCompleteWord) ||
      Object.keys(matches).length > 0 ||
      Boolean(listenText) ||
      selectedImage !== null

    if (!hasProgress) {
      clearQuizProgressSnapshot(scenario)
      return
    }

    saveQuizProgressSnapshot(scenario, {
      exerciseIndex,
      feedback,
      results,
      selectedBuildWords,
      selectedCompleteWord,
      leftChoice,
      rightChoice,
      matches,
      listenText,
      selectedImage,
    })
  }, [
    completed,
    exerciseIndex,
    feedback,
    leftChoice,
    listenText,
    matches,
    results,
    restored,
    scenario,
    selectedBuildWords,
    selectedCompleteWord,
    selectedImage,
    rightChoice,
  ])

  const exercise = exercises[exerciseIndex]!
  const restaurantMode = scenario.startsWith("restaurant")
  const featuredMain = restaurantMains[0]!
  const secondMain = restaurantMains[1]!
  const featuredStarter = restaurantStarters[0]!
  const featuredDrink = restaurantDrinks[0]!
  const restaurantOrderWords = ["بغيت", featuredMain.canonical, "عافاك"]
  const restaurantBuildChoices = [
    "عافاك",
    featuredMain.canonical,
    "بغيت",
    secondMain.canonical,
  ]
  const restaurantStarterChoices = [
    featuredStarter,
    featuredMain,
    featuredDrink,
  ]
  const activeMatchPairs = restaurantMode
    ? restaurantVariants.map((item) => ({
        left: item.canonical,
        right: item.forms[1]!,
      }))
    : matchLeft.map((left) => ({ left, right: matchAnswer[left]! }))
  const activeMatchLeft = activeMatchPairs.map((pair) => pair.left)
  const activeMatchRight = [...activeMatchPairs]
    .map((pair) => pair.right)
    .reverse()
  const activeMatchAnswer = Object.fromEntries(
    activeMatchPairs.map((pair) => [pair.left, pair.right])
  )
  const visibleExerciseTitle =
    restaurantMode && exercise.id === "image"
      ? "Identify the menu section"
      : exercise.title
  const visibleExerciseInstruction =
    restaurantMode && exercise.id === "match"
      ? "Match each menu item to another accepted form from the workbook."
      : restaurantMode && exercise.id === "image"
        ? "Choose which section of the menu contains this item."
        : restaurantMode && exercise.id === "complete"
          ? "Choose the item from the starter section."
          : restaurantMode && exercise.id === "listen"
            ? "Listen to a restaurant word, then type it in Arabic script."
            : restaurantMode && exercise.id === "speak"
              ? "Listen to the order phrase, then practise saying it aloud."
              : restaurantMode && exercise.id === "build"
                ? "Arrange the Darija words to make a polite order."
                : exercise.instruction
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
        return restaurantMode
          ? Boolean(selectedCompleteWord)
          : Boolean(selectedCompleteWord)
      case "match":
        return Object.keys(matches).length === activeMatchLeft.length
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
        correct = restaurantMode
          ? normalizeArabic(response) === normalizeArabic(restaurantOrderWords.join(" "))
          : normalizeText(response) === normalizeText(buildAnswer.join(" "))
        break
      case "complete":
        response = selectedCompleteWord ?? ""
        correct = restaurantMode
          ? response === featuredStarter.canonical
          : response === "atay"
        break
      case "match":
        response = activeMatchLeft
          .map((word) => `${word} → ${matches[word] ?? "—"}`)
          .join(", ")
        correct = activeMatchLeft.every(
          (word) => matches[word] === activeMatchAnswer[word]
        )
        break
      case "listen":
        response = listenText.trim()
        correct = restaurantMode
          ? featuredDrink.forms.some(
              (form) => normalizeArabic(response) === normalizeArabic(form)
            )
          : normalizeText(response) === normalizeText("bghit atay afak")
        break
      case "speak":
        response = restaurantMode ? restaurantOrderWords.join(" ") : "Practised aloud"
        correct = true
        break
      case "image":
        response = selectedImage === null
          ? ""
          : restaurantMode
            ? ["", "Starters", "Main dishes", "Drinks"][selectedImage] ?? ""
            : `Image ${selectedImage}`
        correct = selectedImage === 2
        break
    }

    setResults((current) => [
      ...current.filter((result) => result.exerciseId !== exercise.id),
      {
      exerciseId: exercise.id,
      title: visibleExerciseTitle,
      correct,
      response,
      correctAnswer:
        restaurantMode && exercise.id === "build"
          ? restaurantOrderWords.join(" ")
          : restaurantMode && exercise.id === "complete"
            ? featuredStarter.canonical
            : restaurantMode && exercise.id === "match"
              ? activeMatchPairs
                  .map((pair) => `${pair.left} → ${pair.right}`)
                  .join(", ")
              : restaurantMode && exercise.id === "listen"
                ? featuredDrink.canonical
                : restaurantMode && exercise.id === "speak"
                  ? restaurantOrderWords.join(" ")
                  : restaurantMode && exercise.id === "image"
                    ? "Main dishes"
                    : exercise.correctAnswer,
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
    clearQuizProgressSnapshot(scenario)
    setCompleted(true)
  }

  if (!restored) {
    return (
      <main className="min-h-dvh bg-background px-5 py-8">
        <div className="mx-auto h-2 max-w-3xl animate-pulse rounded-full bg-muted" />
        <div className="mx-auto mt-8 h-48 max-w-3xl animate-pulse rounded-2xl bg-muted" />
      </main>
    )
  }

  if (completed) {
    const missed = results.filter((result) => !result.correct)
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
        <Card className="w-full max-w-lg rounded-2xl border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-[11px] tracking-[0.2em] text-primary uppercase">Practice complete</p>
          <h1 className="mt-2 text-3xl font-semibold">Nice work.</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You got <span className="font-semibold text-foreground">{correctCount} of {exercises.length}</span> correct.
            {missed.length > 0
              ? " Your missed answers are saved in Review for this scenario."
              : " You answered every exercise correctly."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/learning/scenarios/${scenario}/review`}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Review answers
            </Link>
            <button
              type="button"
              onClick={() => {
                clearQuizProgressSnapshot(scenario)
                setExerciseIndex(0)
                setResults([])
                resetExerciseState()
                setCompleted(false)
              }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent"
            >
              Try again
            </button>
          </div>
          <Link
            href={`/learning/scenarios/${scenario}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeftIcon className="size-4" /> Back to scenario
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 py-4 sm:px-8">
          <Link
            href={`/learning/scenarios/${scenario}`}
            aria-label="Exit practice and return to scenario"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
          <span className="min-w-12 text-right text-xs tabular-nums text-muted-foreground">
            {exerciseIndex + 1} / {exercises.length}
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-7 pb-36 sm:px-8 sm:py-10">
        <div className="mb-7 flex items-center justify-between gap-3">
          <p className="text-[11px] tracking-[0.16em] text-primary uppercase">
            {scenarioLabel(scenario)}
          </p>
          <Link
            href={`/learning/scenarios/${scenario}/review`}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Review past answers
          </Link>
        </div>

        <p className="text-xs font-medium text-primary">
          Question {exerciseIndex + 1}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{visibleExerciseTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{visibleExerciseInstruction}</p>

        <div className="mt-7">
          {exercise.id === "build" ? (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-base sm:text-lg">
                <span>{restaurantMode ? "Polite order" : "I would like tea, please."}</span>
                {restaurantMode ? (
                  <span lang="ary" dir="rtl" className="font-[family-name:var(--font-simplified-arabic)] text-primary">
                    {featuredMain.canonical}
                  </span>
                ) : null}
              </div>
              <div className="min-h-20 rounded-xl border border-border bg-muted p-3 sm:p-4">
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
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium disabled:opacity-70"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-sm text-muted-foreground">Choose words to build the sentence.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(restaurantMode ? restaurantBuildChoices : buildWords).map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    disabled={Boolean(feedback) || selectedBuildWords.includes(word)}
                    onClick={() => setSelectedBuildWords((current) => [...current, word])}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-default ${
                      selectedBuildWords.includes(word)
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-input bg-background hover:bg-accent"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {exercise.id === "complete" && restaurantMode ? (
            <div className="space-y-5">
              <p className="text-sm font-medium">Choose the item from the starter section.</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {restaurantStarterChoices.map((item) => (
                  <button
                    key={`${item.pool}-${item.itemKey}`}
                    type="button"
                    disabled={Boolean(feedback)}
                    aria-pressed={selectedCompleteWord === item.canonical}
                    onClick={() => setSelectedCompleteWord(item.canonical)}
                    className={`min-h-14 rounded-md border px-3 py-3 text-left text-sm ${
                      selectedCompleteWord === item.canonical
                        ? "border-primary bg-primary/10"
                        : "border-input bg-card hover:bg-accent"
                    }`}
                  >
                    <span lang="ary" dir="rtl" className="font-[family-name:var(--font-simplified-arabic)]">
                      {item.canonical}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : exercise.id === "complete" ? (
            <div className="space-y-7">
              <div className="inline-flex rounded-xl border border-border bg-card px-4 py-3 text-base sm:text-lg">
                I would like tea, please.
              </div>
              <p className="text-center text-2xl sm:text-3xl">
                Bghit{" "}
                <span className="inline-flex min-w-28 justify-center rounded-md border border-dashed border-border bg-muted px-3 py-2">
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
                        ? "border-primary bg-primary/10"
                        : "border-input bg-background hover:bg-accent"
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
                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  {restaurantMode ? "Menu item" : "Darija"}
                </p>
                {activeMatchLeft.map((word) => (
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
                        ? "border-primary bg-primary/10"
                        : "border-input bg-card"
                    }`}
                  >
                    {word}
                    {matches[word] ? <span className="text-xs text-primary">Matched</span> : null}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  {restaurantMode ? "Other accepted form" : "English"}
                </p>
                {activeMatchRight.map((word) => (
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
                        ? "border-primary bg-primary/10"
                        : "border-input bg-card"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                {Object.keys(matches).length} of {activeMatchLeft.length} pairs matched
              </p>
            </div>
          ) : null}

          {exercise.id === "listen" ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                <button
                  type="button"
                  aria-label="Play sample pronunciation"
                  onClick={() => {
                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel()
                      const utterance = new SpeechSynthesisUtterance(
                        restaurantMode ? featuredDrink.canonical : "Bghit atay afak"
                      )
                      utterance.lang = restaurantMode ? "ar-MA" : "en"
                      window.speechSynthesis.speak(utterance)
                    }
                  }}
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <VolumeIcon aria-hidden="true" className="size-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold">
                    {restaurantMode ? "Listen to this drink" : "Listen to the sentence"}
                  </p>
                  <p className="mt-1 text-xs text-primary">Tap to play the sample</p>
                </div>
              </div>
              <label className="block">
                <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Write what you hear</span>
                <textarea
                  value={listenText}
                  disabled={Boolean(feedback)}
                  onChange={(event) => setListenText(event.target.value)}
                  className="mt-2 min-h-28 w-full resize-y rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={restaurantMode ? "Type the Darija word in Arabic…" : "Type the sentence in Latin Darija…"}
                />
              </label>
            </div>
          ) : null}

          {exercise.id === "speak" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <p dir="rtl" className="font-[family-name:var(--font-simplified-arabic)] text-2xl font-semibold">
                  {restaurantMode ? restaurantOrderWords.join(" ") : "بغيت أتاي عافاك"}
                </p>
                <p className="mt-2 text-sm text-primary">
                  {restaurantMode ? "Polite restaurant order" : "Bghit atay ‘afak"}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel()
                    const utterance = new SpeechSynthesisUtterance(
                      restaurantMode ? restaurantOrderWords.join(" ") : "Bghit atay afak"
                    )
                    utterance.lang = restaurantMode ? "ar-MA" : "ar-MA"
                    window.speechSynthesis.speak(utterance)
                  }
                }}
                className="h-12 w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <VolumeIcon aria-hidden="true" className="mr-2 size-4" />
                Play the phrase, then practise aloud
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Practise the phrase, then continue when you&apos;re ready.
              </p>
            </div>
          ) : null}

          {exercise.id === "image" ? (
            <div>
              <div className="mb-5 text-center">
                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  {restaurantMode ? "Menu item" : "Which picture means"}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {restaurantMode ? (
                    <span lang="ary" dir="rtl" className="font-[family-name:var(--font-simplified-arabic)]">
                      {featuredMain.canonical}
                    </span>
                  ) : (
                    <>
                      atay{" "}
                      <span lang="ary" dir="rtl" className="ml-1 font-[family-name:var(--font-simplified-arabic)] text-primary">
                        أتاي
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(restaurantMode
                  ? [
                      { id: 1, emoji: "🥗", label: "Starters" },
                      { id: 2, emoji: "🍲", label: "Main dishes" },
                      { id: 3, emoji: "🥤", label: "Drinks" },
                    ]
                  : [
                      { id: 1, emoji: "🥛", label: "Milk" },
                      { id: 2, emoji: "🫖", label: "Tea" },
                      { id: 3, emoji: "🥧", label: "Pie" },
                    ]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={Boolean(feedback)}
                    aria-label={item.label}
                    aria-pressed={selectedImage === item.id}
                    onClick={() => setSelectedImage(item.id)}
                    className={`flex min-h-32 flex-col items-center justify-center rounded-xl border bg-card p-3 transition-colors sm:min-h-40 ${
                      selectedImage === item.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <span aria-hidden="true" className="text-5xl sm:text-6xl">{item.emoji}</span>
                    <span className="mt-3 text-xs text-muted-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="sticky bottom-0 mt-auto border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:px-8">
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
                className="h-11 w-full shrink-0 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:min-w-36"
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
              className="h-12 w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
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
    <main className="min-h-dvh bg-background px-5 py-7 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/learning/scenarios/${scenario}`}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" /> Back to scenario
        </Link>
        <p className="mt-8 text-[11px] tracking-[0.18em] text-[#a86d3f] uppercase">Review</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your practice, revisited.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{scenarioLabel(scenario)}</p>

        {!loaded ? (
          <Card className="mt-6 animate-pulse rounded-xl border-border bg-card p-6">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
          </Card>
        ) : !attempt ? (
          <Card className="mt-6 rounded-xl border-border bg-card p-6 sm:p-8">
            <p className="text-base font-semibold">Your review will appear here after your first practice.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Finish a scenario quiz and we&apos;ll keep the answers you missed on this device, ready to revisit.
            </p>
            <Link
              href={`/learning/scenarios/${scenario}/quiz`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start practice
            </Link>
          </Card>
        ) : (
          <>
            <Card className="mt-6 rounded-xl border-border bg-card p-5 sm:p-6">
              <p className="text-xs text-muted-foreground">
                Last practice · {new Date(attempt.completedAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-xl font-semibold">
                {attempt.correctCount} of {attempt.totalCount} correct
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
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
                    <Card key={result.exerciseId} className="rounded-xl border-border bg-card p-4 sm:p-5">
                      <p className="text-sm font-semibold">{result.title}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Your answer</p>
                      <p className="mt-0.5 text-sm">{result.response || "No answer entered"}</p>
                      <p className="mt-3 text-xs text-muted-foreground">Correct answer</p>
                      <p className="mt-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">{result.correctAnswer}</p>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            <Link
              href={`/learning/scenarios/${scenario}/quiz`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Practise again <ArrowRightIcon aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
