"use client"

import Image from "next/image"
import * as React from "react"

type PreferenceKind = "script" | "interaction"

interface PreferenceOption {
  value: string
  title: string
  description: string
  icon?: string
  monogram?: string
}

const preferenceConfigs: Record<
  PreferenceKind,
  {
    heading: string
    subtitle: string
    storageKey: string
    defaultValues: readonly string[]
    multiple: boolean
    options: readonly PreferenceOption[]
  }
> = {
  script: {
    heading: "Text script",
    subtitle: "Choose how Darija text is displayed",
    storageKey: "darija-genie:text-script",
    defaultValues: ["latin"],
    multiple: false,
    options: [
      {
        value: "arabic",
        title: "Arabic",
        description: "Display Text in Arabic script",
        monogram: "ع",
      },
      {
        value: "latin",
        title: "Latin",
        description: "Display Text in Latin script",
        monogram: "Aa",
      },
    ],
  },
  interaction: {
    heading: "Interaction mode",
    subtitle: "Choose how you interact with the Darija chatbot",
    storageKey: "darija-genie:interaction-modes",
    defaultValues: ["text"],
    multiple: true,
    options: [
      {
        value: "audio",
        title: "Audio",
        description: "Interact with the chatbot in Audio",
        icon: "/assets/settings/interaction-audio.svg",
      },
      {
        value: "text",
        title: "Text",
        description: "Interact with the chatbot in Text",
        icon: "/assets/settings/interaction-text.svg",
      },
    ],
  },
}

const preferenceChangeEvent = "darija-genie:preference-change"

function subscribe(listener: () => void): () => void {
  window.addEventListener("storage", listener)
  window.addEventListener(preferenceChangeEvent, listener)

  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(preferenceChangeEvent, listener)
  }
}

function readStoredValue(key: string, fallback: string): string {
  return window.localStorage.getItem(key) ?? fallback
}

function SelectionBox({
  selected,
  desktop = false,
}: {
  selected: boolean
  desktop?: boolean
}): React.JSX.Element {
  const sizeClassName = desktop ? "size-5" : "size-4"

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-[4px] border shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${sizeClassName} ${
        selected
          ? "border-[#1e40af] bg-[#1e40af]"
          : "border-[#d4d4d4] bg-card dark:border-border"
      }`}
    >
      {selected ? (
        <Image
          src="/assets/settings/interaction-check.svg"
          alt=""
          width={11}
          height={11}
          className="size-[11px]"
        />
      ) : null}
    </span>
  )
}

export default function PreferenceSelector({
  kind,
}: {
  kind: PreferenceKind
}): React.JSX.Element {
  const config = preferenceConfigs[kind]
  const fallbackValue = config.defaultValues.join(",")
  const storedValue = React.useSyncExternalStore(
    subscribe,
    () => readStoredValue(config.storageKey, fallbackValue),
    () => fallbackValue
  )
  const selectedValues = storedValue.split(",").filter(Boolean)

  function togglePreference(value: string): void {
    const isSelected = selectedValues.includes(value)
    let nextValues: string[]

    if (!config.multiple) {
      nextValues = [value]
    } else if (isSelected) {
      nextValues = selectedValues.filter((selected) => selected !== value)
      if (nextValues.length === 0) return
    } else {
      nextValues = [...selectedValues, value]
    }

    window.localStorage.setItem(config.storageKey, nextValues.join(","))
    window.dispatchEvent(new Event(preferenceChangeEvent))
  }

  return (
    <>
      <div
        role="group"
        aria-label={config.heading}
        className="mx-auto mt-[27px] w-full max-w-[402px] md:hidden"
      >
        {config.options.map((option) => {
          const selected = selectedValues.includes(option.value)

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => togglePreference(option.value)}
              className="flex h-[66px] w-full items-start gap-3 border-x border-t border-border bg-muted p-3 text-left outline-none last:border-b focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-inset"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--font-inter)] text-sm leading-5 text-foreground">
                  {option.title}
                </span>
                <span className="mt-1.5 block font-[family-name:var(--font-inter)] text-xs leading-4 text-muted-foreground">
                  {option.description}
                </span>
              </span>
              <span className="pt-0.5">
                <SelectionBox selected={selected} />
              </span>
            </button>
          )
        })}
      </div>

      <section className="mx-auto hidden w-full max-w-2xl px-5 pt-6 pb-10 md:block">
        <div>
          <h2 className="font-[family-name:var(--font-sans)] text-xl leading-7 font-bold text-foreground">
            {config.heading}
          </h2>
          <p className="mt-0.5 font-[family-name:var(--font-inter)] text-sm leading-5 text-muted-foreground">
            {config.subtitle}
          </p>
        </div>

        <div
          role="group"
          aria-label={config.heading}
          className="mt-6 flex flex-col gap-3"
        >
          {config.options.map((option) => {
            const selected = selectedValues.includes(option.value)

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePreference(option.value)}
                className={`flex h-[90px] w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  selected
                    ? "border-[#162456]"
                    : "border-border shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                }`}
              >
                <span
                  className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${
                    selected ? "bg-[#162456]" : "bg-muted"
                  }`}
                >
                  {option.icon ? (
                    <Image
                      src={option.icon}
                      alt=""
                      width={24}
                      height={24}
                      className={`size-6 ${selected ? "brightness-0 invert" : "opacity-70 brightness-0"}`}
                    />
                  ) : (
                    <span
                      className={`font-[family-name:var(--font-inter)] text-lg font-semibold ${
                        selected
                          ? "text-white"
                          : "text-[#525252] dark:text-[#c6b89b]"
                      }`}
                    >
                      {option.monogram}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-[family-name:var(--font-inter)] text-base leading-6 font-medium text-foreground">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block font-[family-name:var(--font-inter)] text-xs leading-4 text-muted-foreground">
                    {option.description}
                  </span>
                </span>

                <SelectionBox selected={selected} desktop />
              </button>
            )
          })}
        </div>

        {kind === "interaction" ? (
          <div className="mt-6 flex min-h-11 items-start gap-3 rounded-xl bg-[#e0e7ff] px-4 py-3 dark:bg-[#263a57]">
            <Image
              src="/assets/settings/interaction-info.svg"
              alt=""
              width={16}
              height={16}
              className="mt-0.5 size-4 shrink-0"
            />
            <p className="font-[family-name:var(--font-inter)] text-xs leading-[19.5px] text-[#1e40af] dark:text-[#8fc6ff]">
              You can enable <strong className="font-bold">both</strong> modes
              at once. Audio mode requires microphone access.
            </p>
          </div>
        ) : null}
      </section>
    </>
  )
}
