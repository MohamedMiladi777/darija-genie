import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

import { ArrowRightIcon } from "@/components/icons"

const QuizSection = (): React.JSX.Element => (
  <section aria-labelledby="quizzes-heading" className="w-full min-w-0">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2
          id="quizzes-heading"
          className="text-xl leading-7 font-bold text-foreground"
        >
          Quizzes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Practise what you&apos;ve learned with a short scenario quiz.
        </p>
      </div>
      <Button
        className="min-h-11 w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 sm:w-auto"
        render={<Link href="/testing" />}
        nativeButton={false}
      >
        Start practice
        <ArrowRightIcon
          data-icon="inline-end"
          aria-hidden="true"
          className="size-4"
        />
      </Button>
    </div>
  </section>
)

export default QuizSection
