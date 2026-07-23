import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"

import { MobileStatusBar } from "./ScenarioPageChrome"

interface SettingsChromeProps {
  mobileTitle: string
  mobileBackHref: string
  secondaryTitle?: string
}

function ChromeIconLink({
  href,
  label,
  icon,
  iconClassName,
}: {
  href: string
  label: string
  icon: string
  iconClassName: string
}): React.JSX.Element {
  return (
    <Link
      href={href}
      aria-label={label}
      className={buttonVariants({
        variant: "outline",
        size: "icon",
        className:
          "size-9 rounded-[10px] border-[#e5e5e5] bg-white p-0 shadow-none hover:bg-white",
      })}
    >
      <Image
        src={icon}
        alt=""
        width={16}
        height={16}
        className={iconClassName}
      />
    </Link>
  )
}

export default function SettingsChrome({
  mobileTitle,
  mobileBackHref,
  secondaryTitle,
}: SettingsChromeProps): React.JSX.Element {
  return (
    <>
      <MobileStatusBar />

      <header className="sticky top-0 z-30 mx-auto flex h-14 w-full max-w-[402px] items-center justify-between bg-[#f2efe4] px-4 md:hidden">
        <ChromeIconLink
          href={mobileBackHref}
          label="Go back"
          icon="/assets/scenarios/back-mobile.svg"
          iconClassName="size-[10.667px]"
        />
        <h1 className="font-[family-name:var(--font-inter)] text-xl leading-6 font-medium text-[#0a0a0a]">
          {mobileTitle}
        </h1>
        <button
          type="button"
          aria-label="More options"
          className="flex size-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6]"
        >
          <Image
            src="/assets/scenarios/more.svg"
            alt=""
            width={12}
            height={3}
            className="h-[2.333px] w-[11.667px]"
          />
        </button>
      </header>

      <header className="hidden min-h-[95px] items-center justify-between border-b border-[#e5e5e5] bg-[#f2efe4] px-8 py-5 md:flex">
        <div>
          <h1 className="font-[family-name:var(--font-sans)] text-2xl leading-8 font-bold text-[#162456]">
            Settings
          </h1>
          <p className="pt-0.5 font-[family-name:var(--font-lato)] text-sm leading-5 text-[#79716b]">
            Manage your preferences
          </p>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6]"
        >
          <Image
            src="/assets/settings/bell.svg"
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
          <span className="absolute top-[7px] right-[7px] size-1.5 rounded-full border border-white bg-[#e7000b]" />
        </button>
      </header>

      {secondaryTitle ? (
        <header className="relative hidden h-[61px] items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:flex">
          <ChromeIconLink
            href="/settings"
            label="Back to settings"
            icon="/assets/settings/back.svg"
            iconClassName="size-4"
          />
          <h2 className="absolute left-1/2 -translate-x-1/2 font-[family-name:var(--font-inter)] text-lg leading-7 font-medium text-[#0a0a0a]">
            {secondaryTitle}
          </h2>
          <button
            type="button"
            aria-label="More options"
            className="flex size-9 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#1447e6]"
          >
            <Image
              src="/assets/settings/more.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </button>
        </header>
      ) : null}
    </>
  )
}
