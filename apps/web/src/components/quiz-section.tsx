import Link from "next/link"

import { ArrowRightIcon, TestingIcon } from "@/components/icons"
import { Card, CardContent } from "@workspace/ui/components/card"

const QuizSection = (): React.JSX.Element => (
  <section aria-labelledby="quizzes-heading" className="w-full min-w-0">
    <div>
      <h2 id="quizzes-heading" className="text-xl leading-7 font-bold text-foreground">
        Quizzes
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Practise what you&apos;ve learned with a short scenario quiz.
      </p>
    </div>
    <Link
      href="/testing"
      className="group mt-3 block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2"
    >
      <Card className="flex min-h-24 flex-row items-center gap-4 rounded-2xl border-border bg-card p-4 shadow-xs transition-colors group-hover:bg-muted">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8e1d3] text-[#a86d3f]">
          <TestingIcon aria-hidden="true" className="size-5" />
        </span>
        <CardContent className="min-w-0 flex-1 p-0">
          <span className="block font-[family-name:var(--font-inter)] text-sm font-semibold text-foreground">
            Scenario practice
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Choose Restaurant or Shopping and practise one question at a time.
          </span>
        </CardContent>
        <ArrowRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-[#1e40af] transition-transform group-hover:translate-x-0.5"
        />
      </Card>
    </Link>
  </section>
)

export default QuizSection
