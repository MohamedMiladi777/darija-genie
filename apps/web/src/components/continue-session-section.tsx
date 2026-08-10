import Image from "next/image"

import { ArrowRight, Clock3, Play } from "lucide-react"

const sessions = [
  {
    badge: "Scenario Quiz",
    badgeClassName: "bg-[#fe9a00]",
    title: "Restaurant",
    subtitle: "Order a tajine",
    progress: 60,
    image: "/assets/learning/sessions/restaurant.jpg",
    recent: true,
  },
  {
    badge: "Chat Session",
    badgeClassName: "bg-[#00a86b]",
    title: "Darija Bot",
    subtitle: "Free conversation",
    image: "/assets/learning/sessions/darija-bot.jpg",
    timestamp: "3 days ago",
  },
  {
    badge: "Vocabulary",
    badgeClassName: "bg-[#1447e6]",
    title: "Food & Drinks",
    subtitle: "50 words · Level 2",
    progress: 45,
    image: "/assets/learning/sessions/food-drinks.jpg",
  },
  {
    badge: "General Quiz",
    badgeClassName: "bg-[#9333ea]",
    title: "Grammar Basics",
    subtitle: "Verb conjugation",
    progress: 20,
    image: "/assets/learning/sessions/grammar.jpg",
  },
] as const

const ContinueSessionSection = (): React.JSX.Element => (
  <section aria-labelledby="continue-session-heading" className="w-full">
    <div className="flex items-center justify-between">
      <h2
        id="continue-session-heading"
        className="text-xl leading-7 font-bold text-[#162456]"
      >
        Continue Session
      </h2>
      <button
        type="button"
        className="font-[family-name:var(--font-lato)] text-base text-[#79716b]"
      >
        See All
      </button>
    </div>
    <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sessions.map((session) => (
        <article
          key={session.title}
          className="relative h-[190px] basis-[210px] grow shrink-0 snap-start overflow-hidden rounded-2xl text-white"
        >
          <Image
            src={session.image}
            alt=""
            fill
            sizes="210px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <span
              className={`rounded-full px-2 py-[3px] text-[10px] leading-[10px] font-semibold ${session.badgeClassName}`}
            >
              {session.badge}
            </span>
            {"recent" in session && session.recent && (
              <span className="flex items-center gap-1 rounded-full bg-black/30 px-1.5 py-[3px] text-[9px] leading-[10px]">
                <Clock3 className="size-1.5" />
                Recent
              </span>
            )}
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1 font-[family-name:var(--font-inter)]">
              <h3 className="truncate text-sm leading-[17.5px] font-semibold">
                {session.title}
              </h3>
              <p className="mt-0.5 truncate text-[11px] leading-[14px] text-white/80">
                {session.subtitle}
              </p>
              {"progress" in session && session.progress !== undefined ? (
                <div className="mt-2">
                  <div className="flex justify-between text-[11px] leading-[14px]">
                    <span>Progress</span>
                    <span>{session.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-[3px] rounded-full bg-white/30">
                    <div
                      role="progressbar"
                      aria-label={`${session.title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={session.progress}
                      className="h-full rounded-full bg-[#1447e6]"
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-2 flex items-center gap-1 text-[11px] leading-[14px]">
                  <Clock3 className="size-2.5" />
                  {"timestamp" in session ? session.timestamp : ""}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label={`Continue ${session.title}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1e40af] hover:bg-[#193cb8]"
            >
              {("timestamp" in session ? session.timestamp : "") ? (
                <ArrowRight className="size-4" />
              ) : (
                <Play className="ml-0.5 size-4 fill-white" />
              )}
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
)

export default ContinueSessionSection
