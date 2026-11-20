"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import type { LearningNavigationItem } from "./learning-navigation"
import { LearningIcon, SettingsIcon, TestingIcon, type AppIcon } from "./icons"

interface NavigationItem {
  value: LearningNavigationItem
  label: string
  icon: AppIcon
  href?: string
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
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ded5c3] bg-[#ebe0ca] sm:right-auto sm:bottom-4 sm:left-1/2 sm:w-[min(560px,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-xl sm:border sm:shadow-[0_10px_30px_rgba(22,36,86,0.16)] md:hidden dark:border-border dark:bg-background"
    >
      <div className="grid h-[55px] grid-cols-[126fr_140fr_136fr] items-center sm:grid-cols-3">
        {navigationItems.map((item) => {
          const isActive = item.value === activeItem
          const Icon = item.icon
          const className = `flex h-full min-w-0 items-center justify-center gap-1 rounded-md font-[family-name:var(--font-inter)] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring ${
            isActive
              ? "bg-[#193cb8] text-base text-[#f2efe4] dark:bg-primary dark:text-primary-foreground"
              : "text-sm text-foreground hover:bg-white/35 dark:hover:bg-sidebar-accent"
          }`
          const content = (
            <>
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
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
      </div>
    </nav>
  )
}
