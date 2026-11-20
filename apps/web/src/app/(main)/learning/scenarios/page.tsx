import Image from "next/image"
import Link from "next/link"

import ScenarioPageChrome from "@/components/scenario-page-chrome"
import { ArrowRightIcon } from "@/components/icons"
import { Card, CardContent } from "@workspace/ui/components/card"

const scenarios = [
  {
    id: "restaurant-1",
    title: "Restaurant",
    description: "Practice Moroccan restaurant",
    lesson: "Lesson 1",
    image: "/assets/scenarios/restaurant.jpg",
  },
  {
    id: "shopping-1",
    title: "Shopping",
    description: "Practice Shopping in Souks",
    lesson: "Lesson 1",
    image: "/assets/scenarios/shopping.jpg",
  },
  {
    id: "restaurant-2",
    title: "Restaurant",
    description: "Practice Moroccan restaurant",
    lesson: "Lesson 2",
    image: "/assets/scenarios/restaurant.jpg",
  },
  {
    id: "shopping-2",
    title: "Shopping",
    description: "Practice Shopping in Souks",
    lesson: "Lesson 2",
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
      aria-label={`Open ${scenario.title}, ${scenario.lesson}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-sm transition-[box-shadow,transform] group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={scenario.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 420px, (min-width: 768px) 45vw, 100vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        </div>
        <CardContent className="flex min-h-[62px] items-center justify-between gap-3 px-3 py-[11px] md:min-h-[66px] md:py-3">
          <div className="min-w-0 text-sm leading-5">
            <h3 className="truncate font-medium text-foreground">
              {scenario.title} <span className="font-normal text-muted-foreground">· {scenario.lesson}</span>
            </h3>
            <p className="truncate font-normal text-muted-foreground">
              {scenario.description}
            </p>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ScenariosPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-card text-foreground md:flex">
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
    </main>
  )
}
