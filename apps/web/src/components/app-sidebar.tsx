"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { LearningNavigationItem } from "./learning-navigation"
import { LogoMarkDark } from "./assets/logo"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from "@workspace/ui/components/sidebar"

interface NavigationItem {
  value: LearningNavigationItem
  label: string
  icon: string
  href?: string
  activeIcon?: string
}

const navigationItems: readonly NavigationItem[] = [
  {
    value: "testing",
    label: "Testing",
    icon: "/assets/learning/desktop-nav-testing.svg",
    href: "/testing",
  },
  {
    value: "learning",
    label: "Learning",
    href: "/learning",
    icon: "/assets/learning/desktop-nav-learning.svg",
  },
  {
    value: "settings",
    label: "Settings",
    href: "/settings",
    icon: "/assets/learning/desktop-nav-settings.svg",
    activeIcon: "/assets/settings/sidebar-settings-active.svg",
  },
]

// interface LearningSidebarProps {
//   activeItem?: LearningNavigationItem
// }

export function AppSidebar(): React.JSX.Element | null {
  const pathname = usePathname()

  if (pathname.includes("/geniechat")) return null

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex min-h-36 items-center border-b px-6 py-8">
        <LogoMarkDark className="h-20 w-[90px]" />
      </SidebarHeader>

      {/* <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-1 p-4"
      > */}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-1 p-4">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href ? pathname.startsWith(`${item.href}/`) : false)
              const className = `flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] leading-[22.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2efe4] ${isActive ? "bg-[#193cb8] text-[#f2efe4]" : "text-[#f2efe4]/55 hover:bg-white/8 hover:text-[#f2efe4]"}`
              const content = (
                <>
                  <Image
                    src={
                      isActive && item.activeIcon ? item.activeIcon : item.icon
                    }
                    alt=""
                    width={20}
                    height={20}
                    className={`size-5 ${isActive && pathname.startsWith("/testing") ? "brightness-0 invert" : ""}`}
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* </nav> */}

      {/* <div className="p-4 py-6">
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
      </div> */}

      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
