import Image from "next/image"

const navigationItems = [
  {
    value: "testing",
    label: "Testing",
    icon: "/assets/learning/nav-testing.svg",
    iconClassName: "h-[14.333px] w-[14.333px]",
  },
  {
    value: "learning",
    label: "Learning",
    icon: "/assets/learning/nav-learning.svg",
    iconClassName: "h-[13.666px] w-[13px]",
  },
  {
    value: "settings",
    label: "Settings",
    icon: "/assets/learning/nav-settings.svg",
    iconClassName: "h-[14.333px] w-[13.023px]",
  },
] as const

export default function LearningMobileNavigation(): React.JSX.Element {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ded5c3] bg-[#ebe0ca] sm:right-auto sm:bottom-4 sm:left-1/2 sm:w-[min(560px,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-xl sm:border sm:shadow-[0_10px_30px_rgba(22,36,86,0.16)] md:hidden"
    >
      <div className="grid h-[55px] grid-cols-[126fr_140fr_136fr] items-center sm:grid-cols-3">
        {navigationItems.map((item) => {
          const isActive = item.value === "learning"

          return (
            <button
              key={item.value}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={`flex h-full min-w-0 items-center justify-center gap-1 rounded-md font-[family-name:var(--font-inter)] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#1447e6] ${
                isActive
                  ? "bg-[#193cb8] text-base text-[#f2efe4]"
                  : "text-sm text-[#0a0a0a] hover:bg-white/35"
              }`}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                <Image
                  src={item.icon}
                  alt=""
                  width={16}
                  height={16}
                  className={item.iconClassName}
                />
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
