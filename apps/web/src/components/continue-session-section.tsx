"use client"

import { useState, useSyncExternalStore } from "react"
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

import { ArrowRightIcon, ClockIcon } from "./icons"
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
  href: string
  savedAt: string | null
  isSaved: boolean
  progress?: number
  action: string
}

function getResumeSnapshot(): string {
  try {
    return JSON.stringify({
      chat: window.localStorage.getItem(RESTAURANT_CHAT_STORAGE_KEY),
      quizzes: scenarioIds.map((scenario) => ({
        scenario,
        snapshot: window.localStorage.getItem(
          getQuizProgressStorageKey(scenario)
        ),
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
    if (!parsed || typeof parsed !== "object")
      return { chat: null, quizzes: [] }
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

function getSavedTime(value: string | null): number {
  if (!value) return 0
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : 0
}

function getSavedLabel(value: string | null): string {
  if (!value) return "No saved progress yet"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Saved on this device"
    : `Saved ${date.toLocaleString()}`
}

function FeaturedSessionCard({
  session,
  onDismiss,
}: {
  session: ResumeCard
  onDismiss: () => void
}): React.JSX.Element {
  return (
    <Card
      role="article"
      aria-labelledby={`session-${session.id}`}
      className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-0 overflow-hidden p-0 shadow-sm sm:grid-cols-[8rem_minmax(0,1fr)]"
    >
      <div className="relative row-span-3 min-h-44 overflow-hidden bg-muted sm:min-h-48">
        <Image
          src={session.image}
          alt=""
          fill
          sizes="(min-width: 640px) 128px, 88px"
          className="object-cover"
        />
      </div>

      <CardHeader className="min-w-0 gap-1 p-3 pb-0 sm:p-5 sm:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] leading-4 font-medium text-primary">
            {session.badge}
          </span>
          <span className="flex items-center gap-1 text-[11px] leading-4 text-muted-foreground">
            <ClockIcon aria-hidden="true" className="size-3 shrink-0" />
            {getSavedLabel(session.savedAt)}
          </span>
        </div>
        <CardTitle className="text-base leading-5 font-semibold">
          <h3 id={`session-${session.id}`} className="truncate">
            {session.title}
          </h3>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs leading-4">
          {session.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 px-3 pt-3 sm:px-5">
        {session.progress !== undefined && (
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] leading-4 text-muted-foreground">
              <span>Quiz progress</span>
              <span>{session.progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={`${session.title} progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={session.progress}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                style={{ width: `${session.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-2 px-3 pt-0 pb-3 sm:px-5 sm:pb-4">
        <Button
          size="sm"
          className="min-h-11 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          render={<Link href={session.href} />}
          nativeButton={false}
          aria-label={`${session.action} ${session.title}`}
        >
          {session.action}
          <ArrowRightIcon
            data-icon="inline-end"
            aria-hidden="true"
            className="size-4"
          />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="min-h-11 text-muted-foreground"
          aria-label={`Hide ${session.title} from Continue Session`}
          onClick={onDismiss}
        >
          Hide
        </Button>
      </CardFooter>
    </Card>
  )
}

function CompactSessionRow({
  session,
  onDismiss,
}: {
  session: ResumeCard
  onDismiss: () => void
}): React.JSX.Element {
  const action = session.isSaved ? "Continue" : "Start"

  return (
    <Card
      role="article"
      aria-labelledby={`session-${session.id}`}
      className="flex min-w-0 flex-row items-center gap-3 p-3 shadow-none ring-1 ring-border/70"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={session.image}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-4 font-medium tracking-wide text-muted-foreground uppercase">
          {session.badge}
        </p>
        <h3
          id={`session-${session.id}`}
          className="truncate text-sm leading-5 font-semibold text-foreground"
        >
          {session.title}
        </h3>
        <p className="truncate text-xs leading-4 text-muted-foreground">
          {session.subtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="sm"
          className="min-h-11 bg-sidebar-primary px-2.5 text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          render={<Link href={session.href} />}
          nativeButton={false}
          aria-label={`${action} ${session.title}`}
        >
          {action}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="min-h-11 px-2 text-muted-foreground"
          aria-label={`Hide ${session.title} from Continue Session`}
          onClick={onDismiss}
        >
          Hide
        </Button>
      </div>
    </Card>
  )
}

export default function ContinueSessionSection(): React.JSX.Element {
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
      const data = value as {
        scenario?: unknown
        updatedAt?: unknown
        messages?: unknown
      }
      return {
        scenario:
          typeof data.scenario === "string" ? data.scenario : "restaurant-1",
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
        const data = value as {
          updatedAt?: unknown
          state?: { exerciseIndex?: unknown }
        }
        const index =
          typeof data.state?.exerciseIndex === "number"
            ? Math.max(0, Math.min(5, data.state.exerciseIndex))
            : 0
        return {
          scenario,
          index,
          updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
        }
      } catch {
        return null
      }
    })
    .filter(
      (
        item
      ): item is {
        scenario: string
        index: number
        updatedAt: string | null
      } => item !== null
    )
    .sort(
      (left, right) =>
        getSavedTime(right.updatedAt) - getSavedTime(left.updatedAt)
    )[0]
  const activeQuizIsShopping = Boolean(
    activeQuiz?.scenario.startsWith("shopping")
  )
  const activeChat = chatData && chatData.messageCount > 0 ? chatData : null

  const sessions: ResumeCard[] = [
    {
      id: "restaurant-quiz",
      badge: "Quiz",
      title: activeQuizIsShopping ? "Shopping quiz" : "Restaurant quiz",
      subtitle: activeQuiz
        ? `Question ${activeQuiz.index + 1} of 6`
        : activeQuizIsShopping
          ? "Practise prices, items, and everyday exchanges"
          : "Practise ordering food and making requests",
      image: activeQuizIsShopping
        ? "/assets/learning/sessions/food-drinks.jpg"
        : "/assets/learning/sessions/restaurant.jpg",
      href: `/learning/scenarios/${activeQuiz?.scenario ?? "restaurant-1"}/quiz`,
      progress: activeQuiz
        ? Math.round((activeQuiz.index / 6) * 100)
        : undefined,
      savedAt: activeQuiz?.updatedAt ?? null,
      isSaved: Boolean(activeQuiz),
      action: activeQuiz ? "Continue quiz" : "Start quiz",
    },
    {
      id: "darija-bot",
      badge: "Conversation",
      title: activeChat?.scenario.startsWith("shopping")
        ? "Shopping chat"
        : "Restaurant chat",
      subtitle: activeChat
        ? `${activeChat.messageCount} messages`
        : "Start a conversation and pick it up again later",
      image: "/assets/learning/sessions/darija-bot.jpg",
      href: `/learning/scenarios/${activeChat?.scenario ?? "restaurant-1"}/geniechat`,
      savedAt: activeChat?.updatedAt ?? null,
      isSaved: Boolean(activeChat),
      action: activeChat ? "Continue chat" : "Start chat",
    },
  ]

  const availableSessions = sessions.filter(
    ({ id }) => !dismissedIds.includes(id)
  )
  const featuredSession = availableSessions
    .filter((session) => session.isSaved)
    .sort(
      (left, right) => getSavedTime(right.savedAt) - getSavedTime(left.savedAt)
    )[0]
  const compactSessions = availableSessions.filter(
    (session) => session.id !== featuredSession?.id
  )
  const dismissSession = (session: ResumeCard) => {
    const latestIds = parseDismissals(getDismissedSnapshot())
    saveDismissals([...new Set([...latestIds, session.id])])
    setAnnouncement(`${session.title} hidden from Continue Session.`)
  }

  return (
    <section
      aria-labelledby="continue-session-heading"
      className="w-full min-w-0"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="continue-session-heading"
          className="text-xl leading-7 font-bold text-foreground"
        >
          {featuredSession || availableSessions.length === 0
            ? "Continue Session"
            : "Start a Session"}
        </h2>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {availableSessions.length > 0 ? (
        <div className="mt-3 space-y-2">
          {featuredSession && (
            <FeaturedSessionCard
              session={featuredSession}
              onDismiss={() => dismissSession(featuredSession)}
            />
          )}
          {compactSessions.length > 0 && (
            <div className="grid gap-2">
              {compactSessions.map((session) => (
                <CompactSessionRow
                  key={session.id}
                  session={session}
                  onDismiss={() => dismissSession(session)}
                />
              ))}
            </div>
          )}
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
