"use client"

import { useState, useSyncExternalStore, type CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock3 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

const sessions = [
  {
    id: "restaurant-quiz",
    badge: "Scenario Quiz",
    title: "Restaurant",
    subtitle: "Order a tajine",
    progress: 60,
    image: "/assets/learning/sessions/restaurant.jpg",
    accent: "#2fa6a3",
    href: "/learning/scenarios/restaurant-1",
    recent: true,
  },
  {
    id: "darija-bot",
    badge: "Chat Session",
    title: "Darija Bot",
    subtitle: "Free conversation",
    image: "/assets/learning/sessions/darija-bot.jpg",
    accent: "#4e9bd6",
    href: "/learning/scenarios/restaurant-1/geniechat",
    timestamp: "3 days ago",
  },
  {
    id: "food-drinks",
    badge: "Vocabulary",
    title: "Food & Drinks",
    subtitle: "50 words · Level 2",
    progress: 45,
    image: "/assets/learning/sessions/food-drinks.jpg",
    accent: "#c06a2a",
    href: "/learning/scenarios/shopping-1/preview",
  },
  {
    id: "grammar-basics",
    badge: "General Quiz",
    title: "Grammar Basics",
    subtitle: "Verb conjugation",
    progress: 20,
    image: "/assets/learning/sessions/grammar.jpg",
    accent: "#b57452",
    href: "/testing",
  },
] as const

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
  const snapshot = useSyncExternalStore(
    subscribeToDismissals,
    getDismissedSnapshot,
    () => "[]"
  )
  const dismissedIds = parseDismissals(snapshot)
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
                      <Clock3 aria-hidden="true" className="size-3" />
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
                    <Clock3 aria-hidden="true" className="size-3" />
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
                  Continue
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
