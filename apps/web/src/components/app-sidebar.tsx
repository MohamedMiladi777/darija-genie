import Image from "next/image"
import Link from "next/link"
import { BookCheck, LucideIcon, Settings, House, Settings2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@workspace/ui/components/sidebar"

import type { LearningNavigationItem } from "./learning-navigation"
import { LogoMarkDark } from "./assets/logo"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WITH_MOBILE = "18rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

interface NavigationItem {
  value: LearningNavigationItem
  label: string
  icon: LucideIcon
  href?: string
  activeIcon?: string
}

/* const navigationItems: readonly NavigationItem[] = [
  {
    value: "testing",
    label: "Testing",
    icon: BookCheck,
  },
  {
    value: "learning",
    label: "Learning",
    href: "/learning",
    icon: House,
  },
  {
    value: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    activeIcon: "/assets/settings/sidebar-settings-active.svg",
  },
]
 */

const data = {
  user: {
    name: "Darija Learner",
    label: "Beginner",
  },
  navMain: [
    {
      title: "Learning",
      icon: House,
      url: "#",
      isActive: true,
    },

    {
      title: "Testing",
      icon: BookCheck,
      url: "#",
      isActive: false,
    },

    {
      title: "Settings",
      icon: Settings,
      url: "#",
      isActive: false,
    },
  ],
}

interface LearningSidebarProps {
  activeItem?: LearningNavigationItem
}

function NavMain({ items }: { items: typeof data.navMain }) {}

export function AppSidebar({
  navMain,
}: {
  navMain: {
    title: string
    icon: React.ElementType
  }
}) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
      </SidebarHeader>
    </Sidebar>
  )
}

/** Without Shadcn */

/*export default function LearningSidebar({
  activeItem = "learning",
}: LearningSidebarProps): React.JSX.Element {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-[#162456] md:flex lg:w-72">
      <div className="flex min-h-36 items-center border-b border-[#f2efe4]/15 px-6 py-8">
        <LogoMarkDark className="h-20 w-[90px]" />
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-1 p-4"
      >
        {navigationItems.map((item) => {
          const isActive = item.value === activeItem
          const className = `flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] leading-[22.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2efe4] ${
            isActive
              ? "bg-[#193cb8] text-[#f2efe4]"
              : "text-[#f2efe4]/55 hover:bg-white/8 hover:text-[#f2efe4]"
          }`
          const content = (
            <>
              <Image
                src={isActive && item.activeIcon ? item.activeIcon : item.icon}
                alt=""
                width={20}
                height={20}
                className="size-5"
              />
              <span>{item.label}</span>
            </>
          )

          if (!item.href) {
            return (
              <button
                key={item.value}
                type="button"
                disabled
                className={className}
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={item.value}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          )
        })}
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

*/
