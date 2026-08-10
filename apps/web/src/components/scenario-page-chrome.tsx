import Image from "next/image"
import Link from "next/link"

import { Button, buttonVariants } from "@workspace/ui/components/button"

export function MobileStatusBar(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex h-12 w-full max-w-[402px] items-center justify-between px-8 text-foreground md:hidden"
    >
      <span className="font-[family-name:var(--font-inter)] text-sm leading-none font-semibold">
        9:41
      </span>
      <div className="flex items-center gap-2">
        <span className="flex h-3 items-end gap-[1.5px]">
          {[3, 5, 7, 9].map((height) => (
            <span
              key={height}
              className="w-[2px] rounded-sm bg-foreground"
              style={{ height }}
            />
          ))}
        </span>
        <span className="relative block h-[11px] w-[14px] overflow-hidden">
          <span className="absolute top-0 left-1/2 size-[14px] -translate-x-1/2 rotate-45 rounded-tl-[9px] border-t-2 border-l-2 border-foreground" />
          <span className="absolute bottom-0 left-1/2 size-[5px] -translate-x-1/2 rotate-45 rounded-tl-sm border-t-2 border-l-2 border-foreground" />
        </span>
        <span className="relative block h-[9px] w-[18px] rounded-[2px] border border-foreground">
          <span className="absolute inset-[1.5px] rounded-[1px] bg-foreground" />
          <span className="absolute top-[2px] -right-[3px] h-[3px] w-[2px] rounded-r-sm bg-foreground" />
        </span>
      </div>
    </div>
  )
}

function BackLink({
  href,
  desktop = false,
}: {
  href: string
  desktop?: boolean
}): React.JSX.Element {
  return (
    <Link
      href={href}
      aria-label="Go back"
      className={buttonVariants({
        variant: "outline",
        size: "icon",
        className: `size-9 border-border bg-card p-0 shadow-none hover:bg-muted ${
          desktop ? "rounded-xl" : "rounded-[10px]"
        }`,
      })}
    >
      <Image
        src={
          desktop
            ? "/assets/scenarios/back-desktop.svg"
            : "/assets/scenarios/back-mobile.svg"
        }
        alt=""
        width={desktop ? 16 : 11}
        height={desktop ? 16 : 11}
        className={`${desktop ? "size-4" : "size-[10.667px]"} dark:brightness-0 dark:invert`}
      />
    </Link>
  )
}

export default function ScenarioPageChrome({
  backHref,
  desktopSubtitle,
}: {
  backHref: string
  desktopSubtitle: string
}): React.JSX.Element {
  return (
    <>
      <MobileStatusBar />

      <header className="sticky top-0 z-20 mx-auto flex h-14 w-full max-w-[402px] items-center justify-between bg-background px-4 md:hidden">
        <BackLink href={backHref} />
        <h1 className="font-[family-name:var(--font-inter)] text-xl leading-6 font-medium text-foreground">
          Scenarios
        </h1>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="More options"
          className="size-9 rounded-[10px] border-border bg-card p-0 shadow-none hover:bg-muted"
        >
          <Image
            src="/assets/scenarios/more.svg"
            alt=""
            width={12}
            height={3}
            className="h-[2.333px] w-[11.667px] dark:brightness-0 dark:invert"
          />
        </Button>
      </header>

      <header className="hidden min-h-[95px] items-center border-b border-border bg-background px-8 py-5 md:flex">
        <div className="flex h-[54px] items-center gap-3">
          <BackLink href={backHref} desktop />
          <div>
            <h1 className="font-[family-name:var(--font-sans)] text-2xl leading-8 font-bold text-foreground">
              Scenarios
            </h1>
            <p className="pt-0.5 font-[family-name:var(--font-lato)] text-sm leading-5 font-normal text-muted-foreground">
              {desktopSubtitle}
            </p>
          </div>
        </div>
      </header>
    </>
  )
}
