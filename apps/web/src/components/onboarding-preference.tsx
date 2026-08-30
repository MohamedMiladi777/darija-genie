"use client"

import {
  ArrowRight,
  Check,
  Languages,
  MessageCircleMore,
  Type,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  setStoredPreference,
  useStoredPreference,
} from "@/components/preference-selector"
import { Button } from "@workspace/ui/components/button"

type OnboardingPreferenceKind = "fontSize" | "script" | "interaction"

const configs = {
  fontSize: {
    heading: "Choose your font size",
    description:
      "Pick the dialogue text size that is most comfortable to read.",
    storageKey: "darija-genie:font-size",
    fallback: "medium",
    multiple: false,
    options: [
      {
        value: "small",
        label: "Small",
        detail: "Compact",
        preview: "text-base",
      },
      {
        value: "medium",
        label: "Medium",
        detail: "Comfortable",
        preview: "text-xl",
      },
      {
        value: "large",
        label: "Large",
        detail: "Extra readable",
        preview: "text-2xl",
      },
    ],
  },
  script: {
    heading: "Choose your script",
    description:
      "Choose the script you'd like to use for learning Darija. You can change it later.",
    storageKey: "darija-genie:text-script",
    fallback: "latin",
    multiple: false,
    options: [
      {
        value: "latin",
        label: "Latin",
        detail: "Darija in Latin letters",
        preview: "text-xl",
      },
      {
        value: "arabic",
        label: "Arabic",
        detail: "الدارجة بالحروف العربية",
        preview: "text-2xl",
      },
    ],
  },
  interaction: {
    heading: "Choose your interaction mode",
    description:
      "Choose how you want to interact with Darija Genie. You can enable both.",
    storageKey: "darija-genie:interaction-modes",
    fallback: "text",
    multiple: true,
    options: [
      {
        value: "text",
        label: "Text",
        detail: "Type and read messages",
        preview: "text-xl",
      },
      {
        value: "audio",
        label: "Audio",
        detail: "Speak and listen",
        preview: "text-xl",
      },
    ],
  },
} as const

export default function OnboardingPreference({
  kind,
  nextHref,
}: {
  kind: OnboardingPreferenceKind
  nextHref: string
}): React.JSX.Element {
  const router = useRouter()
  const config = configs[kind]
  const storedValue = useStoredPreference(config.storageKey, config.fallback)
  const selectedValues = storedValue.split(",").filter(Boolean)

  function select(value: string): void {
    if (!config.multiple) {
      setStoredPreference(config.storageKey, value)
      return
    }

    const selected = selectedValues.includes(value)
    const nextValues = selected
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value]

    if (nextValues.length > 0) {
      setStoredPreference(config.storageKey, nextValues.join(","))
    }
  }

  const Illustration =
    kind === "fontSize"
      ? Type
      : kind === "script"
        ? Languages
        : MessageCircleMore

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-4xl flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16">
        <div className="flex size-44 shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-blue-950 shadow-sm md:size-52">
          <Illustration className="size-20 md:size-24" strokeWidth={1.4} />
        </div>

        <section className="w-full max-w-md">
          <h1 className="text-center text-2xl font-medium tracking-wide text-blue-950 md:text-left">
            {config.heading}
          </h1>
          <p className="mt-3 text-center text-sm leading-6 text-blue-950/70 md:text-left">
            {config.description}
          </p>

          <div
            className="mt-7 flex flex-col gap-3"
            role="group"
            aria-label={config.heading}
          >
            {config.options.map((option) => {
              const selected = selectedValues.includes(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => select(option.value)}
                  className={`flex min-h-16 items-center gap-4 rounded-2xl border bg-card px-4 py-3 text-left shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    selected
                      ? "border-blue-950 ring-1 ring-blue-950"
                      : "border-neutral-200"
                  }`}
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e0e7ff] font-[family-name:var(--font-simplified-arabic)] font-semibold text-blue-950 ${option.preview}`}
                  >
                    {kind === "script" && option.value === "arabic"
                      ? "ع"
                      : kind === "interaction"
                        ? option.value === "audio"
                          ? "♫"
                          : "Aa"
                        : "A"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-blue-950">
                      {option.label}
                    </span>
                    <span
                      className="mt-0.5 block text-xs text-blue-950/60"
                      dir={
                        kind === "script" && option.value === "arabic"
                          ? "rtl"
                          : undefined
                      }
                    >
                      {option.detail}
                    </span>
                  </span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-blue-950 bg-blue-950 text-white"
                        : "border-neutral-300"
                    }`}
                    aria-hidden="true"
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                  </span>
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            onClick={() => router.push(nextHref)}
            className="mt-7 h-12 w-full rounded-full bg-blue-950 text-neutral-50 hover:bg-blue-900"
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        </section>
      </div>
    </main>
  )
}
