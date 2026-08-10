import Image from "next/image"
import Link from "next/link"

const scenarios = [
  { title: "Restaurant", description: "Learn how to order a tajine" },
  { title: "Shopping", description: "Become immune to scammers" },
  {
    title: "Directions",
    description: "Navigate the medina like a local",
    mobileHidden: true,
  },
  {
    title: "Market",
    description: "Haggle with confidence",
    mobileHidden: true,
  },
] as const

export const ScenarioSection = (): React.JSX.Element => (
  <section aria-labelledby="scenarios-heading" className="w-full min-w-0">
    <div className="flex items-center justify-between">
      <h2
        id="scenarios-heading"
        className="text-xl leading-7 font-bold text-foreground"
      >
        Scenarios
      </h2>
      <Link
        href="/learning/scenarios"
        className="font-[family-name:var(--font-lato)] text-base leading-6 text-muted-foreground hover:text-foreground"
      >
        See All
      </Link>
    </div>
    <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
      {scenarios.map((scenario) => (
        <Link
          key={scenario.title}
          href="/learning/scenarios"
          aria-label={`Open ${scenario.title} scenario`}
          className={`flex h-[68px] w-[265px] shrink-0 snap-start items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 shadow-xs transition-colors hover:bg-muted sm:w-auto ${"mobileHidden" in scenario && scenario.mobileHidden ? "hidden sm:flex" : ""}`}
        >
          <span className="min-w-0 font-[family-name:var(--font-inter)]">
            <span className="block truncate text-sm leading-5 font-medium text-foreground">
              {scenario.title}
            </span>
            <span className="block truncate text-sm leading-5 text-muted-foreground">
              {scenario.description}
            </span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-black">
            <Image
              src="/assets/learning/scenario-arrow-reworked.svg"
              alt=""
              width={14}
              height={14}
              className="size-[14px]"
            />
          </span>
        </Link>
      ))}
    </div>
  </section>
)

export default ScenarioSection
