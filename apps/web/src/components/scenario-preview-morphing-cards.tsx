"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  getPreviewProgressKey,
  getScenarioProfile,
  type PreviewCardWord,
  type WordType,
} from "@/lib/scenario-learning-content"
import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"

const wordTypes: readonly WordType[] = ["noun", "adjective", "verb"]

const typeLabels: Record<WordType, string> = {
  noun: "Nouns",
  adjective: "Adjectives",
  verb: "Verbs",
}

const typeNumbers: Record<WordType, string> = {
  noun: "01",
  adjective: "02",
  verb: "03",
}

export default function ScenarioPreviewMorphingCards({
  scenario,
}: {
  scenario: ScenarioId
}): React.JSX.Element {
  const profile = useMemo(() => getScenarioProfile(scenario), [scenario])
  const cards = profile.words
  const [activeIndex, setActiveIndex] = useState(0)
  const [showImage, setShowImage] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [departing, setDeparting] = useState<{
    card: PreviewCardWord
    direction: "left" | "right"
  } | null>(null)
  const motionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeCard = cards[activeIndex]!
  const progress = ((activeIndex + 1) / cards.length) * 100

  useEffect(
    () => () => {
      if (motionTimer.current) clearTimeout(motionTimer.current)
    },
    []
  )

  const move = (nextIndex: number) => {
    if (
      nextIndex === activeIndex ||
      nextIndex < 0 ||
      nextIndex >= cards.length ||
      departing
    ) {
      return
    }

    if (motionTimer.current) clearTimeout(motionTimer.current)
    setDeparting({
      card: activeCard,
      direction: nextIndex > activeIndex ? "left" : "right",
    })
    setActiveIndex(nextIndex)
    setShowImage(false)
    motionTimer.current = setTimeout(() => setDeparting(null), 560)
  }

  const finishPreview = () => {
    window.localStorage.setItem(getPreviewProgressKey(scenario), "true")
    setCompleted(true)
  }

  const advance = () => {
    if (activeIndex === cards.length - 1) {
      finishPreview()
      return
    }
    move(activeIndex + 1)
  }

  const selectType = (type: WordType) => {
    const index = cards.findIndex((card) => card.type === type)
    move(index)
  }

  return (
    <section className="mx-auto w-full max-w-[1080px] px-4 pb-24 md:px-8 md:pb-10">
      <div className="mb-4 flex items-end justify-between gap-5 md:mb-5">
        <div>
          <p className="font-[family-name:var(--font-inter)] text-[11px] font-semibold tracking-[0.18em] text-[#8a6648] uppercase dark:text-[#c9a982]">
            Before the conversation
          </p>
          <h2 className="mt-1 max-w-xl font-[family-name:var(--font-lato)] text-2xl leading-tight font-bold text-[#162456] md:text-[30px] dark:text-[#f2efe4]">
            A small vocabulary goes a long way.
          </h2>
        </div>
        <p className="hidden max-w-[265px] text-right font-[family-name:var(--font-lato)] text-sm leading-5 text-muted-foreground md:block">
          Ten words selected for your first {profile.title.toLowerCase()} exchange.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[26px] bg-[#162456] text-[#f5efdf] shadow-[0_24px_60px_rgba(22,36,86,0.2)]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-[#d5bb91]/45"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full border border-[#d5bb91]/10"
        />
        <div
          aria-hidden="true"
          className="absolute -top-14 -right-6 size-52 rounded-full border border-[#d5bb91]/10"
        />

        <header className="relative z-10 flex min-h-20 items-center justify-between border-b border-[#f2efe4]/12 px-5 py-4 md:px-7">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-[#d8c29d]/45 font-[family-name:var(--font-lato)] text-xs font-bold text-[#dbc39b]">
              DG
            </span>
            <div>
              <p className="font-[family-name:var(--font-inter)] text-[10px] font-semibold tracking-[0.15em] text-[#c8b28f] uppercase">
                Scenario primer
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-lato)] text-base font-bold text-[#fffaf0]">
                {profile.title} · Lesson 1
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-inter)] text-xs font-medium text-[#d5c5a9]">
              {String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
            </p>
            <div className="mt-2 h-1 w-20 overflow-hidden rounded-full bg-white/10 md:w-28">
              <div
                className="h-full rounded-full bg-[#b98a5f] transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="relative z-10 grid md:grid-cols-[132px_minmax(360px,1fr)_270px]">
          <nav
            aria-label="Word groups"
            className="flex border-b border-[#f2efe4]/12 md:flex-col md:border-r md:border-b-0"
          >
            {wordTypes.map((type) => {
              const selected = activeCard.type === type
              const count = cards.filter((card) => card.type === type).length
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectType(type)}
                  className={`relative flex min-h-[70px] flex-1 items-center gap-2 px-4 text-left transition-colors md:min-h-0 md:flex-none md:items-start md:gap-0 md:px-5 md:py-6 ${
                    selected
                      ? "bg-[#8a5a3b] text-white"
                      : "text-[#cdbfa8] hover:bg-white/[0.045] hover:text-white"
                  }`}
                >
                  <span className="font-[family-name:var(--font-inter)] text-[10px] font-semibold tracking-[0.14em] opacity-65 md:block">
                    {typeNumbers[type]}
                  </span>
                  <span className="font-[family-name:var(--font-lato)] text-sm font-bold md:mt-5 md:block">
                    {typeLabels[type]}
                  </span>
                  <span className="ml-auto font-[family-name:var(--font-inter)] text-[10px] opacity-60 md:absolute md:right-4 md:bottom-3">
                    {count}
                  </span>
                </button>
              )
            })}
            <div className="hidden flex-1 items-end border-t border-[#f2efe4]/12 p-5 md:flex">
              <p className="font-[family-name:var(--font-lato)] text-[11px] leading-5 text-[#ad9f89]">
                Listen.<br />Notice.<br />Speak.
              </p>
            </div>
          </nav>

          <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden px-5 py-8 md:min-h-[500px] md:px-8">
            <div className="relative h-[368px] w-full max-w-[390px] [perspective:1200px]">
              <div className="absolute inset-x-5 top-0 h-full translate-x-5 translate-y-3 rotate-[2.5deg] rounded-[20px] border border-[#b99269]/50 bg-[#714b36]" />
              <div className="absolute inset-x-3 top-0 h-full -translate-x-1 translate-y-2 -rotate-[1.5deg] rounded-[20px] border border-[#d6be94]/30 bg-[#9a704f]" />

              <LearningCard
                key={activeCard.id}
                card={activeCard}
                showImage={showImage}
                onToggleImage={() => setShowImage((current) => !current)}
                className="preview-card-arrive absolute inset-0 z-20"
              />

              {departing ? (
                <LearningCard
                  card={departing.card}
                  showImage={false}
                  onToggleImage={() => undefined}
                  className={`pointer-events-none absolute inset-0 z-30 ${
                    departing.direction === "left"
                      ? "preview-card-leave-left"
                      : "preview-card-leave-right"
                  }`}
                />
              ) : null}
            </div>
          </div>

          <aside className="border-t border-[#f2efe4]/12 bg-[#111e49]/45 p-5 md:border-t-0 md:border-l md:p-6">
            <p className="font-[family-name:var(--font-inter)] text-[10px] font-semibold tracking-[0.16em] text-[#bfa889] uppercase">
              Language note
            </p>
            <p className="mt-3 font-[family-name:var(--font-lato)] text-base leading-6 text-[#f5efdf]">
              {activeCard.cue}
            </p>

            <div className="mt-6 border-t border-[#f2efe4]/12 pt-5">
              <p className="font-[family-name:var(--font-inter)] text-[10px] font-semibold tracking-[0.16em] text-[#bfa889] uppercase">
                Form
              </p>
              <div className="mt-3 space-y-2">
                {activeCard.grammar.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 font-[family-name:var(--font-inter)] text-xs leading-5 text-[#ddd1bc]"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#b98a5f]/60 text-[9px] text-[#cda981]">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-1.5" aria-label="Lesson position">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => move(index)}
                  aria-label={`Open ${card.english}`}
                  aria-current={index === activeIndex ? "step" : undefined}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-7 bg-[#c18a5d]"
                      : index < activeIndex
                        ? "w-3 bg-[#d6c3a3]/65"
                        : "w-3 bg-white/15 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>

            <div className="mt-7 grid grid-cols-[42px_1fr] gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => move(activeIndex - 1)}
                disabled={activeIndex === 0 || Boolean(departing)}
                aria-label="Previous word"
                className="size-[42px] rounded-full border-[#d7c29e]/30 bg-transparent text-[#eee3d0] hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                onClick={advance}
                disabled={Boolean(departing)}
                className="h-[42px] rounded-full bg-[#b77b52] px-5 font-[family-name:var(--font-inter)] text-xs font-semibold text-white hover:bg-[#c58a61]"
              >
                {activeIndex === cards.length - 1 ? "Complete preview" : "Next word"}
                <ArrowRight className="size-4" />
              </Button>
            </div>

            {completed ? (
              <div className="mt-4 border-t border-[#f2efe4]/12 pt-4">
                <p className="font-[family-name:var(--font-lato)] text-xs leading-5 text-[#d8caae]">
                  Primer complete. Take these words into the conversation.
                </p>
                <Link
                  href={`/learning/scenarios/${scenario}/geniechat`}
                  className={buttonVariants({
                    className:
                      "mt-3 h-10 w-full rounded-full bg-[#f1e6d0] font-[family-name:var(--font-inter)] text-xs font-semibold text-[#162456] hover:bg-white",
                  })}
                >
                  Enter GenieChat
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  )
}

function LearningCard({
  card,
  showImage,
  onToggleImage,
  className,
}: {
  card: PreviewCardWord
  showImage: boolean
  onToggleImage: () => void
  className: string
}): React.JSX.Element {
  return (
    <article
      className={`${className} overflow-hidden rounded-[20px] border border-[#d6c19c] bg-[#f3ead8] text-[#162456] shadow-[0_20px_48px_rgba(5,12,37,0.32)]`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#b69a71]/35 px-5 py-4">
          <p className="font-[family-name:var(--font-inter)] text-[10px] font-bold tracking-[0.17em] text-[#855a3d] uppercase">
            {card.type}
          </p>
          <span className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.12em] text-[#86765e] uppercase">
            Darija · English
          </span>
        </div>

        <div className="relative flex flex-1 flex-col px-6 pt-6 pb-5">
          <span
            aria-hidden="true"
            className="absolute top-5 right-5 font-[family-name:var(--font-lato)] text-[74px] leading-none font-bold text-[#9e704d]/9"
          >
            ع
          </span>

          <p
            dir="rtl"
            className="relative z-10 font-[family-name:var(--font-simplified-arabic)] text-[46px] leading-[1.25] font-semibold text-[#162456]"
          >
            {card.darija}
          </p>
          <p className="mt-2 font-[family-name:var(--font-inter)] text-sm font-medium tracking-wide text-[#755b45]">
            {card.transliteration}
          </p>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-[#b69a71]/35 pt-5">
            <div>
              <p className="font-[family-name:var(--font-inter)] text-[9px] font-bold tracking-[0.16em] text-[#9a7657] uppercase">
                Meaning
              </p>
              <p className="mt-1 font-[family-name:var(--font-lato)] text-xl font-bold text-[#162456]">
                {card.english}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleImage}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#9c7b5b]/40 text-[#74533d] transition-colors hover:bg-[#e7d8bf]"
              aria-label={showImage ? "Hide visual reference" : "Show visual reference"}
            >
              {showImage ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {showImage ? (
          <div className="preview-card-image relative h-[106px] shrink-0 border-t border-[#b69a71]/35">
            <Image
              src={card.image}
              alt={card.english}
              fill
              sizes="390px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#162456]/35 to-transparent" />
          </div>
        ) : null}
      </div>
    </article>
  )
}
