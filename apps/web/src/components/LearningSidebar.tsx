import Image from "next/image"

import { LogoMarkDark } from "./logo"

const navigationItems = [
  {
    label: "Testing",
    icon: "/assets/learning/desktop-nav-testing.svg",
  },
  {
    label: "Learning",
    icon: "/assets/learning/desktop-nav-learning.svg",
    active: true,
  },
  {
    label: "Settings",
    icon: "/assets/learning/desktop-nav-settings.svg",
  },
] as const

export default function LearningSidebar(): React.JSX.Element {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-[#162456] md:flex lg:w-72">
      <div className="flex min-h-36 items-center border-b border-[#f2efe4]/15 px-6 py-8">
        <LogoMarkDark className="h-20 w-[90px]" />
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-1 p-4"
      >
        {navigationItems.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-current={"active" in item && item.active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] leading-[22.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2efe4] ${
              "active" in item && item.active
                ? "bg-[#193cb8] text-[#f2efe4]"
                : "text-[#f2efe4]/55 hover:bg-white/8 hover:text-[#f2efe4]"
            }`}
          >
            <Image
              src={item.icon}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 py-6">
        <div className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c6b89b] font-[family-name:var(--font-inter)] text-sm font-bold text-[#162456]">
            DJ
          </div>
          <div className="min-w-0 font-[family-name:var(--font-inter)]">
            <p className="truncate text-sm leading-5 font-medium text-white">
              Darija Learner
            </p>
            <p className="text-xs leading-4 text-[#f2efe4]/50">Beginner</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
