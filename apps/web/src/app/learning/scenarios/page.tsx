import Image from "next/image"
import Link from "next/link"

import LearningMobileNavigation from "@/components/LearningMobileNavigation"
import LearningSidebar from "@/components/LearningSidebar"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

const scenarios = [
  {
    id: "restaurant-1",
    title: "Restaurant",
    description: "Practice Moroccan restaurant",
    image: "/assets/scenarios/restaurant.jpg",
  },
  {
    id: "shopping-1",
    title: "Shopping",
    description: "Practice Shopping in Souks",
    image: "/assets/scenarios/shopping.jpg",
  },
  {
    id: "restaurant-2",
    title: "Restaurant",
    description: "Practice Moroccan restaurant",
    image: "/assets/scenarios/restaurant.jpg",
  },
  {
    id: "shopping-2",
    title: "Shopping",
    description: "Practice Shopping in Souks",
    image: "/assets/scenarios/shopping.jpg",
  },
] as const

function MobileStatusBar(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex h-12 w-full max-w-[402px] items-center justify-between px-8 text-[#0a0a0a] md:hidden"
    >
      <span className="font-[family-name:var(--font-inter)] text-sm leading-none font-semibold">
        9:41
      </span>
      <div className="flex items-center gap-2">
        <span className="flex h-3 items-end gap-[1.5px]">
          {[3, 5, 7, 9].map((height) => (
            <span
              key={height}
              className="w-[2px] rounded-sm bg-[#0a0a0a]"
              style={{ height }}
            />
          ))}
        </span>
        <span className="relative block h-[11px] w-[14px] overflow-hidden">
          <span className="absolute top-0 left-1/2 size-[14px] -translate-x-1/2 rotate-45 rounded-tl-[9px] border-t-2 border-l-2 border-[#0a0a0a]" />
          <span className="absolute bottom-0 left-1/2 size-[5px] -translate-x-1/2 rotate-45 rounded-tl-sm border-t-2 border-l-2 border-[#0a0a0a]" />
        </span>
        <span className="relative block h-[9px] w-[18px] rounded-[2px] border border-[#0a0a0a]">
          <span className="absolute inset-[1.5px] rounded-[1px] bg-[#0a0a0a]" />
          <span className="absolute top-[2px] -right-[3px] h-[3px] w-[2px] rounded-r-sm bg-[#0a0a0a]" />
        </span>
      </div>
    </div>
  )
}

function BackButton({
  desktop = false,
}: {
  desktop?: boolean
}): React.JSX.Element {
  return (
    <Link
      href="/learning"
      aria-label="Back to learning"
      className={buttonVariants({
        variant: "outline",
        size: "icon",
        className:
          "size-9 rounded-[10px] border-[#e5e5e5] bg-white p-0 shadow-none hover:bg-white",
      })}
    >
      <Image
        src={
          desktop
            ? "/assets/scenarios/back-desktop.svg"
            : "/assets/scenarios/back-mobile.svg"
        }
        alt=""
        width={desktop ? 16 : 11}
        height={desktop ? 16 : 11}
        className={desktop ? "size-4" : "size-[10.667px]"}
      />
    </Link>
  )
}

function ScenarioCard({
  scenario,
}: {
  scenario: (typeof scenarios)[number]
}): React.JSX.Element {
  return (
    <Card className="gap-0 rounded-[14px] bg-white py-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-[#e5e5e5] md:rounded-2xl">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={scenario.image}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <CardContent className="flex min-h-[62px] items-center justify-between gap-3 px-3 py-[11px] md:min-h-[66px] md:py-3">
        <div className="min-w-0 font-[family-name:var(--font-inter)] text-sm leading-5">
          <h3 className="truncate font-medium text-[#0a0a0a]">
            {scenario.title}
          </h3>
          <p className="truncate font-normal text-[#797979]">
            {scenario.description}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Open ${scenario.title} scenario`}
          className="size-8 shrink-0 rounded-xl bg-transparent p-0 hover:bg-[#162456]/8 md:bg-[#162456] md:hover:bg-[#162456]/85"
        >
          <Image
            src="/assets/learning/scenario-arrow.svg"
            alt=""
            width={14}
            height={14}
            className="size-3.5 brightness-0 md:brightness-100"
          />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ScenariosPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-white text-[#162456] md:flex">
      <LearningSidebar />

      <div className="min-w-0 flex-1 bg-[#f2efe4] md:h-dvh md:overflow-y-auto">
        <MobileStatusBar />

        <header className="sticky top-0 z-20 mx-auto flex h-14 w-full max-w-[402px] items-center justify-between bg-[#f2efe4] px-4 md:hidden">
          <BackButton />
          <h1 className="font-[family-name:var(--font-lato)] text-xl leading-7 font-bold text-[#0a0a0a]">
            Scenarios
          </h1>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="More options"
            className="size-9 rounded-[10px] border-[#e5e5e5] bg-white p-0 shadow-none hover:bg-white"
          >
            <Image
              src="/assets/scenarios/more.svg"
              alt=""
              width={12}
              height={3}
              className="h-[2.333px] w-[11.667px]"
            />
          </Button>
        </header>

        <header className="hidden min-h-[95px] items-center border-b border-[#ded5c3] bg-[#f2efe4] px-8 py-5 md:flex">
          <div className="flex h-[54px] items-center gap-3">
            <BackButton desktop />
            <div>
              <h1 className="font-[family-name:var(--font-sans)] text-2xl leading-8 font-bold text-[#162456]">
                Scenarios
              </h1>
              <p className="pt-0.5 font-[family-name:var(--font-lato)] text-sm leading-5 font-normal text-[#79716b]">
                Learn Darija through scenarios
              </p>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-[402px] px-4 pt-2 pb-20 md:max-w-[896px] md:px-8 md:pt-6 md:pb-8">
          <div>
            <h2 className="font-[family-name:var(--font-lato)] text-xl leading-7 font-bold text-[#2d3648] md:font-[family-name:var(--font-sans)] md:text-[#162456]">
              Pick a scenario
            </h2>
            <p className="font-[family-name:var(--font-lato)] text-[11px] leading-[15.4px] font-normal text-[#797979] md:text-xs md:leading-4 md:text-[#79716b]">
              Learn Darija through scenarios
            </p>
          </div>

          <div className="mt-[34px] grid grid-cols-1 gap-[15px] md:mt-4 md:grid-cols-2 md:gap-4">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </section>
      </div>

      <LearningMobileNavigation />
    </main>
  )
}
