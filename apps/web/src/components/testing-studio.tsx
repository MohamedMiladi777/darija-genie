"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MicIcon,
  RestaurantIcon,
  ShoppingIcon,
  VolumeIcon,
} from "@/components/icons"
import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

type StudioTab = "scenario" | "vocabulary" | "grammar"
type ExerciseKind = "build" | "complete" | "match" | "listen" | "speak" | "image"
type FeedbackState = "success" | "error" | null

type Exercise = {
  id: ExerciseKind
  number: number
  title: string
  subtitle: string
}

type ScenarioCard = {
  id: ScenarioId
  title: string
  titleArabic: string
  subtitle: string
  tags: string
  lesson: string
  exerciseCount: number
}

const scenarioCards: readonly ScenarioCard[] = [
  {
    id: "restaurant-1",
    title: "Restaurant",
    titleArabic: "فالمطعم",
    subtitle: "Ordering, making requests, and asking for the bill.",
    tags: "Food & drinks · Polite requests",
    lesson: "LESSON 1",
    exerciseCount: 6,
  },
  {
    id: "shopping-1",
    title: "Shopping",
    titleArabic: "فالسوق",
    subtitle: "Asking prices, finding what you need, and making a purchase.",
    tags: "Prices & items · Everyday exchanges",
    lesson: "LESSON 1",
    exerciseCount: 6,
  },
]

const tabs: Array<{ id: StudioTab; label: string; index: string }> = [
  { id: "scenario", label: "Scenario Specific", index: "01" },
  { id: "vocabulary", label: "Vocabulary", index: "02" },
  { id: "grammar", label: "Grammar", index: "03" },
]

const scenarioExercises: Exercise[] = [
  { id: "build", number: 1, title: "Build a sentence", subtitle: "Drag words into order" },
  {
    id: "complete",
    number: 2,
    title: "Complete the sentence",
    subtitle: "Choose the missing word",
  },
  { id: "match", number: 3, title: "Match the pairs", subtitle: "Darija ↔ English" },
  { id: "listen", number: 4, title: "Listen and write", subtitle: "Hear it. Type it." },
  { id: "speak", number: 5, title: "Speak the sentence", subtitle: "Give the words your voice" },
  { id: "image", number: 6, title: "Select the correct image", subtitle: "Connect words and pictures" },
]

const grammarExercises: Exercise[] = scenarioExercises.slice(0, 2)

const buildWords = ["‘afak", "atay", "Bghit", "hada"]
const buildAnswer = ["Bghit", "atay", "‘afak"]
const completeWords = ["khobz", "atay", "lma"]
const completeAnswer = "atay"
const matchLeft = ["atay", "lma", "khobz", "lḥsab"]
const matchRight = ["Bread", "Tea", "The bill", "Water"]
const matchAnswer: Record<string, string> = {
  atay: "Tea",
  lma: "Water",
  khobz: "Bread",
  "lḥsab": "The bill",
}

function scenarioLabel(scenario: ScenarioId): string {
  return scenario.startsWith("shopping") ? "Shopping · Lesson 1" : "Restaurant · Lesson 1"
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[’']/g, "").replace(/\s+/g, " ").trim()
}

export function TestingScenarioChooser(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-[#f6f2e7] text-[#1f2f63]">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-7 sm:px-8 md:py-10">
        <p className="text-[11px] tracking-[0.2em] text-[#8f8068] uppercase">Learn / Testing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2f63] sm:text-4xl">Test your Darija.</h1>
        <p className="mt-1.5 text-sm text-[#6f6b61] sm:text-base">Put your knowledge to the test.</p>

        <div className="mt-6 border-b border-[#dfd7c8]" />
        <div className="mt-4 flex items-center gap-5 border-b border-[#dfd7c8] text-sm text-[#7e7463] sm:gap-7">
          {tabs.map((tab) => (
            <span
              key={tab.id}
              className={`border-b-2 px-1 py-3 ${
                tab.id === "scenario"
                  ? "border-[#a86d3f] font-semibold text-[#1f2f63]"
                  : "border-transparent"
              }`}
            >
              {tab.label} <span className="ml-1 text-[10px]">{tab.index}</span>
            </span>
          ))}
        </div>

        <section className="mt-8">
          <p className="text-[11px] tracking-[0.2em] text-[#9b7a55] uppercase">Scenario Specific</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2f63] sm:text-4xl">Choose your setting.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6b61] sm:text-base">
            Test your Darija in a situation you&apos;ve learned. Select a scenario to begin its exercises.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
            {scenarioCards.map((scenario, index) => (
              <Link
                key={scenario.id}
                href={`/learning/scenarios/${scenario.id}/quiz`}
                aria-label={`Start ${scenario.title} exercises`}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#1f2f63] focus-visible:ring-offset-2"
              >
                <Card className="h-full overflow-hidden rounded-2xl border border-[#d2c3a7] bg-[#fffdf8] p-0 shadow-[0_2px_0_#cabb9e] transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[#1f2f63]">
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
                      {scenario.lesson}
                    </span>
                  </div>
                  <CardContent className="flex min-h-[220px] flex-col px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-[#1f2f63] sm:text-2xl">{scenario.title}</h3>
                      <p lang="ary" dir="rtl" className="text-xl text-[#a86d3f] sm:text-2xl">
                        {scenario.titleArabic}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-[#6f6b61]">{scenario.subtitle}</p>
                    <p className="mt-3 text-xs text-[#a86d3f]">{scenario.tags}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e5decd] pt-4 text-xs text-[#7e7463] sm:text-sm">
                      <span>{scenario.exerciseCount} exercises · Beginner</span>
                      <span className="inline-flex shrink-0 items-center font-semibold text-[#1f2f63]">
                        Start exercises <ArrowRightIcon aria-hidden="true" className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <p className="mt-6 border-t border-[#dfd7c8] pt-5 text-sm leading-6 text-[#756b5c]">
            Build sentences, complete phrases, match words, listen, speak, and recognize images.
          </p>
        </section>
      </div>
    </main>
  )
}

export function TestingStudio({
  scenario,
  initialTab = "scenario",
}: {
  scenario: ScenarioId
  initialTab?: StudioTab
}): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  const [selectedBuildWords, setSelectedBuildWords] = useState<string[]>([])
  const [selectedCompleteWord, setSelectedCompleteWord] = useState<string | null>(null)
  const [leftChoice, setLeftChoice] = useState<string | null>(null)
  const [rightChoice, setRightChoice] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [listenText, setListenText] = useState("")
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const activeExercises = activeTab === "grammar" ? grammarExercises : scenarioExercises
  const boundedExerciseIndex = Math.min(exerciseIndex, activeExercises.length - 1)
  const exercise = activeExercises[boundedExerciseIndex]!
  const progressValue = ((exerciseIndex + 1) / activeExercises.length) * 100

  const sectionLabel = useMemo(() => {
    if (activeTab === "grammar") return "Grammar · Beginner"
    if (activeTab === "vocabulary") return "Vocabulary · Beginner"
    return "Scenario Specific"
  }, [activeTab])

  const contextLabel = activeTab === "scenario" ? scenarioLabel(scenario) : "Across your scenarios"

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

  function moveToExercise(index: number) {
    setExerciseIndex(index)
    resetExerciseState()
  }

  function nextExercise() {
    if (exerciseIndex >= activeExercises.length - 1) return
    moveToExercise(exerciseIndex + 1)
  }

  function toggleBuildWord(word: string) {
    setSelectedBuildWords((current) => {
      if (current.includes(word)) return current.filter((value) => value !== word)
      return [...current, word]
    })
  }

  function chooseMatchLeft(word: string) {
    setLeftChoice(word)
    if (rightChoice && !matches[word]) {
      setMatches((current) => ({ ...current, [word]: rightChoice }))
      setRightChoice(null)
      setLeftChoice(null)
    }
  }

  function chooseMatchRight(word: string) {
    setRightChoice(word)
    if (leftChoice && !matches[leftChoice]) {
      setMatches((current) => ({ ...current, [leftChoice]: word }))
      setLeftChoice(null)
      setRightChoice(null)
    }
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
      default:
        return false
    }
  }

  function submitExercise() {
    let isCorrect = false
    switch (exercise.id) {
      case "build":
        isCorrect =
          normalizeText(selectedBuildWords.join(" ")) === normalizeText(buildAnswer.join(" "))
        break
      case "complete":
        isCorrect = selectedCompleteWord === completeAnswer
        break
      case "match":
        isCorrect = matchLeft.every((left) => matches[left] === matchAnswer[left])
        break
      case "listen":
        isCorrect = normalizeText(listenText) === normalizeText("bghit atay afak")
        break
      case "speak":
        isCorrect = true
        break
      case "image":
        isCorrect = selectedImage === 2
        break
      default:
        isCorrect = false
    }
    setFeedback(isCorrect ? "success" : "error")
  }

  return (
    <main className="min-h-dvh w-full bg-[#f6f2e7] text-[#1f2f63]">
      <div className="mx-auto w-full max-w-[1200px] px-0 pb-8">
        <header className="border-b border-[#dfd7c8] px-5 py-5 sm:px-8">
          <p className="text-[11px] tracking-[0.2em] text-[#8f8068] uppercase">Learn / Testing</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Test your Darija.</h1>
          <p className="mt-1.5 text-sm text-[#6f6b61] sm:text-base">Put your knowledge to the test.</p>
        </header>

        <div className="border-b border-[#dfd7c8] px-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  moveToExercise(0)
                }}
                className={`border-b-3 py-4 text-sm ${
                  activeTab === tab.id
                    ? "border-[#a86d3f] font-semibold text-[#1f2f63]"
                    : "border-transparent text-[#7e7463]"
                }`}
              >
                {tab.label} <span className="ml-1 text-[10px]">{tab.index}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-[720px] md:grid-cols-[280px_1fr]">
          <aside className="border-r border-[#dfd7c8] px-4 py-6">
            <p className="px-2 text-[11px] tracking-[0.2em] text-[#7e7463] uppercase">Exercises</p>
            <div className="mt-4 space-y-2">
              {activeExercises.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => moveToExercise(index)}
                  className={`w-full rounded-xl border px-4 py-4 text-left ${
                    exerciseIndex === index
                      ? "border-[#d9ccb4] bg-[#f3ecdc]"
                      : "border-transparent bg-transparent hover:bg-[#f3ecdc]/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#1f2f63]">{item.title}</p>
                      <p className="mt-1 text-xs leading-4 text-[#7e7463]">{item.subtitle}</p>
                    </div>
                    <span className="pt-1 text-sm text-[#a86d3f]">{String(item.number).padStart(2, "0")}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 border-t border-[#dfd7c8] px-2 pt-6 text-sm text-[#7e7463]">
              <p>No extra steps.</p>
              <p className="mt-1">Just you and the exercise.</p>
            </div>
          </aside>

          <section className="px-8 py-8">
            <div className="flex items-center justify-between text-sm text-[#7e7463]">
              <Link href="/testing" className="inline-flex items-center gap-2 text-[#a86d3f]">
                <ArrowLeftIcon className="size-4" /> All scenarios
              </Link>
              <span>{contextLabel}</span>
            </div>

            <div className="mt-6 h-2 rounded-full bg-[#e8e1d3]">
              <div
                className="h-full rounded-full bg-[#a86d3f] transition-all"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className="mt-2 text-right text-sm text-[#7e7463]">
              {exerciseIndex + 1} / {activeExercises.length}
            </p>

            <p className="mt-8 text-[11px] tracking-[0.2em] text-[#a86d3f] uppercase">
              {activeTab === "scenario" ? `Exercise ${String(exercise.number).padStart(2, "0")}` : sectionLabel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2f63] sm:text-3xl">{exercise.title}</h2>

            {exercise.id === "build" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">Arrange the words to translate the sentence below.</p>
                <div className="mt-5 inline-block rounded-xl border border-[#d9ccb4] bg-[#fffdf8] px-4 py-3 text-base sm:px-5 sm:text-lg">
                  {activeTab === "grammar" ? "This tea is hot." : "I would like tea, please."}
                </div>
                <div className="mt-6 min-h-24 rounded-xl border border-[#e4dccb] bg-[#faf6ee] p-4">
                  {selectedBuildWords.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedBuildWords.map((word) => (
                        <button
                          key={word}
                          type="button"
                          onClick={() => toggleBuildWord(word)}
                          className="rounded-xl border border-[#cdbb9d] bg-white px-4 py-2 text-base"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base text-[#8f8068]">Drop your words here to build the sentence</p>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {(activeTab === "grammar" ? ["skhoun", "Had", "atay", "skhouna"] : buildWords).map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => toggleBuildWord(word)}
                      className={`rounded-xl border px-4 py-2 text-base ${
                        selectedBuildWords.includes(word)
                          ? "border-[#a86d3f] bg-[#f6eddd]"
                          : "border-[#d9ccb4] bg-white"
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {exercise.id === "complete" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">Choose a word from the bank to fill the blank.</p>
                <div className="mt-5 inline-block rounded-xl border border-[#d9ccb4] bg-[#fffdf8] px-4 py-3 text-base sm:px-5 sm:text-lg">
                  {activeTab === "grammar" ? "This tea is hot." : "I would like tea, please."}
                </div>
                <div className="mt-8 text-center text-2xl sm:text-3xl">
                  Bghit{" "}
                  <span className="inline-block min-w-40 rounded-xl border border-dashed border-[#d9ccb4] px-4 py-2">
                    {selectedCompleteWord ?? "..."}
                  </span>{" "}
                  ‘afak.
                </div>
                <div className="mt-8 flex justify-center gap-3">
                  {completeWords.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setSelectedCompleteWord(word)}
                      className={`rounded-xl border px-4 py-2 text-base ${
                        selectedCompleteWord === word
                          ? "border-[#a86d3f] bg-[#f6eddd]"
                          : "border-[#d9ccb4] bg-white"
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {exercise.id === "match" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">Connect each Darija word with its English meaning.</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-[11px] tracking-[0.2em] text-[#7e7463] uppercase">Darija</p>
                    {matchLeft.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => chooseMatchLeft(word)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-base ${
                          leftChoice === word ? "border-[#1f2f63] bg-[#eff2f8]" : "border-[#d9ccb4] bg-white"
                        }`}
                      >
                        {word}
                        {matches[word] ? <span className="text-sm text-[#a86d3f]">1</span> : null}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] tracking-[0.2em] text-[#7e7463] uppercase">English</p>
                    {matchRight.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => chooseMatchRight(word)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-base ${
                          rightChoice === word ? "border-[#1f2f63] bg-[#eff2f8]" : "border-[#d9ccb4] bg-white"
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {exercise.id === "listen" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">Play the audio, then type what you hear.</p>
                <div className="mt-8 flex items-center gap-6 rounded-xl border border-[#d9ccb4] bg-white px-6 py-6">
                  <button className="flex size-14 items-center justify-center rounded-full bg-[#1f2f63] text-white">
                    <VolumeIcon className="size-7" />
                  </button>
                  <div>
                    <p className="text-base font-semibold text-[#1f2f63]">Listen to the sentence</p>
                    <p className="mt-1 text-sm text-[#a86d3f]">Play slowly</p>
                  </div>
                </div>
                <textarea
                  value={listenText}
                  onChange={(event) => setListenText(event.target.value)}
                  className="mt-6 min-h-30 w-full rounded-xl border border-[#d9ccb4] bg-white px-4 py-3 text-base outline-none"
                  placeholder="Type the sentence in Latin Darija..."
                />
              </>
            ) : null}

            {exercise.id === "speak" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">Listen to the phrase, then say it aloud.</p>
                <div className="mt-8 rounded-xl border border-[#d9ccb4] bg-white px-6 py-6">
                  <p dir="rtl" className="text-2xl font-semibold text-[#1f2f63] sm:text-3xl">بغيت أتاي عافاك</p>
                  <p className="mt-2 text-base text-[#a86d3f]">Bghit atay ‘afak</p>
                </div>
                <button type="button" className="mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-xl border border-[#d9ccb4] bg-white text-sm font-semibold tracking-wide text-[#1f2f63]">
                  <MicIcon className="size-6" /> TAP TO SPEAK
                </button>
              </>
            ) : null}

            {exercise.id === "image" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[#6f6b61] sm:text-base">Choose the picture that matches the Darija word.</p>
                <div className="mt-6 text-center">
                  <p className="text-[11px] tracking-[0.2em] text-[#7e7463] uppercase">Darija Word</p>
                  <p className="mt-2 text-2xl font-semibold sm:text-3xl">
                    atay <span className="ml-2 text-[#a86d3f]">أتاي</span>
                  </p>
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {[
                    { id: 1, emoji: "🥛" },
                    { id: 2, emoji: "🫖" },
                    { id: 3, emoji: "🥧" },
                  ].map((item) => {
                    const selected = selectedImage === item.id
                    const correct = feedback === "success" && item.id === 2
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedImage(item.id)}
                        className={`rounded-xl border bg-white px-4 py-8 ${
                          correct
                            ? "border-emerald-700 bg-emerald-50"
                            : selected
                              ? "border-[#1f2f63] bg-[#eff2f8]"
                              : "border-[#d9ccb4]"
                        }`}
                      >
                        <p className="text-5xl sm:text-6xl">{item.emoji}</p>
                        <p className="mt-4 inline-flex size-8 items-center justify-center rounded-md border border-[#d9ccb4] text-sm">
                          {item.id}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}

            {feedback ? (
              <div
                className={`mt-8 flex items-center justify-between rounded-xl border px-5 py-4 ${
                  feedback === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <div>
                  <p className="text-lg font-semibold">
                    {feedback === "success" ? "That’s right." : "Not quite this time."}
                  </p>
                  <p className="mt-1 text-sm leading-5">
                    {feedback === "success"
                      ? exercise.id === "image"
                        ? "Ready for the next exercise?"
                        : "Great progress. Keep going."
                      : `Answer: ${
                          exercise.id === "build"
                            ? buildAnswer.join(" ")
                            : exercise.id === "complete"
                              ? completeAnswer
                              : exercise.id === "listen"
                                ? "bghit atay afak"
                                : exercise.id === "match"
                                  ? "atay → Tea, lma → Water, khobz → Bread, lḥsab → The bill"
                                  : "Pick image 2"
                        }`}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (exerciseIndex >= activeExercises.length - 1) {
                      setFeedback(null)
                      return
                    }
                    nextExercise()
                  }}
                  className="h-12 rounded-xl bg-[#1f2f63] px-6 text-white hover:bg-[#1a2858]"
                >
                  {exerciseIndex >= activeExercises.length - 1 ? "Finish" : "Continue"}{" "}
                  <ArrowRightIcon className="ml-1 size-4" />
                </Button>
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between border-t border-[#dfd7c8] pt-5">
              <button
                type="button"
                onClick={resetExerciseState}
                className="text-xs text-[#a86d3f] underline-offset-4 hover:underline"
              >
                Reset exercise
              </button>
              <Button
                type="button"
                onClick={submitExercise}
                disabled={!canCheck()}
                className="h-12 rounded-xl bg-[#1f2f63] px-6 text-white disabled:bg-[#ddd6c7] disabled:text-[#8f8068]"
              >
                {exercise.id === "speak" ? "Continue" : "Check answer"} <ArrowRightIcon className="ml-1 size-4" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
