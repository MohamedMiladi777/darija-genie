import AtayMark from "@/components/assets/atay"
import { buttonVariants } from "@workspace/ui/components/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function OnboardingCompletePage(): React.JSX.Element {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-10 px-6 pb-8 lg:flex-row lg:gap-16 lg:px-16">
        <AtayMark />
        <div className="flex max-w-96 flex-col gap-5 md:flex-row">
          <div className="space-y-3">
            <h1 className="text-center text-2xl font-medium tracking-wide text-blue-950 md:text-left">
              All set!
            </h1>
            <p className="max-w-sm text-center text-sm leading-6 text-blue-950/70 md:text-left">
              You can always change these preferences in the settings menu.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Link
              href="/learning"
              aria-label="Start learning"
              className={buttonVariants({
                variant: null,
                size: "icon-lg",
                className:
                  "flex items-center justify-center rounded-full bg-blue-950 px-6 py-3 text-neutral-50 shadow-md hover:bg-blue-900",
              })}
            >
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
