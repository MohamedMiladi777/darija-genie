import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import GenieChatSidebar from "@/components/genie-chat-section"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { isScenarioId, scenarioIds } from "../../scenario-data"

export function generateStaticParams(): Array<{ scenario: string }> {
  return scenarioIds.map((scenario) => ({ scenario }))
}

function DialogueHeader({ scenario }: { scenario: string }): React.JSX.Element {
  return (
    <>
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-[#f2efe4] px-4 md:h-[95px] md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/learning/scenarios/${scenario}`}
            aria-label="Back to scenario home"
            className={buttonVariants({
              variant: "outline",
              size: "icon",
              className:
                "size-9 rounded-xl border-[#e5e5e5] bg-white p-0 shadow-none hover:bg-white",
            })}
          >
            <Image
              src="/assets/genie-chat/back.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-[family-name:var(--font-sans)] text-xl leading-7 font-bold text-[#162456] md:text-2xl md:leading-8">
              Darija Genie
            </h1>
            <p className="truncate pt-0.5 font-[family-name:var(--font-lato)] text-xs leading-4 text-[#79716b] md:text-sm md:leading-5">
              {scenario.startsWith("shopping")
                ? "Shopping scenario · Lesson 1"
                : "Restaurant scenario · Lesson 1"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Notifications"
          className="relative size-9 rounded-xl border-[#e5e5e5] bg-white p-0 hover:bg-white"
        >
          <Image
            src="/assets/genie-chat/bell.svg"
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
          <span className="absolute top-[6px] right-[7px] size-2 rounded-full bg-[#fb2c36]" />
        </Button>
      </header>

      <div className="flex h-[53px] shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#162456]">
            <Image
              src="/assets/genie-chat/dialogue.svg"
              alt=""
              width={12}
              height={12}
              className="size-3"
            />
          </span>
          <span className="font-[family-name:var(--font-inter)] text-base leading-6 font-medium text-black">
            Dialogue
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg bg-[#fee2e2] px-3 font-[family-name:var(--font-inter)] text-xs leading-4 font-medium text-[#991b1b] hover:bg-[#fecaca] hover:text-[#991b1b]"
        >
          End Dialogue
        </Button>
      </div>
    </>
  )
}

function ScenarioCard({ scenario }: { scenario: string }): React.JSX.Element {
  const isShopping = scenario.startsWith("shopping")

  return (
    <Card className="gap-0 rounded-[14px] bg-white py-0 shadow-none ring-[#e5e5e5] md:h-[256px] md:rounded-2xl">
      <div className="relative h-[140px] w-full overflow-hidden md:h-48">
        <Image
          src={
            isShopping
              ? "/assets/scenarios/shopping.jpg"
              : "/assets/genie-chat/restaurant.jpg"
          }
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 672px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex h-16 flex-col justify-center border-t border-[#e5e5e5] px-3 font-[family-name:var(--font-inter)]">
        <h2 className="text-sm leading-5 font-medium text-[#162456]">
          {isShopping ? "Shopping Scenario" : "Restaurant Scenario"}
        </h2>
        <p className="pt-0.5 text-xs leading-4 text-[#737373]">
          {isShopping
            ? "Practice shopping and conversing in a Moroccan souk"
            : "Practice ordering and conversing at a restaurant"}
        </p>
      </div>
    </Card>
  )
}

function ServerMessage(): React.JSX.Element {
  return (
    <article className="flex items-end gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#162456] pb-px font-[family-name:var(--font-inter)] text-xs leading-4 font-bold text-[#f2efe4]">
        S
      </div>
      <div className="max-w-80 min-w-0 flex-1 font-[family-name:var(--font-inter)]">
        <p className="px-1 text-[10px] leading-[15px] text-[#a3a3a3]">Server</p>
        <div className="mt-1.5 rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-[#e5e5e5] bg-white px-4 py-2.5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <p className="text-sm leading-[22.75px] text-[#09090b]">
            Mrhba! Welcome to our restaurant. What would you like to order
            today?
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="mt-1.5 h-[25px] rounded-sm border-[#e5e5e5] bg-white px-2 text-[10px] leading-[15px] text-[#737373] hover:bg-white"
        >
          <Image
            src="/assets/genie-chat/translate.svg"
            alt=""
            width={10}
            height={10}
            className="size-2.5"
          />
          Translate
        </Button>
        <p className="px-1 pt-1.5 text-[10px] leading-[15px] text-[#a3a3a3]">
          11:39 AM
        </p>
      </div>
    </article>
  )
}

function ResponseComposer(): React.JSX.Element {
  const responseModes = [
    {
      label: "Text",
      icon: "/assets/genie-chat/text.svg",
      active: false,
    },
    {
      label: "Audio",
      icon: "/assets/genie-chat/audio.svg",
      active: true,
    },
  ] as const

  return (
    <footer className="shrink-0 border-t border-[#e5e5e5] bg-white px-4 py-3">
      <div className="mx-auto grid h-9 w-full max-w-2xl grid-cols-2 gap-2">
        {responseModes.map((mode) => (
          <Button
            key={mode.label}
            type="button"
            variant="ghost"
            className={`h-9 rounded-lg font-[family-name:var(--font-inter)] text-sm leading-5 font-medium ${
              mode.active
                ? "bg-[#dbeafe] text-[#1e40af] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#dbeafe] hover:text-[#1e40af]"
                : "bg-[#f2efe4]/60 text-[#737373]/60 hover:bg-[#f2efe4]/60 hover:text-[#737373]/60"
            }`}
          >
            <Image
              src={mode.icon}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
            {mode.label}
          </Button>
        ))}
      </div>
    </footer>
  )
}

export default async function GenieChatPage({
  params,
}: {
  params: Promise<{ scenario: string }>
}): Promise<React.JSX.Element> {
  const { scenario } = await params

  if (!isScenarioId(scenario)) {
    notFound()
  }

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-white text-[#162456]">
      <GenieChatSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DialogueHeader scenario={scenario} />

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f2efe4] px-4 py-5">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <ScenarioCard scenario={scenario} />
            <ServerMessage />
          </div>
        </div>

        <ResponseComposer />
      </div>
    </main>
  )
}
