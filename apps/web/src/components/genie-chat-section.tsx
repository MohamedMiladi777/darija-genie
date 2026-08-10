import Image from "next/image"

const navigationItems = [
  { label: "Testing", icon: "/assets/genie-chat/testing.svg" },
  {
    label: "Learning",
    icon: "/assets/genie-chat/learning.svg",
    active: true,
  },
  { label: "Settings", icon: "/assets/genie-chat/settings.svg" },
] as const

export default function GenieChatSidebar(): React.JSX.Element {
  return (
    <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col bg-[#162456] md:flex">
      <div className="flex h-[153px] flex-col items-center gap-3 border-b border-[#f2efe4]/15 pt-8">
        <button
          type="button"
          aria-label="Expand sidebar"
          className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2efe4]"
        >
          <Image
            src="/assets/genie-chat/menu.svg"
            alt=""
            width={20}
            height={20}
            className="size-5"
          />
        </button>
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#1447e6] font-[family-name:var(--font-sans)] text-[22px] leading-7 font-semibold text-white">
          D
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-1 p-4"
      >
        {navigationItems.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-current={"active" in item && item.active ? "page" : undefined}
            className={`flex h-11 w-12 items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2efe4] ${
              "active" in item && item.active
                ? "bg-[#193cb8]"
                : "hover:bg-white/8"
            }`}
          >
            <Image
              src={item.icon}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
          </button>
        ))}
      </nav>

      <div className="flex h-[108px] items-start justify-center pt-6">
        <div className="flex h-[60px] w-16 items-center justify-center rounded-xl bg-white/8">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#c6b89b] font-[family-name:var(--font-inter)] text-sm font-bold text-[#162456]">
            DJ
          </div>
        </div>
      </div>
    </aside>
  )
}
