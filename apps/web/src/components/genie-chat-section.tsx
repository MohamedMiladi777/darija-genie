import Image from "next/image"
import Link from "next/link"

const navigationItems = [
  { label: "Testing", icon: "/assets/genie-chat/testing.svg", href: "/testing" },
  {
    label: "Learning",
    icon: "/assets/genie-chat/learning.svg",
    active: true,
    href: "/learning",
  },
  { label: "Settings", icon: "/assets/genie-chat/settings.svg", href: "/settings" },
] as const

export default function GenieChatSidebar(): React.JSX.Element {
  return (
    <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-[153px] flex-col items-center gap-3 border-b border-sidebar-border pt-8">
        <button
          type="button"
          aria-label="Expand sidebar"
          className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
        >
          <Image
            src="/assets/genie-chat/menu.svg"
            alt=""
            width={20}
            height={20}
            className="size-5"
          />
        </button>
        <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary font-[family-name:var(--font-sans)] text-[22px] leading-7 font-semibold text-sidebar-primary-foreground">
          D
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-1 p-4"
      >
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            aria-label={item.label}
            aria-current={"active" in item && item.active ? "page" : undefined}
            href={item.href}
            className={`flex h-11 w-12 items-center justify-center rounded-xl border-l-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring ${
              "active" in item && item.active
                ? "border-sidebar-primary bg-sidebar-accent"
                : "hover:bg-sidebar-accent"
            }`}
          >
            <Image
              src={item.icon}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
          </Link>
        ))}
      </nav>

      <div className="flex h-[108px] items-start justify-center pt-6">
        <div className="flex h-[60px] w-16 items-center justify-center rounded-xl bg-white/8">
          <div className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary font-[family-name:var(--font-inter)] text-sm font-bold text-sidebar-primary-foreground">
            DJ
          </div>
        </div>
      </div>
    </aside>
  )
}
