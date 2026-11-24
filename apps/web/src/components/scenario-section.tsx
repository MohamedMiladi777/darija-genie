import Image from "next/image"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

import { ArrowRightIcon } from "./icons"

const scenarios = [
  {
    id: "restaurant",
    title: "Restaurant",
    description: "Learn how to order a tajine",
    href: "/learning/scenarios/restaurant-1",
    image: "/assets/learning/scenarios/restaurant.jpg",
    imageWidth: 720,
    imageHeight: 688,
  },
  {
    id: "shopping",
    title: "Shopping",
    description: "Become immune to scammers",
    href: "/learning/scenarios/shopping-1",
    image: "/assets/learning/scenarios/shopping.jpg",
    imageWidth: 735,
    imageHeight: 919,
  },
  {
    id: "directions",
    title: "Directions",
    description: "Navigate the medina like a local",
    href: "/learning/scenarios",
    image: "/assets/learning/scenarios/directions.jpg",
    imageWidth: 1200,
    imageHeight: 1629,
  },
  {
    id: "market",
    title: "Market",
    description: "Haggle with confidence",
    href: "/learning/scenarios",
    image: "/assets/learning/scenarios/market.jpg",
    imageWidth: 1200,
    imageHeight: 1200,
  },
] as const

export const ScenarioSection = (): React.JSX.Element => (
  <section aria-labelledby="scenarios-heading" className="w-full min-w-0">
    <div className="flex items-center justify-between gap-3">
      <h2
        id="scenarios-heading"
        className="text-xl leading-7 font-bold text-foreground"
      >
        Scenarios
      </h2>
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/learning/scenarios" />}
        nativeButton={false}
      >
        See All
      </Button>
    </div>

    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {scenarios.map((scenario) => (
        <Link
          key={scenario.id}
          href={scenario.href}
          className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <article className="flex h-full min-h-24 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-[border-color,box-shadow,transform] group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md motion-reduce:transition-none">
            <Image
              src={scenario.image}
              alt=""
              width={scenario.imageWidth}
              height={scenario.imageHeight}
              sizes="72px"
              className="size-[72px] shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm leading-5 font-semibold text-foreground">
                {scenario.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">
                {scenario.description}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none dark:bg-blue-950/40 dark:text-blue-300"
            >
              <ArrowRightIcon className="size-5" />
            </span>
          </article>
        </Link>
      ))}
    </div>
  </section>
)

export default ScenarioSection
