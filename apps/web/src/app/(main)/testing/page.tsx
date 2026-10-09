import Image from "next/image"
import Link from "next/link"

import TestingQuizDeck from "@/components/testing-quiz-deck"

export default function TestingPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="min-w-0 bg-background md:h-dvh md:overflow-y-auto">
        <header className="flex min-h-[93px] items-center border-b border-border px-4 py-5 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/learning"
              aria-label="Back to learning"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-xs transition-transform hover:-translate-x-0.5 hover:bg-muted active:translate-x-0"
            >
              <Image
                src="/assets/testing/back.svg"
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
            </Link>
            <div>
              <h1 className="text-2xl leading-8 font-bold text-foreground">
                Quizzes
              </h1>
              <p className="font-[family-name:var(--font-lato)] text-sm leading-5 text-muted-foreground">
                Test your Darija knowledge
              </p>
            </div>
          </div>
        </header>

        <section className="px-4 pt-6 pb-24 sm:px-6 sm:pb-28 md:px-8 md:pb-8">
          <div>
            <h2 className="text-xl leading-7 font-bold text-foreground">
              Pick a quiz
            </h2>
            <p className="font-[family-name:var(--font-lato)] text-sm leading-5 text-muted-foreground">
              Choose your challenge and test your Darija
            </p>
          </div>
          <TestingQuizDeck />
        </section>
      </div>
    </main>
  )
}
