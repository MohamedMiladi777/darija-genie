"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface Quiz {
  id: string
  title: string
  arabic: string
  description: string
  questions: number
  duration: number
  image: string
}

const quizzes: readonly Quiz[] = [
  {
    id: "grammar",
    title: "Grammar",
    arabic: "القواعد",
    description: "Master Darija sentence structure and verb conjugations",
    questions: 15,
    duration: 12,
    image: "/assets/testing/grammar.jpg",
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    arabic: "الكلمات",
    description: "Test how many Darija words you know across everyday topics",
    questions: 20,
    duration: 10,
    image: "/assets/testing/vocabulary.jpg",
  },
  {
    id: "numbers",
    title: "Numbers",
    arabic: "الأرقام",
    description: "Practice numbers, prices, dates, and everyday counting",
    questions: 10,
    duration: 6,
    image: "/assets/testing/numbers.jpg",
  },
  {
    id: "phrases",
    title: "Phrases",
    arabic: "العبارات",
    description: "Build confidence with useful Darija phrases for daily life",
    questions: 25,
    duration: 15,
    image: "/assets/testing/phrases.jpg",
  },
  {
    id: "culture",
    title: "Culture",
    arabic: "الثقافة",
    description: "Explore Moroccan traditions, customs, and cultural knowledge",
    questions: 12,
    duration: 10,
    image: "/assets/testing/culture.jpg",
  },
]

export default function TestingQuizDeck(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [exitingQuiz, setExitingQuiz] = useState<Quiz | null>(null)
  const [launching, setLaunching] = useState(false)
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const quiz = quizzes[activeIndex]!

  useEffect(
    () => () => {
      if (launchTimer.current) clearTimeout(launchTimer.current)
      if (deckTimer.current) clearTimeout(deckTimer.current)
    },
    []
  )

  const selectQuiz = (index: number) => {
    if (index === activeIndex || exitingQuiz) return
    const nextDirection = index > activeIndex ? "right" : "left"
    setDirection(nextDirection)
    setExitingQuiz(quiz)
    setActiveIndex(index)
    deckTimer.current = setTimeout(() => setExitingQuiz(null), 650)
  }

  const move = (step: number) => {
    if (exitingQuiz) return
    selectQuiz((activeIndex + step + quizzes.length) % quizzes.length)
  }

  const startQuiz = () => {
    if (launchTimer.current) clearTimeout(launchTimer.current)
    setLaunching(true)
    launchTimer.current = setTimeout(() => setLaunching(false), 900)
  }

  const motionClass =
    direction === "right" ? "slide-in-from-right-5" : "slide-in-from-left-5"
  const transitionClass = `animate-in fade-in-0 ${motionClass} duration-500 motion-reduce:animate-none`

  return (
    <div className="grid items-start gap-8 pt-6 lg:grid-cols-[minmax(300px,360px)_minmax(280px,1fr)] lg:gap-10">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[360px] [perspective:1200px]">
        {quizzes.map((card, index) => {
          const position =
            (index - activeIndex + quizzes.length) % quizzes.length
          if (position > 2) return null

          const deckStyle =
            position === 0
              ? {
                  zIndex: 30,
                  transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)",
                  opacity: 1,
                }
              : position === 1
                ? {
                    zIndex: 20,
                    transform:
                      "translate3d(4.5%, 4%, -30px) rotate(2deg) scale(.97)",
                    opacity: 0.8,
                  }
                : {
                    zIndex: 10,
                    transform:
                      "translate3d(7%, 8%, -60px) rotate(-2deg) scale(.94)",
                    opacity: 0.55,
                  }

          return (
            <article
              key={card.id}
              aria-hidden={position !== 0}
              className="absolute inset-0 origin-top overflow-hidden rounded-2xl text-white shadow-sm transition-[transform,opacity] duration-[650ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
              style={deckStyle}
            >
              <QuizCardFace
                quiz={card}
                active={position === 0}
                priority={index === 0}
                onStart={startQuiz}
              />
            </article>
          )
        })}

        {exitingQuiz ? (
          <article
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-40 origin-center overflow-hidden rounded-2xl text-white shadow-xl motion-reduce:hidden ${direction === "right" ? "quiz-card-exit-left" : "quiz-card-exit-right"}`}
          >
            <QuizCardFace
              quiz={exitingQuiz}
              active
              priority={false}
              onStart={startQuiz}
            />
          </article>
        ) : null}
      </div>

      <div className="min-w-0">
        <div key={`details-${quiz.id}`} className={transitionClass}>
          <p className="text-xs text-muted-foreground">
            {activeIndex + 1} of {quizzes.length}
          </p>
          <h3 className="pt-1.5 text-[28px] leading-[35px] font-bold text-foreground">
            {quiz.title}
          </h3>
          <p className="pt-1 font-[family-name:var(--font-inter)] text-[13px] leading-5 text-[#c6b89b]">
            {quiz.arabic}
          </p>
          <p className="max-w-xl pt-3 font-[family-name:var(--font-lato)] text-[15px] leading-[22px] text-muted-foreground">
            {quiz.description}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-6">
            <MetricCard label="Questions" value={quiz.questions} />
            <MetricCard label="Duration" value={quiz.duration} suffix="min" />
          </div>

          <button
            type="button"
            onClick={startQuiz}
            aria-live="polite"
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#162456] font-[family-name:var(--font-inter)] text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1d2d64] active:translate-y-0 disabled:cursor-wait"
            disabled={launching}
          >
            <Image
              src="/assets/testing/play.svg"
              alt=""
              width={16}
              height={16}
              className={`size-4 ${launching ? "animate-pulse" : ""}`}
            />
            {launching ? `Preparing ${quiz.title}…` : "Start Quiz"}
          </button>

          <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center">
            <button
              type="button"
              onClick={() => move(-1)}
              className="flex items-center gap-1.5 justify-self-start text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Image
                src="/assets/testing/previous.svg"
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
              Previous
            </button>
            <div
              className="flex items-center gap-1.5"
              aria-label="Quiz position"
            >
              {quizzes.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectQuiz(index)}
                  aria-label={`Show ${item.title} quiz`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 ${index === activeIndex ? "w-5 bg-[#162456]" : "w-2 bg-[#c6b89b] hover:bg-[#a99b80]"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => move(1)}
              className="flex items-center gap-1.5 justify-self-end text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Next
              <Image
                src="/assets/testing/next.svg"
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="font-[family-name:var(--font-inter)] text-xs leading-[18px] font-semibold tracking-[0.3px] text-muted-foreground uppercase">
            All quizzes
          </h3>
          <div className="flex flex-col gap-2 pt-3">
            {quizzes.map((item, index) => {
              const selected = index === activeIndex
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectQuiz(index)}
                  aria-pressed={selected}
                  className={`flex min-h-[65px] w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${selected ? "border-[#162456]/20 bg-card shadow-sm" : "border-transparent bg-card/50 hover:bg-card/80"}`}
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-1.5">
                      <span className="truncate font-[family-name:var(--font-inter)] text-[13px] leading-4 font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="truncate text-[11px] leading-4 text-[#c6b89b]">
                        {item.arabic}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                      {item.questions} questions · {item.duration} min
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuizCardFace({
  quiz,
  active,
  priority,
  onStart,
}: {
  quiz: Quiz
  active: boolean
  priority: boolean
  onStart: () => void
}): React.JSX.Element {
  return (
    <>
      <Image
        src={quiz.image}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 767px) calc(100vw - 32px), 360px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
      {active ? (
        <>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-[family-name:var(--font-inter)] text-[13px] leading-[19.5px] font-medium text-white/70">
              {quiz.arabic}
            </p>
            <h3 className="pt-0.5 text-[28px] leading-[35px] font-bold">
              {quiz.title}
            </h3>
            <p className="max-w-[320px] pt-1 font-[family-name:var(--font-inter)] text-[13px] leading-[18.2px] text-white/75">
              {quiz.description}
            </p>
            <div className="flex items-center justify-between gap-3 pt-4">
              <div className="flex gap-3">
                <StatPill
                  icon="/assets/testing/clock.svg"
                  label={`${quiz.duration} min`}
                />
                <StatPill
                  icon="/assets/testing/questions.svg"
                  label={`${quiz.questions} questions`}
                />
              </div>
              <button
                type="button"
                onClick={onStart}
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-card px-4 font-[family-name:var(--font-inter)] text-[13px] font-semibold text-foreground shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Image
                  src="/assets/testing/card-play.svg"
                  alt=""
                  width={13}
                  height={13}
                  className="size-[13px]"
                />
                Start Quiz
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-black/20" />
      )}
    </>
  )
}

function StatPill({
  icon,
  label,
}: {
  icon: string
  label: string
}): React.JSX.Element {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-[family-name:var(--font-inter)] text-[10px] leading-[15px] font-semibold text-white">
      <Image src={icon} alt="" width={12} height={12} className="size-3" />
      {label}
    </span>
  )
}

function MetricCard({
  label,
  value,
  suffix,
}: {
  label: string
  value: number
  suffix?: string
}): React.JSX.Element {
  return (
    <div className="min-h-[90px] rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="font-[family-name:var(--font-inter)] text-[11px] leading-[17px] font-medium tracking-[0.25px] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="pt-1 text-2xl leading-9 font-bold text-foreground">
        {value}
        {suffix ? (
          <span className="pl-1 font-[family-name:var(--font-lato)] text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </p>
    </div>
  )
}
