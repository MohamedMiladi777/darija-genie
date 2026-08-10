"use client"

import Image from "next/image"
import * as React from "react"
import { useTheme } from "next-themes"

type ThemeChoice = "light" | "dark" | "system"

const themeChoices = [
  {
    value: "light",
    label: "Light",
    icon: "/assets/settings/sun.svg",
  },
  {
    value: "dark",
    label: "Dark",
    icon: "/assets/settings/moon.svg",
  },
  {
    value: "system",
    label: "System",
    icon: "/assets/settings/monitor.svg",
  },
] as const

function subscribeToHydration(): () => void {
  return () => undefined
}

function MiniatureContent({
  dark = false,
}: {
  dark?: boolean
}): React.JSX.Element {
  return (
    <div
      className={`flex h-full w-full overflow-hidden rounded-[9px] ${dark ? "bg-[#111827]" : "bg-[#f8f6ef]"}`}
    >
      <div
        className={`w-[31%] shrink-0 px-2 py-3 ${dark ? "bg-[#0f172a]" : "bg-[#162456]"}`}
      >
        <div className="mb-3 h-2 w-5 rounded-full bg-background/85" />
        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full bg-[#1447e6]" />
          <div className="h-1.5 rounded-full bg-white/20" />
          <div className="h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`flex h-7 items-center border-b px-2 ${dark ? "border-white/10 bg-[#1f2937]" : "border-border bg-card"}`}
        >
          <div
            className={`h-1.5 w-9 rounded-full ${dark ? "bg-white/40" : "bg-[#162456]/45"}`}
          />
        </div>
        <div className="space-y-2 p-2">
          <div
            className={`h-2 w-1/2 rounded-full ${dark ? "bg-white/35" : "bg-[#162456]/40"}`}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <div
              className={`h-8 rounded ${dark ? "bg-white/10" : "bg-card shadow-sm"}`}
            />
            <div
              className={`h-8 rounded ${dark ? "bg-white/10" : "bg-card shadow-sm"}`}
            />
          </div>
          <div
            className={`h-4 rounded ${dark ? "bg-white/10" : "bg-[#e0e7ff]"}`}
          />
        </div>
      </div>
    </div>
  )
}

function ThemePreview({ theme }: { theme: ThemeChoice }): React.JSX.Element {
  if (theme === "system") {
    return (
      <div className="relative h-full overflow-hidden rounded-[9px]">
        <MiniatureContent />
        <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          <div className="h-full w-[200%] -translate-x-1/2">
            <MiniatureContent dark />
          </div>
        </div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/45" />
      </div>
    )
  }

  return <MiniatureContent dark={theme === "dark"} />
}

export default function ThemeSelector(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const hydrated = React.useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  )
  const selectedTheme: ThemeChoice =
    hydrated && (theme === "dark" || theme === "system" || theme === "light")
      ? theme
      : "light"

  return (
    <>
      <div>
        <h2 className="font-[family-name:var(--font-lato)] text-xl leading-7 font-bold text-foreground">
          Choose a theme
        </h2>
        <p className="mt-0.5 font-[family-name:var(--font-lato)] text-sm leading-5 text-muted-foreground">
          Select how Darija Genie looks to you.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        {themeChoices.map((choice) => {
          const isSelected = choice.value === selectedTheme

          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setTheme(choice.value)}
              className="min-w-0 text-left outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                className={`block h-[148px] rounded-2xl p-[11px] transition-colors ${
                  isSelected
                    ? "border-[3px] border-[#162456] bg-[#dedbd0] dark:border-[#c6b89b] dark:bg-[#263346]"
                    : choice.value === "dark"
                      ? "border border-[#374151] bg-[#252b38]"
                      : "border border-[#d6d3ca] bg-[#dedbd0] dark:border-border dark:bg-[#263346]"
                }`}
              >
                <ThemePreview theme={choice.value} />
              </span>

              <span className="mt-3 flex h-5 items-center gap-2 px-0.5">
                <Image
                  src={choice.icon}
                  alt=""
                  width={15}
                  height={15}
                  className="size-[15px] shrink-0 dark:brightness-0 dark:invert"
                />
                <span
                  className={`min-w-0 flex-1 font-[family-name:var(--font-inter)] text-sm leading-5 ${
                    isSelected
                      ? "font-medium text-foreground"
                      : "font-normal text-muted-foreground"
                  }`}
                >
                  {choice.label}
                </span>
                {isSelected ? (
                  <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#162456]">
                    <Image
                      src="/assets/settings/check.svg"
                      alt=""
                      width={11}
                      height={11}
                      className="size-[11px]"
                    />
                  </span>
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-[#a3a3a3] dark:border-[#c6b89b]" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex min-h-11 items-center gap-3 rounded-xl bg-[#dbeafe] px-4 py-2 dark:bg-[#263a57]">
        <Image
          src="/assets/settings/system-info.svg"
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0"
        />
        <p className="font-[family-name:var(--font-inter)] text-xs leading-4 text-[#1e40af] dark:text-[#8fc6ff]">
          <strong className="font-semibold">System</strong> automatically
          switches between light and dark based on your device settings.
        </p>
      </div>
    </>
  )
}
