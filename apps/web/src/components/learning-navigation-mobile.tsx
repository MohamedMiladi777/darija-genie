"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import type { LearningNavigationItem } from "./learning-navigation"
import { LearningIcon, SettingsIcon, TestingIcon, type AppIcon } from "./icons"
import { cn } from "@workspace/ui/lib/utils"

interface NavigationItem {
  value: LearningNavigationItem
  label: string
  icon: AppIcon
  href: string
}

const navigationItems: readonly NavigationItem[] = [
  {
    value: "testing",
    label: "Testing",
    icon: TestingIcon,
    href: "/testing",
  },
  {
    value: "learning",
    label: "Learning",
    href: "/learning",
    icon: LearningIcon,
  },
  {
    value: "settings",
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

export default function LearningMobileNavigation(): React.JSX.Element | null {
  const pathname = usePathname()
  if (pathname.includes("/geniechat")) return null

  const activeItem: LearningNavigationItem = pathname.startsWith("/settings")
    ? "settings"
    : pathname.startsWith("/testing")
      ? "testing"
      : "learning"

  return (
    <nav
      aria-label="Primary"
      className="mobile-primary-navigation fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-[min(560px,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-xl sm:border sm:px-2 sm:pb-0 md:hidden"
    >
      <ul className="m-0 grid h-16 list-none grid-cols-3 items-stretch p-0">
        {navigationItems.map((item) => {
          const isActive = item.value === activeItem
          const isCurrentPage = pathname === item.href
          const Icon = item.icon

          return (
            <li key={item.value} className="min-w-0">
              <Link
                href={item.href}
                aria-current={
                  isCurrentPage ? "page" : isActive ? "location" : undefined
                }
                className={cn(
                  "relative mx-auto flex h-full min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs leading-4 font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none",
                  isActive &&
                    "bg-sidebar-primary/10 font-semibold text-sidebar-primary after:absolute after:top-1 after:h-0.5 after:w-8 after:rounded-full after:bg-sidebar-primary"
                )}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
