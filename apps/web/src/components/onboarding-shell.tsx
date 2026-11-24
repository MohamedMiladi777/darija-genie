import { cn } from "@workspace/ui/lib/utils"

/**
 * Shared shell for onboarding screens.
 *
 * Uses the dynamic viewport (`dvh`) so the layout tracks mobile browser UI,
 * `safe center` alignment so overflowing content falls back to `start`
 * instead of becoming unreachable, and height-relative spacing so short
 * phones (e.g. iPhone SE) fit without clipping.
 */
export function OnboardingShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className="flex min-h-dvh items-center-safe justify-center-safe">
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-[clamp(1rem,3dvh,2rem)] px-6 py-6 sm:px-10 lg:flex-row lg:gap-12 lg:px-16",
          className
        )}
      >
        {children}
      </div>
    </main>
  )
}
