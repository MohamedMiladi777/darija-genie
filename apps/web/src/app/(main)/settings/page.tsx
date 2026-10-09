import Image from "next/image"
import Link from "next/link"

import SettingsChrome from "@/components/settings-chrome"

const settingsItems = [
  {
    title: "Theme Settings",
    description: "Change between light and dark mode",
    icon: "/assets/settings/theme.svg",
    href: "/settings/theme",
  },
  {
    title: "Text Script",
    description: "Change between Arabic, Latin scripts",
    icon: "/assets/settings/language.svg",
    href: "/settings/script",
  },
  {
    title: "Interaction Settings",
    description: "Enable Audio interaction, text, or both",
    icon: "/assets/settings/microphone.svg",
    href: "/settings/interaction",
  },
  {
    title: "Font Size",
    description: "Choose a comfortable dialogue text size",
    icon: "/assets/genie-chat/text.svg",
    href: "/settings/font-size",
  },
] as const

function SettingsRow({
  item,
}: {
  item: (typeof settingsItems)[number]
}): React.JSX.Element {
  const content = (
    <>
      <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-[#e0e7ff] md:flex dark:bg-[#263a57]">
        <Image
          src={item.icon}
          alt=""
          width={18}
          height={18}
          className="size-[18px]"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-[family-name:var(--font-inter)] text-base leading-6 font-medium text-foreground">
          {item.title}
        </span>
        <span className="block truncate font-[family-name:var(--font-inter)] text-sm leading-5 text-muted-foreground md:text-muted-foreground">
          {item.description}
        </span>
      </span>
      <Image
        src="/assets/settings/arrow-right.svg"
        alt=""
        width={16}
        height={16}
        className="size-4 shrink-0"
      />
    </>
  )

  const className =
    "flex h-20 w-full items-center gap-4 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1447e6] md:h-[78px] md:gap-4 md:px-4"

  if ("href" in item) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  )
}

export default function SettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background">
      <div className="min-w-0 flex-1">
        <SettingsChrome mobileTitle="Settings" mobileBackHref="/learning" />

        <section className="mx-auto w-full max-w-[402px] pt-[18px] pb-20 md:max-w-2xl md:px-8 md:pt-6 md:pb-10">
          <div className="grid h-[33px] grid-cols-2 gap-1 border-b border-[#a3a3a3] md:h-[37px] dark:border-border">
            <button
              type="button"
              aria-selected="true"
              className="relative flex items-start justify-center font-[family-name:var(--font-inter)] text-sm leading-5 font-medium text-foreground outline-none after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-inset md:items-center dark:after:bg-white"
            >
              Preferences
            </button>
            <button
              type="button"
              aria-selected="false"
              className="flex items-start justify-center gap-2 font-[family-name:var(--font-inter)] text-sm leading-5 font-medium text-[#999] outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6] focus-visible:ring-inset md:items-center dark:text-[#c6b89b]/70"
            >
              <Image
                src="/assets/settings/download.svg"
                alt=""
                width={13}
                height={13}
                className="mt-0.5 hidden size-[13px] md:block"
              />
              Downloads
            </button>
          </div>

          <div className="overflow-hidden md:mt-11 md:rounded-2xl md:border md:border-border md:bg-card md:shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {settingsItems.map((item, index) => (
              <div key={item.title}>
                <SettingsRow item={item} />
                {index < settingsItems.length - 1 ? (
                  <div className="h-px bg-[#737373] md:mx-4 md:bg-[#e5e5e5] dark:bg-border md:dark:bg-border" />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
