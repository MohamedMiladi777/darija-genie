import AtayMark from "@/components/atay"
import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"

function MainContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 px-6 pb-8 lg:flex-row lg:items-center lg:gap-16 lg:px-16">
      <AtayMark />

      <div className="flex max-w-96 flex-col gap-5 md:flex-row">
        <div className="space-y-3">
          <h1 className="text-center text-2xl font-medium tracking-wide text-blue-950 md:text-start">
            All set!
          </h1>
          <p className="max-w-sm text-center text-sm leading-6 text-blue-950/70 md:text-start">
            You can always change the settings in the settings menu.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/learning"
            className={buttonVariants({
              variant: null,
              size: "icon-lg",
              className:
                "flex items-center justify-center gap-2 rounded-full bg-blue-950 px-6 py-3 text-sm font-medium text-neutral-50 shadow-md",
            })}
          >
            {" "}
            <ArrowRight />
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
