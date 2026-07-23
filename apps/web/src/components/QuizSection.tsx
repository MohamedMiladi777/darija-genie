import { Apple, BedDouble, CircleDollarSign, Timer } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
const quizzes = [
  {
    title: "Food",
    subtitle: "Level 1",
    icon: Apple,
  },
  {
    title: "Money",
    subtitle: "Level 2",
    icon: CircleDollarSign,
  },
  {
    title: "Time",
    subtitle: "Level 3",
    icon: Timer,
  },
  {
    title: "Hotel",
    subtitle: "Level 1",
    icon: BedDouble,
  },
  {
    title: "Vocabulary",
    subtitle: "7 lessons",
    progress: 19.23,
  },
];

const QuizSection = (): React.JSX.Element => {
  return (
    <section
      className="mt-[22px] flex h-[242px] w-full flex-col gap-4 overflow-hidden"
      aria-labelledby="quizzes-heading"
    >
      <header className="flex h-[46px] items-center justify-between px-4 pt-[7px]">
        <h2
          id="quizzes-heading"
          className="[font-family:'Open_Sans-Bold',Helvetica] text-xl font-bold leading-7 text-tailwindcss-colors-blue-blue-950"
        >
          Quizzes
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="h-auto p-0 [font-family:'Lato-Regular',Helvetica] text-base font-normal leading-[25.6px] tracking-[-0.16px] text-tailwindcss-colors-stone-stone-500 hover:bg-transparent hover:text-tailwindcss-colors-stone-stone-500"
        >
          See All
        </Button>
      </header>
      <div className="grid grid-cols-2 gap-x-[27px] gap-y-2.5 px-4">
        {quizzes.map((quiz) => {
          const Icon = quiz.icon;

          return (
            <Card
              key={quiz.title}
              className={`h-[85px] min-w-0 overflow-hidden rounded-[var(--tailwindcss-border-radius-rounded-xl)] border border-solid border-mode-base-border shadow-shadow-xs ${
                quiz.progress !== undefined
                  ? "bg-tailwindcss-colors-indigo-indigo-100"
                  : "bg-white"
              }`}
            >
              <CardContent className="flex h-full items-center p-4">
                {quiz.progress !== undefined ? (
                  <div className="flex w-full flex-col items-center gap-1">
                    <p className="font-text-base-leading-regular-medium text-[length:var(--text-base-leading-regular-medium-font-size)] font-[number:var(--text-base-leading-regular-medium-font-weight)] leading-[var(--text-base-leading-regular-medium-line-height)] tracking-[var(--text-base-leading-regular-medium-letter-spacing)] text-tailwindcss-colors-blue-blue-950">
                      {quiz.title}
                    </p>
                    <p className="font-text-sm-leading-normal-regular text-[length:var(--text-sm-leading-normal-regular-font-size)] font-[number:var(--text-sm-leading-normal-regular-font-weight)] leading-[var(--text-sm-leading-normal-regular-line-height)] tracking-[var(--text-sm-leading-normal-regular-letter-spacing)] text-mode-base-muted-foreground">
                      {quiz.subtitle}
                    </p>
                    <div
                      className="mt-1 h-1 w-full overflow-hidden rounded-full bg-mode-base-muted"
                      aria-label={`${quiz.progress}% complete`}
                    >
                      <div
                        className="h-full rounded-full bg-tailwindcss-colors-blue-blue-700"
                        style={{ width: `${quiz.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto flex w-full items-center justify-between p-0 text-left hover:bg-transparent"
                    aria-label={`${quiz.title}, ${quiz.subtitle}`}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-text-base-leading-regular-medium text-[length:var(--text-base-leading-regular-medium-font-size)] font-[number:var(--text-base-leading-regular-medium-font-weight)] leading-[var(--text-base-leading-regular-medium-line-height)] tracking-[var(--text-base-leading-regular-medium-letter-spacing)] text-tailwindcss-colors-blue-blue-950">
                        {quiz.title}
                      </span>
                      <span className="font-text-sm-leading-normal-regular text-[length:var(--text-sm-leading-normal-regular-font-size)] font-[number:var(--text-sm-leading-normal-regular-font-weight)] leading-[var(--text-sm-leading-normal-regular-line-height)] tracking-[var(--text-sm-leading-normal-regular-letter-spacing)] text-mode-base-muted-foreground">
                        {quiz.subtitle}
                      </span>
                    </span>
                    {Icon && (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-raw-colors-blue-800 text-white">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default QuizSection;
