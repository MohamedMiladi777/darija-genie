"use client"

import { useEffect, ViewTransition } from "react"
import { useRouter } from "next/navigation"

import LogoMark from "@/components/assets/logo"

const SPLASH_DURATION_MS = 1400

export default function SplashScreen(): React.JSX.Element {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/onboarding/step-2", {
        scroll: false,
        transitionTypes: ["onboarding-forward"],
      })
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <main className="flex min-h-svh items-center justify-center overflow-hidden bg-background text-foreground">
      <ViewTransition name="darija-genie-logo" share="logo-morph">
        <LogoMark className="w-[min(82vw,500px)]" priority />
      </ViewTransition>
    </main>
  )
}
