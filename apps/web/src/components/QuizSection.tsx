import Image from "next/image"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

const quizzes = [
  {
    title: "Food",
    subtitle: "Level 1",
    icon: "/assets/learning/quiz-food.svg",
    iconClassName: "h-[14.667px] w-[14.667px]",
  },
  {
    title: "Money",
    subtitle: "Level 2",
    icon: "/assets/learning/quiz-money.svg",
    iconClassName: "h-[14.667px] w-[9.333px]",
  },
  {
    title: "Time",
    subtitle: "Level 3",
    icon: "/assets/learning/quiz-time.svg",
    iconClassName: "h-[14.667px] w-3",
  },
  {
    title: "Hotel",
    subtitle: "Level 1",
    icon: "/assets/learning/quiz-hotel.svg",
    iconClassName: "h-3 w-[13.333px]",
  },
] as const

const QuizSection = (): React.JSX.Element => {
  return (
    <section
      className="mx-auto w-full max-w-6xl pt-[22px]"
      aria-labelledby="quizzes-heading"
    >
      <header className="flex h-[46px] items-center justify-between px-4 pt-[7px] sm:px-6 md:px-8">
        <h2
          id="quizzes-heading"
          className="text-xl leading-7 font-bold text-[#162456]"
        >
          Quizzes
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="h-[39px] px-0 font-[family-name:var(--font-lato)] text-base leading-[25.6px] font-normal tracking-[-0.16px] text-[#79716b] hover:bg-transparent hover:text-[#79716b]"
        >
          See All
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-x-[clamp(12px,5.72vw,23px)] gap-y-2.5 px-4 sm:grid-cols-3 sm:gap-x-5 sm:px-6 md:px-8 lg:grid-cols-4">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.title}
            className="h-[85px] min-w-0 gap-0 rounded-[14px] border border-[#e5e5e5] bg-white py-0 shadow-xs ring-0"
          >
            <CardContent className="h-full p-0">
              <Button
                type="button"
                variant="ghost"
                className="flex h-full w-full items-center justify-between rounded-[14px] p-4 text-left hover:bg-transparent"
                aria-label={`${quiz.title}, ${quiz.subtitle}`}
              >
                <span className="flex min-w-0 flex-col gap-1 font-[family-name:var(--font-inter)]">
                  <span className="truncate text-base leading-6 font-medium text-[#162456]">
                    {quiz.title}
                  </span>
                  <span className="truncate text-sm leading-5 font-normal text-[#737373]">
                    {quiz.subtitle}
                  </span>
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1e40af]">
                  <span className="flex size-4 items-center justify-center">
                    <Image
                      src={quiz.icon}
                      alt=""
                      width={16}
                      height={16}
                      className={quiz.iconClassName}
                    />
                  </span>
                </span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default QuizSection
