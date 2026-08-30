import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import GenieChatSidebar from "@/components/genie-chat-section"
import GenieChatDialogue from "@/components/genie-chat-dialogue"
import { Button, buttonVariants } from "@workspace/ui/components/button"

// import { isScenarioId, scenarioIds } from "../../scenario-data"
import { isScenarioId, scenarioIds } from "@/app/(main)/learning/scenarios/scenario-data"

export function generateStaticParams(): Array<{ scenario: string }> {
  return scenarioIds.map((scenario) => ({ scenario }))
}

function DialogueHeader({ scenario }: { scenario: string }): React.JSX.Element {
  return (
    <>
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-border bg-background px-4 md:h-[95px] md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/learning/scenarios/${scenario}`}
            aria-label="Back to scenario home"
            className={buttonVariants({
              variant: "outline",
              size: "icon",
              className:
                "size-9 rounded-xl border-border bg-card p-0 shadow-none hover:bg-muted",
            })}
          >
            <Image
              src="/assets/genie-chat/back.svg"
              alt=""
              width={16}
              height={16}
              className="size-4 dark:brightness-0 dark:invert"
            />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-[family-name:var(--font-sans)] text-xl leading-7 font-bold text-foreground md:text-2xl md:leading-8">
              Darija Genie
            </h1>
            <p className="truncate pt-0.5 font-[family-name:var(--font-lato)] text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">
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
          className="relative size-9 rounded-xl border-border bg-card p-0 hover:bg-muted"
        >
          <Image
            src="/assets/genie-chat/bell.svg"
            alt=""
            width={16}
            height={16}
            className="size-4 dark:brightness-0 dark:invert"
          />
          <span className="absolute top-[6px] right-[7px] size-2 rounded-full bg-[#fb2c36]" />
        </Button>
      </header>
      <div className="flex h-[53px] shrink-0 items-center justify-between border-b border-border bg-card px-4">
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
          <span className="font-[family-name:var(--font-inter)] text-base leading-6 font-medium text-foreground">
            Dialogue
          </span>
        </div>
        <Link
          href={`/learning/scenarios/${scenario}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className:
              "h-7 rounded-lg bg-[#fee2e2] px-3 font-[family-name:var(--font-inter)] text-xs font-medium text-[#991b1b] hover:bg-[#fecaca] hover:text-[#991b1b] dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60",
          })}
        >
          End Dialogue
        </Link>
      </div>
    </>
  )
}

export default async function GenieChatPage({
  params,
}: {
  params: Promise<{ scenario: string }>
}): Promise<React.JSX.Element> {
  const { scenario } = await params
  if (!isScenarioId(scenario)) notFound()

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-card text-foreground">
      <GenieChatSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DialogueHeader scenario={scenario} />
        <GenieChatDialogue scenario={scenario} />
      </div>
    </main>
  )
}
