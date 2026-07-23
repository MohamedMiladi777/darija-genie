import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"

const sessions = [
  { title: "Grammar", lessons: "5 lessons", progress: 66 },
  { title: "Vocabulary", lessons: "7 lessons", progress: 20 },
] as const

const ContinueSessionSection = (): React.JSX.Element => {
  return (
    <section
      aria-labelledby="continue-session-heading"
      className="border-b border-[#e5e5e5]"
    >
      <div className="mx-auto w-full max-w-6xl pb-2.5">
        <header className="flex h-[46px] items-center justify-between px-4 pt-[7px] sm:px-6 md:px-8">
          <h2
            id="continue-session-heading"
            className="text-xl leading-7 font-bold text-[#162456]"
          >
            Continue Session
          </h2>
          <Button
            type="button"
            variant="ghost"
            className="h-[39px] px-0 font-[family-name:var(--font-lato)] text-base leading-[25.6px] font-normal tracking-[-0.16px] text-[#79716b] hover:bg-transparent hover:text-[#79716b]"
          >
            See All
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-[clamp(12px,5.72vw,23px)] px-4 sm:gap-5 sm:px-6 md:px-8">
          {sessions.map((session) => (
            <Card
              key={session.title}
              className="h-32 gap-0 rounded-[14px] border border-[#e5e5e5] bg-white py-0 shadow-xs ring-0"
            >
              <CardContent className="flex h-full flex-col justify-between p-4">
                <div className="text-center">
                  <h3 className="font-[family-name:var(--font-inter)] text-base leading-6 font-medium text-[#162456]">
                    {session.title}
                  </h3>
                  <p className="mt-1 font-[family-name:var(--font-inter)] text-sm leading-5 text-[#737373]">
                    {session.lessons}
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between font-[family-name:var(--font-inter)] text-sm leading-5 font-medium text-[#162456]">
                    <span>Progress</span>
                    <span>{session.progress}%</span>
                  </div>
                  <Progress
                    value={session.progress}
                    aria-label={`${session.title} progress: ${session.progress}%`}
                    className="gap-0 [&_[data-slot=progress-indicator]]:bg-[#1447e6] [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-[#f5f5f5]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContinueSessionSection
