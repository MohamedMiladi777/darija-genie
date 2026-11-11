"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { LearningNavigationItem } from "./learning-navigation"
import { LogoMarkCompact, LogoMarkDark } from "./assets/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

interface NavigationItem {
  value: LearningNavigationItem
  label: string
  icon: string
  href: string
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

export function AppSidebar(): React.JSX.Element | null {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()

  if (pathname.includes("/geniechat")) return null

  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "items-center justify-center gap-0 border-b border-sidebar-border p-0 transition-[height] duration-200 ease-linear",
          isCollapsed ? "h-16" : "h-[132px] px-4"
        )}
      >
        <Link
          href="/learning"
          aria-label="Darija Genie — go to Learning"
          className="flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          {isCollapsed ? (
            <LogoMarkCompact className="h-8 w-auto" />
          ) : (
            <LogoMarkDark className="h-[106px] w-[120px]" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.label}
                      className="data-active:bg-sidebar-primary! data-active:text-sidebar-primary-foreground!"
                    >
                      <Image
                        src={
                          isActive && item.activeIcon
                            ? item.activeIcon
                            : item.icon
                        }
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 shrink-0"
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Darija Learner">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#c6b89b] text-xs font-bold text-[#162456]">
                DJ
              </div>
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  Darija Learner
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Beginner
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
