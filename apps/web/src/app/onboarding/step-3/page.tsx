import LampMark from "@/components/lamp"
import { Button } from "@workspace/ui/components/button"

function MainContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 px-6 pb-8 lg:flex-row lg:items-start lg:gap-16 lg:px-16">
      <LampMark />

      <div className="flex max-w-96 flex-col gap-8">
        <div className="space-y-3">
          <h1 className="text-2xl font-medium tracking-wide text-blue-950">
            Choose your theme
          </h1>
          <p className="max-w-sm text-sm leading-6 text-blue-950/70">
            Select your preferred theme. You can always change this later in
            settings.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button className="flex items-center justify-center gap-2 rounded-full bg-blue-950 px-6 py-3 text-sm font-medium text-neutral-50 shadow-md">
            Light Mode
          </Button>
          <Button className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-blue-950 shadow-sm">
            Dark Mode
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function WelcomeScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <MainContent />
    </main>
  )
}
