import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import ScenarioChatLaunchLink from "@/components/scenario-chat-launch-link"
import ScenarioPageChrome from "@/components/scenario-page-chrome"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"

import { isScenarioId, scenarioIds, type ScenarioId } from "../scenario-data"

const learningOptions = [
  {
    id: "genie-chat",
    title: "GenieChat",
    description: "Chat with the bot",
    image: "/assets/scenario-home/genie-chat.jpg",
    featured: true,
  },
  {
    id: "preview",
    title: "Preview",
    description: "Grammar, expressions etc.",
    image: "/assets/scenario-home/preview.png",
  },
  {
    id: "review",
    title: "Review",
    description: "Review previous conversations",
    image: "/assets/scenario-home/review.jpg",
  },
  {
    id: "quiz",
    title: "Scenario Quiz",
    description: "Test your Darija knowledge",
    image: "/assets/scenario-home/quiz.jpg",
  },
] as const

export function generateStaticParams(): Array<{ scenario: string }> {
  return scenarioIds.map((scenario) => ({ scenario }))
}

function LearningOptionCard({
  option,
  scenario,
}: {
  option: (typeof learningOptions)[number]
  scenario: ScenarioId
}): React.JSX.Element {
  const isFeatured = "featured" in option && option.featured

  const card = (
    <Card
      className={`gap-0 rounded-[14px] bg-card py-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-border transition-transform md:rounded-2xl ${
        isFeatured
          ? "h-[164px] w-full md:h-[306px]"
          : "h-[204px] min-w-0 md:h-[271px]"
      }`}
    >
      <CardHeader
        className={`grid-cols-[1fr_auto] gap-2 px-4 py-4 ${
          isFeatured ? "h-20" : "h-[100px] md:h-20"
        }`}
      >
        <div className="min-w-0 font-[family-name:var(--font-inter)]">
          <h2 className="text-base leading-6 font-medium text-foreground">
            {option.title}
          </h2>
          <p className="mt-1 text-sm leading-5 font-normal text-muted-foreground">
            {option.description}
          </p>
        </div>
        {isFeatured ? (
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#1e40af] shadow-xs md:bg-[#162456]">
            <Image
              src="/assets/learning/scenario-arrow.svg"
              alt=""
              width={14}
              height={14}
              className="size-3.5"
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-xl bg-[#1e40af] shadow-xs md:bg-[#162456]"
          >
            <Image
              src="/assets/learning/scenario-arrow.svg"
              alt=""
              width={14}
              height={14}
              className="size-3.5"
            />
          </span>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div
          className={`relative overflow-hidden rounded-[10px] border border-border md:rounded-xl ${
            isFeatured ? "h-[68px] md:h-[209px]" : "h-[88px] md:h-[174px]"
          }`}
        >
          <Image
            src={option.image}
            alt=""
            fill
            sizes={
              isFeatured
                ? "(min-width: 768px) 668px, 268px"
                : "(min-width: 768px) 310px, 149px"
            }
            className="object-cover"
          />
        </div>
      </CardContent>
    </Card>
  )

  if (isFeatured) {
    return (
      <ScenarioChatLaunchLink
        scenario={scenario}
        ariaLabel="Open GenieChat"
        className="group col-span-2 w-[300px] justify-self-center rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 md:w-full md:rounded-2xl [&_[data-slot=card]]:group-hover:-translate-y-0.5"
      >
        {card}
      </ScenarioChatLaunchLink>
    )
  }

  if (option.id === "preview") {
    return (
      <Link
        href={`/learning/scenarios/${scenario}/preview`}
        aria-label="Open Preview"
        className="group min-w-0 rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 md:rounded-2xl [&_[data-slot=card]]:group-hover:-translate-y-0.5"
      >
        {card}
      </Link>
    )
  }

  if (option.id === "quiz") {
    return (
      <Link
        href={`/testing?scenario=${scenario}`}
        aria-label="Open Scenario Quiz"
        className="group col-span-2 w-[300px] justify-self-center rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 md:w-[calc(50%-8px)] md:rounded-2xl [&_[data-slot=card]]:group-hover:-translate-y-0.5"
      >
        {card}
      </Link>
    )
  }

  return card
}

function ActivityChart(): React.JSX.Element {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

  return (
    <section aria-labelledby="activity-heading" className="mt-6 pb-5 md:pb-8">
      <header className="flex h-7 items-start justify-between px-4 md:px-0">
        <h2
          id="activity-heading"
          className="font-[family-name:var(--font-lato)] text-xl leading-7 font-bold text-foreground"
        >
          Your Activity
        </h2>
        <p className="font-[family-name:var(--font-lato)] text-[11px] leading-[15px] text-muted-foreground md:text-xs md:leading-4">
          January - May
        </p>
      </header>

      <div className="relative mx-auto h-[161px] w-[240px] md:mt-6 md:w-[448px]">
        <div className="relative h-32 border-b border-l border-border">
          {[0, 24, 48, 72, 95].map((top) => (
            <span
              key={top}
              className="absolute right-0 left-0 h-px bg-[#e5e5e5]/20"
              style={{ top }}
            />
          ))}
          <div className="absolute right-0 bottom-0 left-0 h-[105px]">
            <Image
              src="/assets/scenario-home/activity-fill.svg"
              alt=""
              fill
              sizes="(min-width: 768px) 448px, 240px"
            />
          </div>
          <div className="absolute top-[21px] right-0 left-0 h-[86px]">
            <Image
              src="/assets/scenario-home/activity-line.svg"
              alt=""
              fill
              sizes="(min-width: 768px) 448px, 240px"
            />
          </div>
        </div>

        <div className="absolute top-[134px] right-0 left-0 grid grid-cols-6 font-[family-name:var(--font-inter)] text-[8px] leading-3 text-muted-foreground md:text-xs md:leading-4">
          {months.map((month) => (
            <span key={month} className="text-center">
              {month}
            </span>
          ))}
        </div>

        <div className="absolute top-[153px] right-0 left-0 flex items-center justify-center gap-1 font-[family-name:var(--font-inter)] text-[8px] leading-none text-muted-foreground md:text-xs">
          <span className="size-1.5 rounded-[1px] bg-[#8fc6ff]" />
          <span>Activity</span>
        </div>
      </div>
    </section>
  )
}

export default async function ScenarioHomePage({
  params,
}: {
  params: Promise<{ scenario: string }>
}): Promise<React.JSX.Element> {
  const { scenario } = await params

  if (!isScenarioId(scenario)) {
    notFound()
  }

  return (
    <main className="min-h-dvh w-full bg-card text-foreground md:flex">
      <div className="min-w-0 flex-1 bg-background md:h-dvh md:overflow-y-auto">
        <ScenarioPageChrome
          backHref="/learning/scenarios"
          desktopSubtitle="What would you like to learn today?"
        />

        <div className="mx-auto w-full max-w-[400px] pb-20 md:max-w-[1024px] md:px-8 md:pt-6 md:pb-8">
          <section aria-labelledby="learning-options-heading">
            <div className="px-4 md:px-0">
              <h2
                id="learning-options-heading"
                className="font-[family-name:var(--font-lato)] text-xl leading-7 font-bold text-foreground"
              >
                What would you like to learn today?
              </h2>
              <p className="mt-[7px] font-[family-name:var(--font-lato)] text-[11px] leading-[15px] font-normal text-muted-foreground md:mt-1 md:text-xs md:leading-4">
                Choose how you&apos;d like to practise your language skills.
                Learn new concepts, review past conversations, or start chatting
                with your AI tutor.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-[10px] gap-y-4 px-[15px] md:gap-4 md:px-0">
              {learningOptions.map((option) => (
                <LearningOptionCard
                  key={option.id}
                  option={option}
                  scenario={scenario}
                />
              ))}
            </div>
          </section>

          <ActivityChart />
        </div>
      </div>
    </main>
  )
}
