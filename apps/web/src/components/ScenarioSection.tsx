import { ArrowUpRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
const scenarios = [
  {
    title: "Restaurant",
    description: "Learn how to order a tajine",
    iconClassName: "bg-raw-colors-blue-800",
  },
  {
    title: "Shopping",
    description: "Become immune to scammers",
    iconClassName: "bg-mode-base-primary",
  },
];

export const ScenarioSection = (): React.JSX.Element => {
  return (
    <section
      aria-labelledby="scenarios-heading"
      className="mt-[26px] flex w-full flex-col gap-4 overflow-hidden"
    >
      <header className="flex h-[46px] items-center justify-between px-4 pt-[7px]">
        <h2
          id="scenarios-heading"
          className="[font-family:'Open_Sans-Bold',Helvetica] text-xl font-bold leading-[28px] tracking-[0] text-tailwindcss-colors-blue-blue-950"
        >
          Scenarios
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="h-auto px-0 [font-family:'Lato-Regular',Helvetica] text-base font-normal leading-[25.6px] tracking-[-0.16px] text-tailwindcss-colors-stone-stone-500 hover:bg-transparent hover:text-tailwindcss-colors-stone-stone-500"
        >
          See All
        </Button>
      </header>
      <div className="flex w-max items-center gap-[15px] px-4">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.title}
            className="w-[265px] shrink-0 rounded-[14px] border-0 bg-white shadow-none"
          >
            <CardContent className="flex items-start gap-[var(--tailwindcss-gap-gap-1)] p-[var(--tailwindcss-padding-padding-y-py-3)]">
              <div className="flex min-w-0 flex-1 flex-col items-start gap-[var(--tailwindcss-gap-gap-1)]">
                <p className="w-full font-text-sm-leading-normal-medium text-[length:var(--text-sm-leading-normal-medium-font-size)] font-[number:var(--text-sm-leading-normal-medium-font-weight)] leading-[var(--text-sm-leading-normal-medium-line-height)] tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] text-mode-base-foreground [font-style:var(--text-sm-leading-normal-medium-font-style)]">
                  {scenario.title}
                </p>
                <p className="w-full font-text-sm-leading-normal-regular text-[length:var(--text-sm-leading-normal-regular-font-size)] font-[number:var(--text-sm-leading-normal-regular-font-weight)] leading-[var(--text-sm-leading-normal-regular-line-height)] tracking-[var(--text-sm-leading-normal-regular-letter-spacing)] text-mode-base-muted-foreground [font-style:var(--text-sm-leading-normal-regular-font-style)]">
                  {scenario.description}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                aria-label={`Open ${scenario.title} scenario`}
                className={`h-8 w-8 shrink-0 rounded-[var(--tailwindcss-border-radius-rounded-lg)] shadow-shadow-xs ${scenario.iconClassName}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="ml-[-1px] h-[3px] w-full border border-solid border-mode-base-border"
      />
    </section>
  );
};

export default ScenarioSection;
