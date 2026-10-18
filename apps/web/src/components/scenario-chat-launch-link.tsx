"use client"

import { ReactNode } from "react"
import Link from "next/link"

import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"

export default function ScenarioChatLaunchLink({
  scenario,
  className,
  ariaLabel,
  children,
}: {
  scenario: ScenarioId
  className: string
  ariaLabel?: string
  children: ReactNode
}): React.JSX.Element {
  return (
    <Link
      href={`/learning/scenarios/${scenario}/geniechat`}
      aria-label={ariaLabel ?? "Open GenieChat"}
      className={className}
    >
      {children}
    </Link>
  )
}
