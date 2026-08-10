import { ArrowRight } from "lucide-react"

const quizzes = [
  { title: "General Quiz", subtitle: "All topics · Any level" },
  { title: "Food", subtitle: "Level 1" },
  { title: "Money", subtitle: "Level 2" },
  { title: "Time", subtitle: "Level 3" },
  { title: "Hotel", subtitle: "Level 1" },
] as const

const QuizSection = (): React.JSX.Element => (
  <section aria-labelledby="quizzes-heading" className="w-full min-w-0">
    <div className="flex items-center justify-between">
      <h2
        id="quizzes-heading"
        className="text-xl leading-7 font-bold text-[#162456]"
      >
        Quizzes
      </h2>
      <button
        type="button"
        className="font-[family-name:var(--font-lato)] text-base leading-6 text-[#79716b] hover:text-[#162456]"
      >
        See All
      </button>
    </div>
    <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {quizzes.map((quiz) => (
        <button
          key={quiz.title}
          type="button"
          aria-label={`${quiz.title}, ${quiz.subtitle}`}
          className="flex h-[85px] basis-[165px] grow shrink-0 snap-start items-center justify-between rounded-2xl border border-[#e5e5e5] bg-white px-4 text-left shadow-xs transition-colors hover:bg-[#fafafa]"
        >
          <span className="min-w-0 font-[family-name:var(--font-inter)]">
            <span className="block truncate text-[15px] leading-5 font-medium text-[#162456]">
              {quiz.title}
            </span>
            <span className="mt-0.5 block truncate text-[13px] leading-4 text-[#737373]">
              {quiz.subtitle}
            </span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-white">
            <ArrowRight className="size-[14px]" />
          </span>
        </button>
      ))}
    </div>
  </section>
)

export default QuizSection
