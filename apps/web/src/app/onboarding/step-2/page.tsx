import { ViewTransition } from "react"
import LogoMark from "@/components/assets/logo"
import Link from "next/link"
import { buttonVariants } from "@workspace/ui/components/button"

import { OnboardingShell } from "@/components/onboarding-shell"

function MainContent() {
  return (
    <OnboardingShell>
      <div className="flex flex-col items-center justify-center rounded-lg px-8 py-3">
        <div className="text-base leading-6 font-medium">
          <ViewTransition name="darija-genie-logo" share="logo-morph">
            <LogoMark
              className="h-[clamp(8rem,26dvh,16rem)] w-auto max-w-full"
              priority
            />
          </ViewTransition>
        </div>
      </div>
      <div className="flex w-full max-w-96 flex-col gap-6 lg:items-start">
        <h1 className="w-full text-center font-sans text-3xl leading-10 font-bold tracking-tight text-balance text-foreground lg:text-left">
          Learn Moroccan Darija with DarijaGenie
        </h1>
        <p className="text-center font-sans text-lg leading-7 font-normal text-pretty text-foreground/80 lg:text-left">
          A Darija Friendly learning platform to enhance your listening and
          reading skills.
        </p>
        <div className="flex flex-col items-center lg:items-start">
          <Link
            href="/onboarding/step-3"
            className={buttonVariants({
              variant: "default",
              size: "lg",
              className: "bg-sky-950 text-white",
            })}
          >
            Get Started
          </Link>
        </div>
      </div>
    </OnboardingShell>
  )
}

export default function WelcomeScreen() {
  return <MainContent />
}
