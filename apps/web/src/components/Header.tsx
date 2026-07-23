import Image from "next/image"

import { Button } from "@workspace/ui/components/button"

import { LogoMarkDark } from "./logo"

export const Header = (): React.JSX.Element => {
  return (
    <section
      className="flex min-h-[220px] w-full flex-col justify-center gap-[13px] bg-[#162456] px-4 py-[7px] sm:min-h-[208px] sm:px-6 md:px-8"
      aria-labelledby="learning-welcome-title"
    >
      <div className="flex min-h-[84px] items-start justify-between">
        <LogoMarkDark />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-9 rounded-lg bg-[#f2efe4] p-0 text-[#162456] hover:bg-[#f2efe4]/90"
          aria-label="Toggle theme"
        >
          <span className="flex size-4 items-center justify-center">
            <Image
              src="/assets/learning/theme.svg"
              alt=""
              width={14.333}
              height={14.333}
              className="size-[14.333px]"
            />
          </span>
        </Button>
      </div>
      <header>
        <h1
          id="learning-welcome-title"
          className="text-2xl leading-[33.6px] font-bold text-[#f2efe4]"
        >
          Learn Darija!
        </h1>
        <p className="font-[family-name:var(--font-lato)] text-lg leading-[27px] tracking-[-0.18px] text-[#95938f]">
          What would you like to learn today?
        </p>
      </header>
    </section>
  )
}

export default Header
