import Image from "next/image"
import Link from "next/link"

import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import LearningSidebar from "@/components/app-sidebar"
import ScenarioPageChrome from "@/components/scenario-page-chrome"
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

function ScenarioCard({
  scenario,
}: {
  scenario: (typeof scenarios)[number]
}): React.JSX.Element {
  return (
    <Link
      href={`/learning/scenarios/${scenario.id}`}
      aria-label={`Open ${scenario.title} scenario`}
      className="group rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 md:rounded-2xl"
    >
      <Card className="gap-0 rounded-[inherit] bg-card py-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-border transition-transform group-hover:-translate-y-0.5">
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
            <h3 className="truncate font-medium text-foreground">
              {scenario.title}
            </h3>
            <p className="truncate font-normal text-muted-foreground">
              {scenario.description}
            </p>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-transparent md:bg-[#162456]">
            <Image
              src="/assets/learning/scenario-arrow.svg"
              alt=""
              width={14}
              height={14}
              className="size-3.5 brightness-0 md:brightness-100"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ScenariosPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-card text-foreground md:flex">
      <LearningSidebar />

      <div className="min-w-0 flex-1 bg-background md:h-dvh md:overflow-y-auto">
        <ScenarioPageChrome
          backHref="/learning"
          desktopSubtitle="Learn Darija through scenarios"
        />

        <section className="mx-auto w-full max-w-[402px] px-4 pt-2 pb-20 md:max-w-[896px] md:px-8 md:pt-6 md:pb-8">
          <div>
            <h2 className="font-[family-name:var(--font-lato)] text-xl leading-7 font-bold text-foreground md:font-[family-name:var(--font-sans)] md:text-foreground">
              Pick a scenario
            </h2>
            <p className="font-[family-name:var(--font-lato)] text-[11px] leading-[15.4px] font-normal text-muted-foreground md:text-xs md:leading-4 md:text-muted-foreground">
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
