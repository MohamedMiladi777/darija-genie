import Image from "next/image"
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import TestingQuizDeck from "@/components/testing-quiz-deck"

export default function TestingPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-[#f2efe4] text-[#162456] md:flex">
      <AppSidebar activeItem="testing" />

      <div className="min-w-0 flex-1 bg-[#f2efe4] md:h-dvh md:overflow-y-auto">
        <header className="flex min-h-[93px] items-center border-b border-[#e5e5e5] px-4 py-5 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/learning"
              aria-label="Back to learning"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white shadow-xs transition-transform hover:-translate-x-0.5 hover:bg-[#fafafa] active:translate-x-0"
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
              <h1 className="text-2xl leading-8 font-bold text-[#162456]">
                Quizzes
              </h1>
              <p className="font-[family-name:var(--font-lato)] text-sm leading-5 text-[#79716b]">
                Test your Darija knowledge
              </p>
            </div>
          </div>
        </header>

        <section className="px-4 pt-6 pb-24 sm:px-6 sm:pb-28 md:px-8 md:pb-8">
          <div>
            <h2 className="text-xl leading-7 font-bold text-[#162456]">
              Pick a quiz
            </h2>
            <p className="font-[family-name:var(--font-lato)] text-sm leading-5 text-[#79716b]">
              Choose your challenge and test your Darija
            </p>
          </div>
          <TestingQuizDeck />
        </section>
      </div>

      <LearningMobileNavigation activeItem="testing" />
    </main>
  )
}
