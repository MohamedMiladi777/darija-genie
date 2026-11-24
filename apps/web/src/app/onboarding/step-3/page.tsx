import LampMark from "@/components/assets/lamp"
import { buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"

import { MoonIcon, SunIcon } from "@/components/icons"
import { OnboardingShell } from "@/components/onboarding-shell"

function MainContent() {
  return (
    <OnboardingShell className="lg:items-start lg:gap-16">
      <LampMark />

      <div className="flex max-w-96 flex-col gap-8">
        <div className="space-y-3">
          <h1 className="text-2xl font-medium tracking-wide text-blue-950">
            Choose your theme
          </h1>
          <p className="max-w-sm text-sm leading-6 text-blue-950/70">
            Select your preferred theme. You can always change this later in
            settings.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/onboarding/step-4"
            className={buttonVariants({
              variant: null,
              className:
                "flex items-center justify-center gap-2 rounded-full bg-blue-950 px-6 py-3 text-sm font-medium text-neutral-50 shadow-md hover:bg-blue-900",
            })}
          >
            <SunIcon aria-hidden="true" />
            Light Mode{" "}
          </Link>

          <Link
            href="/onboarding/step-4"
            className={buttonVariants({
              variant: null,
              size: "lg",
              className:
                "click:bg-blue-100 flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-card px-6 py-3 text-sm font-medium text-blue-950 shadow-sm hover:bg-blue-50",
            })}
          >
            {" "}
            <MoonIcon aria-hidden="true" />
            Dark Mode
          </Link>
        </div>
      </div>
    </OnboardingShell>
  )
}

export default function WelcomeScreen() {
  return <MainContent />
}
