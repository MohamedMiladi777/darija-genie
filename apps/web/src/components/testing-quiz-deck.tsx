"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { scenarioIds, type ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"
import { getScenarioProfile } from "@/lib/scenario-learning-content"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

type Difficulty = "beginner" | "advanced"
type TestingScenarioKey = "restaurant" | "shop" | "market"

interface TestingScenarioCard {
  key: TestingScenarioKey
  title: string
  subtitle: string
  description: string
  image: string
  units: ScenarioId[]
}

interface Question {
  id: string
  unitId: ScenarioId
  prompt: string
  options: string[]
  answer: string
}

const testingScenarios: readonly TestingScenarioCard[] = [
  {
    key: "restaurant",
    title: "Restaurant",
    subtitle: "Ordering & requests",
    description: "Practice menu, table, tea, and paying phrases.",
    image: "/assets/testing/scenario-restaurant-morocco.svg",
    units: ["restaurant-1", "restaurant-2"],
  },
  {
    key: "shop",
    title: "Shop",
    subtitle: "Items & prices",
    description: "Short store interactions with practical vocabulary.",
    image: "/assets/testing/scenario-shop-souk.svg",
    units: ["shopping-1"],
  },
  {
    key: "market",
    title: "Market",
    subtitle: "Bargaining in souk",
    description: "Focus on negotiation and price-lowering language.",
    image: "/assets/testing/scenario-market-morocco.svg",
    units: ["shopping-2"],
  },
]

function isScenarioIdValue(value: string): value is ScenarioId {
  return scenarioIds.some((scenarioId) => scenarioId === value)
}

function unitLabel(unitId: ScenarioId): string {
  const [family, rawUnit] = unitId.split("-")
  const title = family === "restaurant" ? "Restaurant" : "Shopping"
  return `${title} · Unit ${rawUnit}`
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]!
    copy[index] = copy[randomIndex]!
    copy[randomIndex] = current
  }
  return copy
}

function getDistractors(pool: readonly string[], answer: string): string[] {
  return shuffle(pool.filter((item) => item !== answer)).slice(0, 3)
}

function buildQuestions(selectedUnits: readonly ScenarioId[], difficulty: Difficulty): Question[] {
  const englishPool = Array.from(
    new Set(
      selectedUnits.flatMap((unitId) =>
        getScenarioProfile(unitId).words.map((word) => word.english)
      )
    )
  )

  const darijaPool = Array.from(
    new Set(
      selectedUnits.flatMap((unitId) =>
        getScenarioProfile(unitId).words.map((word) => word.darija)
      )
    )
  )

  const questions = selectedUnits.flatMap((unitId) => {
    const profile = getScenarioProfile(unitId)

    return profile.words.map((word) => {
      if (difficulty === "beginner") {
        const answer = word.english
        const options = shuffle([answer, ...getDistractors(englishPool, answer)])
        return {
          id: `${unitId}-${word.id}-beginner`,
          unitId,
          prompt: `What does “${word.darija}” (${word.transliteration}) mean?`,
          options,
          answer,
        }
      }

      const answer = word.darija
      const options = shuffle([answer, ...getDistractors(darijaPool, answer)])
      return {
        id: `${unitId}-${word.id}-advanced`,
        unitId,
        prompt: `Choose the Darija word for “${word.english}” (${word.cue})`,
        options,
        answer,
      }
    })
  })

  const size = difficulty === "beginner" ? 8 : 12
  return shuffle(questions).slice(0, size)
}

export default function TestingQuizDeck(): React.JSX.Element {
  const searchParams = useSearchParams()

  const scenarioParam = searchParams.get("scenario")
  const initialUnit =
    scenarioParam && isScenarioIdValue(scenarioParam) ? scenarioParam : null

  const initialScenario = useMemo(() => {
    if (!initialUnit) return null
    return (
      testingScenarios.find((scenario) => scenario.units.includes(initialUnit)) ?? null
    )
  }, [initialUnit])

  const [selectedScenario, setSelectedScenario] = useState<TestingScenarioKey | null>(
    initialScenario?.key ?? null
  )
  const [selectedUnits, setSelectedUnits] = useState<ScenarioId[]>(
    initialUnit ? [initialUnit] : []
  )
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner")

  const [sessionState, setSessionState] = useState<"setup" | "running" | "done">("setup")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const scenario =
    testingScenarios.find((entry) => entry.key === selectedScenario) ?? null

  const currentQuestion = questions[currentIndex] ?? null
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const score = questions.reduce((total, question) => {
    if (answers[question.id] === question.answer) return total + 1
    return total
  }, 0)

  const selectScenario = (key: TestingScenarioKey) => {
    setSelectedScenario(key)
    const nextScenario = testingScenarios.find((entry) => entry.key === key)
    setSelectedUnits(nextScenario ? [...nextScenario.units] : [])
  }

  const toggleUnit = (unitId: ScenarioId) => {
    setSelectedUnits((previous) => {
      if (previous.includes(unitId)) {
        return previous.filter((item) => item !== unitId)
      }
      return [...previous, unitId]
    })
  }

  const startQuiz = () => {
    if (!scenario || selectedUnits.length === 0) return
    const generatedQuestions = buildQuestions(selectedUnits, difficulty)
    setQuestions(generatedQuestions)
    setAnswers({})
    setCurrentIndex(0)
    setSessionState("running")
  }

  const chooseAnswer = (option: string) => {
    if (!currentQuestion) return
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: option,
    }))
  }

  const nextQuestion = () => {
    const isLast = currentIndex >= questions.length - 1
    if (isLast) {
      setSessionState("done")
      return
    }
    setCurrentIndex((previous) => previous + 1)
  }

  const resetSession = () => {
    setSessionState("setup")
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)
  }

  if (sessionState === "running" && currentQuestion) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length} · {difficulty}
        </p>
        <h3 className="pt-2 text-lg leading-7 font-bold text-foreground">{currentQuestion.prompt}</h3>

        <div className="mt-4 grid gap-2">
          {currentQuestion.options.map((option) => {
            const active = selectedAnswer === option
            return (
              <Button
                key={option}
                type="button"
                variant={active ? "secondary" : "outline"}
                onClick={() => chooseAnswer(option)}
                className="h-auto justify-start rounded-xl px-4 py-3 text-left text-sm"
              >
                {option}
              </Button>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Unit: {unitLabel(currentQuestion.unitId)}</p>
          <Button type="button" disabled={!selectedAnswer} onClick={nextQuestion}>
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    )
  }

  if (sessionState === "done") {
    return (
      <Card className="rounded-2xl bg-card py-0 shadow-sm ring-border">
        <CardContent className="space-y-4 p-5">
          <h3 className="text-xl font-bold text-foreground">Results</h3>
          <p className="text-sm text-muted-foreground">
            You scored <span className="font-semibold text-foreground">{score}</span> / {questions.length}
          </p>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Scenario:</span> {scenario?.title ?? "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Difficulty:</span> {difficulty}
            </p>
            <p>
              <span className="font-medium text-foreground">Units:</span>{" "}
              {selectedUnits.map((unitId) => unitLabel(unitId)).join(", ")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={startQuiz}>
              Retake
            </Button>
            <Button type="button" variant="outline" onClick={resetSession}>
              Back to setup
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">1) Choose a scenario</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {testingScenarios.map((item) => {
            const selected = item.key === selectedScenario
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => selectScenario(item.key)}
                className="group rounded-[14px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 md:rounded-2xl"
              >
                <Card
                  className={`gap-0 rounded-[inherit] bg-card py-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all ${
                    selected
                      ? "ring-2 ring-[#162456] dark:ring-[#8ab4ff]"
                      : "ring-border group-hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    {selected ? (
                      <span className="absolute top-3 right-3 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <CardContent className="min-h-[112px] px-4 py-3">
                    <p className="text-xs font-semibold tracking-[0.2px] text-[#c6b89b] uppercase">
                      {item.subtitle}
                    </p>
                    <h4 className="pt-0.5 text-base font-semibold text-foreground">{item.title}</h4>
                    <p className="pt-1 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-lg font-bold text-foreground">2) Choose units</h3>
        {!scenario ? (
          <p className="pt-2 text-sm text-muted-foreground">
            Select a scenario card above to unlock unit selection.
          </p>
        ) : (
          <>
            <p className="pt-1 text-sm text-muted-foreground">
              Scenario: <span className="font-medium text-foreground">{scenario.title}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {scenario.units.map((unitId) => {
                const selected = selectedUnits.includes(unitId)
                return (
                  <Button
                    key={unitId}
                    type="button"
                    variant={selected ? "secondary" : "outline"}
                    onClick={() => toggleUnit(unitId)}
                    className="rounded-full"
                  >
                    {unitLabel(unitId)}
                  </Button>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-lg font-bold text-foreground">3) Choose difficulty</h3>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant={difficulty === "beginner" ? "secondary" : "outline"}
            onClick={() => setDifficulty("beginner")}
          >
            Beginner
          </Button>
          <Button
            type="button"
            variant={difficulty === "advanced" ? "secondary" : "outline"}
            onClick={() => setDifficulty("advanced")}
          >
            Advanced
          </Button>
        </div>

        <Button
          type="button"
          className="mt-6 h-10 rounded-xl px-6"
          disabled={!scenario || selectedUnits.length === 0}
          onClick={startQuiz}
        >
          {!scenario
            ? "Select a scenario first"
            : selectedUnits.length === 0
              ? "Select at least one unit"
              : "Start quiz"}
        </Button>
      </section>
    </div>
  )
}
