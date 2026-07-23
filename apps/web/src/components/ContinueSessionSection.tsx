import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";

const sessions = [
  {
    title: "Grammar",
    lessons: "5 lessons",
    progress: 66,
  },
  {
    title: "Vocabulary",
    lessons: "7 lessons",
    progress: 20,
  },
];

const ContinueSessionSection = (): React.JSX.Element => {
  return (
    <section
      aria-labelledby="continue-session-heading"
      className="w-full border-b border-mode-base-border pb-3"
    >
      <header className="flex items-center justify-between px-4 pt-[7px] pb-3">
        <h2
          id="continue-session-heading"
          className="[font-family:'Open_Sans-Bold',Helvetica] text-xl font-bold leading-7 text-tailwindcss-colors-blue-blue-950"
        >
          Continue Session
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="h-auto p-0 [font-family:'Lato-Regular',Helvetica] text-base font-normal tracking-[-0.16px] text-tailwindcss-colors-stone-stone-500 hover:bg-transparent hover:text-tailwindcss-colors-stone-stone-500"
        >
          See All
        </Button>
      </header>
      <div className="grid grid-cols-2 gap-7 px-4">
        {sessions.map((session) => (
          <Card
            key={session.title}
            className="overflow-hidden rounded-xl border-mode-base-border bg-white shadow-shadow-xs"
          >
            <CardContent className="p-0">
              <div className="px-4 py-4 text-center">
                <h3 className="font-text-base-leading-regular-medium text-[length:var(--text-base-leading-regular-medium-font-size)] font-[number:var(--text-base-leading-regular-medium-font-weight)] leading-[var(--text-base-leading-regular-medium-line-height)] tracking-[var(--text-base-leading-regular-medium-letter-spacing)] text-tailwindcss-colors-blue-blue-950 [font-style:var(--text-base-leading-regular-medium-font-style)]">
                  {session.title}
                </h3>
                <p className="mt-1 font-text-sm-leading-normal-regular text-[length:var(--text-sm-leading-normal-regular-font-size)] font-[number:var(--text-sm-leading-normal-regular-font-weight)] leading-[var(--text-sm-leading-normal-regular-line-height)] tracking-[var(--text-sm-leading-normal-regular-letter-spacing)] text-mode-base-muted-foreground [font-style:var(--text-sm-leading-normal-regular-font-style)]">
                  {session.lessons}
                </p>
              </div>
              <div className="px-4 pb-4">
                <div className="mb-2 flex items-center justify-between text-tailwindcss-colors-blue-blue-950">
                  <span className="font-text-base-leading-regular-medium text-[length:var(--text-base-leading-regular-medium-font-size)] font-[number:var(--text-base-leading-regular-medium-font-weight)] leading-[var(--text-base-leading-regular-medium-line-height)] tracking-[var(--text-base-leading-regular-medium-letter-spacing)] [font-style:var(--text-base-leading-regular-medium-font-style)]">
                    Progress
                  </span>
                  <span className="font-text-base-leading-regular-medium text-[length:var(--text-base-leading-regular-medium-font-size)] font-[number:var(--text-base-leading-regular-medium-font-weight)] leading-[var(--text-base-leading-regular-medium-line-height)] tracking-[var(--text-base-leading-regular-medium-letter-spacing)] [font-style:var(--text-base-leading-regular-medium-font-style)]">
                    {session.progress}%
                  </span>
                </div>
                <Progress
                  value={session.progress}
                  className="h-1 bg-mode-base-muted [&>div]:bg-tailwindcss-colors-blue-blue-700"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ContinueSessionSection;
