import MosqueMark from "@/components/mosque"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { buttonVariants } from "@workspace/ui/components/button"

function MainContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 px-6 pb-8 lg:flex-row lg:items-center lg:gap-16 lg:px-16">
      <MosqueMark />

      <div className="flex max-w-96 flex-col gap-8">
        <div className="space-y-3">
          <h1 className="text-center text-2xl font-medium tracking-wide text-blue-950 md:text-start">
            Choose your Script
          </h1>
          <p className="max-w-sm text-center text-sm leading-6 text-blue-950/70 md:text-start">
            Choose the script you'd like to use for learning Darija. You can
            switch between Latin and Arabic script anytime.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/onboarding/step-5"
            className={buttonVariants({
              variant: null,
              className:
                "flex items-center justify-center gap-2 rounded-full bg-blue-950 px-6 py-3 text-sm font-medium text-neutral-50 shadow-md",
            })}
          >
            {" "}
            Latin{" "}
          </Link>

          <Link
            href="/onboarding/step-5"
            className={buttonVariants({
              variant: null,
              className:
                "flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-blue-950 shadow-sm",
            })}
          >
            {" "}
            Arabic{" "}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function WelcomeScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <MainContent />
    </main>
  )
}
