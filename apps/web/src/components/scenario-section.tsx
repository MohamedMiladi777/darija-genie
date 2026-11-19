import Link from "next/link"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Button } from "@workspace/ui/components/button"

import {
  ChevronDownIcon,
  DirectionsIcon,
  MarketIcon,
  RestaurantIcon,
  ShoppingIcon,
} from "./icons"

const scenarios = [
  {
    id: "restaurant",
    title: "Restaurant",
    description: "Learn how to order a tajine",
    href: "/learning/scenarios/restaurant-1",
    icon: RestaurantIcon,
    accent: "#2fa6a3",
  },
  {
    id: "shopping",
    title: "Shopping",
    description: "Become immune to scammers",
    href: "/learning/scenarios/shopping-1",
    icon: ShoppingIcon,
    accent: "#c06a2a",
  },
  {
    id: "directions",
    title: "Directions",
    description: "Navigate the medina like a local",
    href: "/learning/scenarios",
    icon: DirectionsIcon,
    accent: "#4e9bd6",
  },
  {
    id: "market",
    title: "Market",
    description: "Haggle with confidence",
    href: "/learning/scenarios",
    icon: MarketIcon,
    accent: "#b57452",
  },
] as const

const columns = [scenarios.slice(0, 2), scenarios.slice(2)]

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

    <div className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
      {columns.map((column, columnIndex) => (
        <Accordion
          key={columnIndex}
          multiple
          defaultValue={columnIndex === 0 ? [scenarios[0].id] : []}
          className="bg-card"
        >
          {column.map((scenario) => {
            const Icon = scenario.icon

            return (
              <AccordionItem key={scenario.id} value={scenario.id}>
                <AccordionTrigger className="group">
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${scenario.accent} 15%, transparent)`,
                      color: scenario.accent,
                    }}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {scenario.title}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180 motion-reduce:transition-none"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pt-3 pb-4 pl-[60px]">
                    <p className="text-sm leading-5 text-muted-foreground">
                      {scenario.description}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      render={<Link href={scenario.href} />}
                      nativeButton={false}
                      aria-label={`Start ${scenario.title} scenario`}
                    >
                      Start scenario
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ))}
    </div>
  </section>
)

export default ScenarioSection
