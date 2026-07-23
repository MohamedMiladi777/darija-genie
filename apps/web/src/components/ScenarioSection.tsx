import Image from "next/image"
import Link from "next/link"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

const scenarios = [
  { title: "Restaurant", description: "Learn how to order a tajine" },
  { title: "Shopping", description: "Become immune to scammers" },
  {
    title: "Directions",
    description: "Navigate the medina like a local",
    desktopOnly: true,
  },
  {
    title: "Market",
    description: "Haggle with confidence",
    desktopOnly: true,
  },
] as const

export const ScenarioSection = (): React.JSX.Element => {
  return (
    <section
      aria-labelledby="scenarios-heading"
      className="overflow-hidden border-b border-[#e5e5e5] pt-2.5 md:border-0 md:pt-0"
    >
      <div className="mx-auto w-full max-w-6xl pb-3.5 md:pb-0">
        <header className="flex h-[46px] items-center justify-between px-4 pt-[7px] sm:px-6 md:h-auto md:px-0 md:pt-0">
          <h2
            id="scenarios-heading"
            className="text-xl leading-7 font-bold text-[#162456]"
          >
            Scenarios
          </h2>
          <Link
            href="/learning/scenarios"
            className={buttonVariants({
              variant: "ghost",
              className:
                "h-[39px] px-0 font-[family-name:var(--font-lato)] text-base leading-6 font-normal text-[#79716b] hover:bg-transparent hover:text-[#79716b] md:h-auto",
            })}
          >
            See All
          </Link>
        </header>

        <div className="flex snap-x snap-mandatory gap-[15px] overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-6 md:mt-3 md:gap-4 md:px-0 [&::-webkit-scrollbar]:hidden">
          {scenarios.map((scenario, index) => (
            <Card
              key={scenario.title}
              className={`w-[265px] shrink-0 snap-start gap-0 rounded-[14px] bg-white py-0 shadow-xs ring-0 sm:w-auto md:rounded-2xl ${
                "desktopOnly" in scenario && scenario.desktopOnly
                  ? "hidden md:flex"
                  : ""
              }`}
            >
              <CardContent className="flex h-[68px] w-full items-center gap-1 p-3">
                <div className="min-w-0 flex-1 font-[family-name:var(--font-inter)]">
                  <h3 className="truncate text-sm leading-5 font-medium text-[#09090b]">
                    {scenario.title}
                  </h3>
                  <p className="truncate text-sm leading-5 text-[#737373]">
                    {scenario.description}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label={`Open ${scenario.title} scenario`}
                  className={`size-8 rounded-[10px] p-0 shadow-xs md:bg-black md:hover:bg-black/80 ${
                    index === 0
                      ? "bg-[#1e40af] hover:bg-[#1e40af]/80"
                      : "bg-black hover:bg-black/80"
                  }`}
                >
                  <span className="flex size-4 items-center justify-center">
                    <Image
                      src="/assets/learning/scenario-arrow.svg"
                      alt=""
                      width={14.667}
                      height={14.667}
                      className="size-[14.667px]"
                    />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ScenarioSection
