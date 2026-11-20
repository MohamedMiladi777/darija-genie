"use client"

import { useState, useSyncExternalStore, type CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { ClockIcon } from "./icons"
import {
  getQuizProgressStorageKey,
  LOCAL_RETENTION_CHANGE_EVENT,
  RESTAURANT_CHAT_STORAGE_KEY,
} from "@/lib/local-retention"
import { scenarioIds } from "@/app/(main)/learning/scenarios/scenario-data"

type ResumeSnapshot = {
  chat: string | null
  quizzes: Array<{ scenario: string; snapshot: string | null }>
}

type ResumeCard = {
  id: string
  badge: string
  title: string
  subtitle: string
  image: string
  accent: string
  href: string
  progress?: number
  timestamp?: string
  recent?: boolean
  action: string
}

function getResumeSnapshot(): string {
  try {
    return JSON.stringify({
      chat: window.localStorage.getItem(RESTAURANT_CHAT_STORAGE_KEY),
      quizzes: scenarioIds.map((scenario) => ({
        scenario,
        snapshot: window.localStorage.getItem(getQuizProgressStorageKey(scenario)),
      })),
    } satisfies ResumeSnapshot)
  } catch {
    return JSON.stringify({ chat: null, quizzes: [] } satisfies ResumeSnapshot)
  }
}

function subscribeToResumeData(onChange: () => void): () => void {
  window.addEventListener("storage", onChange)
  window.addEventListener(LOCAL_RETENTION_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(LOCAL_RETENTION_CHANGE_EVENT, onChange)
  }
}

function parseResumeSnapshot(value: string): ResumeSnapshot {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== "object") return { chat: null, quizzes: [] }
    const record = parsed as Partial<ResumeSnapshot>
    const quizzes = Array.isArray(record.quizzes)
      ? record.quizzes.filter(
          (item): item is { scenario: string; snapshot: string | null } =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as { scenario?: unknown }).scenario === "string" &&
            ((item as { snapshot?: unknown }).snapshot === null ||
              typeof (item as { snapshot?: unknown }).snapshot === "string")
        )
      : []
    return {
      chat: typeof record.chat === "string" ? record.chat : null,
      quizzes,
    }
  } catch {
    return { chat: null, quizzes: [] }
  }
}

const storageKey = "darija-genie:dismissed-sessions"
const changeEvent = "darija-genie:dismissed-sessions-changed"
let memorySnapshot = "[]"

/** Grid templates keyed by how many cards are showing. */
const gridTemplates: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

function getDismissedSnapshot(): string {
  try {
    return window.localStorage.getItem(storageKey) ?? memorySnapshot
  } catch {
    return memorySnapshot
  }
}

function subscribeToDismissals(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) onChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(changeEvent, onChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(changeEvent, onChange)
  }
}

function parseDismissals(snapshot: string): string[] {
  try {
    const value: unknown = JSON.parse(snapshot)
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : []
  } catch {
    return []
  }
}

function saveDismissals(ids: string[]): void {
  memorySnapshot = JSON.stringify(ids)
  try {
    window.localStorage.setItem(storageKey, memorySnapshot)
  } catch {
    // Dismissals still work for this visit when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(changeEvent))
}

export default function ContinueSessionSection(): React.JSX.Element {
  const [showAll, setShowAll] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const dismissedSnapshot = useSyncExternalStore(
    subscribeToDismissals,
    getDismissedSnapshot,
    () => "[]"
  )
  const resumeRaw = useSyncExternalStore(
    subscribeToResumeData,
    getResumeSnapshot,
    () => JSON.stringify({ chat: null, quizzes: [] } satisfies ResumeSnapshot)
  )
  const resumeSnapshot = parseResumeSnapshot(resumeRaw)
  const dismissedIds = parseDismissals(dismissedSnapshot)
  const chatData = (() => {
    try {
      const value: unknown = JSON.parse(resumeSnapshot.chat ?? "null")
      if (!value || typeof value !== "object") return null
      const data = value as { updatedAt?: unknown; messages?: unknown }
      return {
        scenario:
          typeof (data as { scenario?: unknown }).scenario === "string"
            ? (data as { scenario: string }).scenario
            : "restaurant-1",
        updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
        messageCount: Array.isArray(data.messages) ? data.messages.length : 0,
      }
    } catch {
      return null
    }
  })()
  const activeQuiz = resumeSnapshot.quizzes
    .map(({ scenario, snapshot }) => {
      if (!snapshot) return null
      try {
        const value: unknown = JSON.parse(snapshot)
        if (!value || typeof value !== "object") return null
        const data = value as { state?: { exerciseIndex?: unknown } }
        const index =
          typeof data.state?.exerciseIndex === "number"
            ? Math.max(0, Math.min(5, data.state.exerciseIndex))
            : 0
        return { scenario, index }
      } catch {
        return null
      }
    })
    .find((item): item is { scenario: string; index: number } => item !== null)
  const activeQuizIsShopping = Boolean(activeQuiz?.scenario.startsWith("shopping"))

  const sessions: ResumeCard[] = [
    {
      id: "restaurant-quiz",
      badge: "Scenario Quiz",
      title: activeQuizIsShopping ? "Shopping" : "Restaurant",
      subtitle: activeQuiz
        ? `Question ${activeQuiz.index + 1} of 6 · saved on this device`
        : activeQuizIsShopping
          ? "Practise prices, items, and everyday exchanges"
          : "Practise ordering food and making requests",
      image: activeQuizIsShopping
        ? "/assets/learning/sessions/food-drinks.jpg"
        : "/assets/learning/sessions/restaurant.jpg",
      accent: "#c49a5a",
      href: `/learning/scenarios/${activeQuiz?.scenario ?? "restaurant-1"}/quiz`,
      progress: activeQuiz ? Math.round((activeQuiz.index / 6) * 100) : undefined,
      timestamp: "Ready whenever you are",
      action: activeQuiz ? "Continue quiz" : "Start quiz",
    },
    {
      id: "darija-bot",
      badge: "Chat Session",
      title: "Restaurant chat",
      subtitle: chatData
        ? `${chatData.messageCount} messages · saved on this device`
        : "Start a conversation and pick it up again later",
      image: "/assets/learning/sessions/darija-bot.jpg",
      accent: "#c49a5a",
      href: `/learning/scenarios/${chatData?.scenario ?? "restaurant-1"}/geniechat`,
      timestamp: chatData?.updatedAt
        ? `Saved ${new Date(chatData.updatedAt).toLocaleString()}`
        : "No saved conversation yet",
      recent: Boolean(chatData),
      action: chatData ? "Continue chat" : "Start chat",
    },
  ]

  const availableSessions = sessions.filter(
    ({ id }) => !dismissedIds.includes(id)
  )
  const visibleSessions = showAll
    ? availableSessions
    : availableSessions.slice(0, 3)
  const gridTemplate =
    gridTemplates[visibleSessions.length] ?? gridTemplates[3]

  return (
    <section aria-labelledby="continue-session-heading" className="w-full min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="continue-session-heading"
          className="text-xl leading-7 font-bold text-foreground"
        >
          Continue Session
        </h2>
        {availableSessions.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showAll}
            aria-controls="continue-session-cards"
            onClick={() => setShowAll((previous) => !previous)}
          >
            {showAll ? "Show less" : "See All"}
          </Button>
        )}
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {visibleSessions.length > 0 ? (
        <div
          id="continue-session-cards"
          className={`mt-3 grid gap-px overflow-hidden rounded-2xl border border-border bg-border ${gridTemplate}`}
        >
          {visibleSessions.map((session) => (
            <Card
              key={session.id}
              role="article"
              aria-labelledby={`session-${session.id}`}
              style={{ "--session-accent": session.accent } as CSSProperties}
              className="group/session relative min-w-0 gap-3 rounded-none bg-card py-0 pb-3 shadow-none ring-0 [--card-spacing:--spacing(3)]"
            >
              <div className="relative h-28 w-full overflow-hidden sm:h-32">
                <Image
                  src={session.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"
                />
                <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-1.5">
                  <span className="rounded-full border border-[var(--session-accent)] bg-background/95 px-2 py-0.5 text-[11px] leading-4 font-medium text-foreground shadow-sm">
                    {session.badge}
                  </span>
                  {"recent" in session && session.recent && (
                    <span className="flex items-center gap-1 rounded-full bg-background/95 px-1.5 py-0.5 text-[11px] leading-4 text-foreground">
                      <ClockIcon aria-hidden="true" className="size-3" />
                      Recent
                    </span>
                  )}
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--session-accent),transparent_75%)] opacity-0 transition-opacity duration-300 group-hover/session:opacity-30 group-focus-within/session:opacity-30 motion-reduce:transition-none"
                />
              </div>

              <CardHeader className="gap-0.5">
                <CardTitle className="text-sm leading-5 font-semibold">
                  <h3 id={`session-${session.id}`}>{session.title}</h3>
                </CardTitle>
                <CardDescription className="line-clamp-1 text-xs">
                  {session.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                {"progress" in session ? (
                  <div>
                    <div className="mb-1.5 flex justify-between text-[11px] leading-4 text-muted-foreground">
                      <span>Progress</span>
                      <span>{session.progress}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${session.title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={session.progress}
                      className="h-1 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--session-accent)]"
                        style={{ width: `${session.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                    <p className="flex items-center gap-1.5 text-[11px] leading-4 text-muted-foreground">
                      <ClockIcon aria-hidden="true" className="size-3" />
                      {session.timestamp}
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex-wrap gap-2">
                <Button
                  size="sm"
                  render={<Link href={session.href} />}
                  nativeButton={false}
                  aria-label={`Continue ${session.title}`}
                >
                  {session.action}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label={`Remove ${session.title}`}
                  onClick={() => {
                    const latestIds = parseDismissals(getDismissedSnapshot())
                    saveDismissals([...new Set([...latestIds, session.id])])
                    setAnnouncement(
                      `${session.title} removed from Continue Session.`
                    )
                  }}
                >
                  Remove
                </Button>
              </CardFooter>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--session-accent)_55%,transparent),inset_0_0_40px_-22px_var(--session-accent)] opacity-0 transition-opacity duration-300 group-hover/session:opacity-100 group-focus-within/session:opacity-100 motion-reduce:transition-none"
              />
            </Card>
          ))}
        </div>
      ) : (
        <Card size="sm" className="mt-3 text-center">
          <CardHeader className="gap-1">
            <CardTitle className="text-sm">No sessions to continue</CardTitle>
            <CardDescription className="text-xs">
              Choose a scenario below to keep learning.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                saveDismissals([])
                setAnnouncement("Sessions restored.")
              }}
            >
              Restore dismissed sessions
            </Button>
          </CardFooter>
        </Card>
      )}
    </section>
  )
}
