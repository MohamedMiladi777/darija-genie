/* eslint-disable @next/next/no-img-element */

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

const logoVector = "https://www.figma.com/api/mcp/asset/abdc559c-6f71-4f35-b36d-7044ba3ed883"
const logoWordmark = "https://www.figma.com/api/mcp/asset/12a32309-9ed3-40c6-9956-5eced38a6924"
const moroccoFlag = "https://www.figma.com/api/mcp/asset/b70e8e79-516c-492b-af2c-8f97abb2f81b"
const topButtonIcon = "https://www.figma.com/api/mcp/asset/1bb4925a-e0b0-4338-bcdf-004de7b9677c"
const statusWifi = "https://www.figma.com/api/mcp/asset/6b309472-93c2-423f-8c2d-88fdf63829b4"
const statusBattery = "https://www.figma.com/api/mcp/asset/f566f009-434d-44f3-9c5f-491f26a1edff"
const scenarioArrow = "https://www.figma.com/api/mcp/asset/b97101b7-33cb-4258-98d4-006bd47d7218"
const quizFood = "https://www.figma.com/api/mcp/asset/252bf2ff-bbb3-4495-a751-690853675cb9"
const quizMoney = "https://www.figma.com/api/mcp/asset/1464d7ec-ede8-477b-b1f6-64b33b7131ee"
const quizTime = "https://www.figma.com/api/mcp/asset/6fce41ab-817c-48eb-97f1-b8fa9cd9ad73"
const quizHotel = "https://www.figma.com/api/mcp/asset/61e737d8-8eef-41dd-ae5d-c6c9b2beda23"
const navTesting = "https://www.figma.com/api/mcp/asset/2a491b42-09e5-461a-9930-f7fff36d9e96"
const navLearning = "https://www.figma.com/api/mcp/asset/2dd679dd-dd0c-41f4-b0bb-e31a5455d97e"
const navSettings = "https://www.figma.com/api/mcp/asset/a7a599bd-9c7d-4362-ad54-772bc198bc2c"

const continueSessionCards = [
  { title: "Grammar", lessons: "5 lessons", progress: 66 },
  { title: "Vocabulary", lessons: "7 lessons", progress: 20 },
] as const

const scenarios = [
  {
    title: "Restaurant",
    description: "Learn how to order a tajine",
  },
  {
    title: "Shopping",
    description: "Become immune to scammers",
  },
]

const quizzes = [
  { title: "Food", level: "Level 1", icon: quizFood, iconBg: "bg-[#2545b3]" },
  { title: "Money", level: "Level 2", icon: quizMoney, iconBg: "bg-[#2545b3]" },
  { title: "Time", level: "Level 3", icon: quizTime, iconBg: "bg-[#2545b3]" },
  { title: "Hotel", level: "Level 1", icon: quizHotel, iconBg: "bg-[#2545b3]" },
]

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex h-11.5 items-center justify-between px-4 pt-1.75">
      <h2 className="text-[20px] font-bold leading-[1.4] text-[#162456]">{title}</h2>
      <Button
        variant="ghost"
        size="xs"
        className="h-auto px-0 text-[16px] font-normal leading-[1.6] text-[#79716b] hover:bg-transparent hover:text-[#5f564d]"
      >
        See All
      </Button>
    </div>
  )
}

function ProgressCard({
  title,
  lessons,
  progress,
  highlighted = false,
}: {
  title: string
  lessons: string
  progress: number
  highlighted?: boolean
}) {
  const progressFillClass = progress === 66 ? "w-[66%]" : "w-[20%]"

  return (
    <Card className={highlighted ? "bg-[#e0e7ff]" : "bg-white"}>
      <CardHeader className="items-center gap-1 p-4 text-center">
        <CardTitle className="text-[16px] font-medium leading-normal text-[#162456]">
          {title}
        </CardTitle>
        <CardDescription className="text-[14px] leading-[1.4] text-[#737373]">
          {lessons}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 px-4 pb-4 pt-0">
        <div className="flex items-center justify-between text-[14px] leading-[1.4] text-[#162456]">
          <span className="font-medium">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-[#f5f5f5]">
          <div className={`h-1 rounded-full bg-[#1447e6] ${progressFillClass}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function ScenarioCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="flex min-w-66.25 items-start justify-between bg-white px-3 py-3">
      <div className="min-w-0 pr-3">
        <CardTitle className="text-[14px] font-medium leading-[1.4] text-[#09090b]">
          {title}
        </CardTitle>
        <CardDescription className="mt-1 text-[14px] leading-[1.4] text-[#737373]">
          {description}
        </CardDescription>
      </div>
      <Button
        type="button"
        variant="default"
        size="icon-xs"
        className="size-8 rounded-[10px] bg-[#0a0a0a] p-0 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#111]"
      >
        <img alt="" className="size-4" src={scenarioArrow} />
      </Button>
    </Card>
  )
}

function QuizCard({
  title,
  level,
  icon,
  iconBg,
}: {
  title: string
  level: string
  icon: string
  iconBg: string
}) {
  return (
    <Card className="flex h-21.25 flex-col justify-between overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <CardTitle className="text-[16px] font-medium leading-normal text-[#162456]">
            {title}
          </CardTitle>
          <CardDescription className="text-[14px] leading-[1.4] text-[#737373]">
            {level}
          </CardDescription>
        </div>
        <div className={`flex size-9 items-center justify-center rounded-full ${iconBg}`}>
          <img alt="" className="size-4" src={icon} />
        </div>
      </div>
      <div aria-hidden className="h-12" />
    </Card>
  )
}

function NavItem({
  active,
  widthClass,
  icon,
  label,
}: {
  active?: boolean
  widthClass: string
  icon: string
  label: string
}) {
  return (
    <button
      type="button"
      className={[
        "flex items-center justify-center gap-1 rounded-md px-4 py-px",
        widthClass,
        active ? "h-13.75 bg-[#193cb8] text-[#f2efe4]" : "h-7.5 text-[#0a0a0a]",
      ].join(" ")}
    >
      <img alt="" className="size-4" src={icon} />
      <span className={active ? "text-[16px] font-semibold" : "text-[14px] font-semibold"}>{label}</span>
    </button>
  )
}

function LogoMark() {
  return (
    <div className="relative h-20 w-28 leading-none">
      <div className="absolute left-5.75 top-12.75 h-8.25 w-6.75">
        <img alt="" className="size-full max-w-none" src={logoVector} />
      </div>
      <div className="absolute left-0 top-0 h-12 w-15">
        <img alt="" className="size-full max-w-none" src={logoWordmark} />
      </div>
      <p className="absolute left-11.75 top-7.75 whitespace-nowrap text-[16px] italic text-[#c6b89b]">
        arija
      </p>
      <p className="absolute left-11.75 top-16 whitespace-nowrap text-[11.5px] italic text-[#c6b89b]">
        enie
      </p>
      <div className="absolute left-16 top-2.5 size-5.25">
        <img alt="" className="size-full max-w-none" src={moroccoFlag} />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-svh bg-[#f2efe4] text-[#162456]">
      <div className="relative mx-auto min-h-svh w-full max-w-100.5 overflow-x-hidden bg-[#f2efe4]">
        <header className="relative bg-[#162456] pb-6 pt-12.25 text-white">
          <div className="absolute left-0 top-0 flex w-full items-center justify-between px-4 py-3">
            <span className="text-[16px] font-semibold leading-5">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="relative size-6">
                <div className="absolute bottom-[29%] left-3/4 right-[12.5%] top-[29%] rounded-[1px] bg-white" />
                <div className="absolute bottom-[29%] left-[12.5%] right-3/4 top-[54%] rounded-[1px] bg-white" />
                <div className="absolute inset-[45.83%_54.17%_29.17%_33.33%] rounded-[1px] bg-white" />
                <div className="absolute inset-[37.5%_33.33%_29.17%_54.17%] rounded-[1px] bg-white" />
              </div>
              <img alt="" className="size-6" src={statusWifi} />
              <img alt="" className="size-6" src={statusBattery} />
            </div>
          </div>

          <div className="flex items-start justify-between px-4 pt-1.75">
            <LogoMark />

            <button
              type="button"
              aria-label="Toggle appearance"
              className="flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-[#f2efe4] p-2"
            >
              <img alt="" className="size-4" src={topButtonIcon} />
            </button>
          </div>

          <div className="px-4 pb-1.75">
            <h1 className="text-[24px] font-bold leading-[1.4] text-[#f2efe4]">Learn Darija!</h1>
            <p className="mt-1 text-[18px] leading-normal tracking-[-0.18px] text-[#95938f]">
              What would you like to learn today?
            </p>
          </div>
        </header>

        <div className="border-t border-[#e5e5e5]" />

        <section className="px-4 pt-2">
          <SectionHeader title="Continue Session" />
          <div className="mt-2 grid grid-cols-2 gap-5.75">
            <ProgressCard {...continueSessionCards[0]} />
            <ProgressCard {...continueSessionCards[1]} highlighted />
          </div>
        </section>

        <Separator className="mt-5 bg-[#e5e5e5]" />

        <section className="px-0 pt-2">
          <SectionHeader title="Scenarios" />
          <div className="mt-2 flex gap-3.75 overflow-x-auto px-4 pb-1 scrollbar-none">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.title} {...scenario} />
            ))}
          </div>
        </section>

        <Separator className="mt-5 bg-[#e5e5e5]" />

        <section className="px-0 pt-2 pb-22">
          <SectionHeader title="Quizzes" />
          <div className="mt-2 grid grid-cols-2 gap-5.75 px-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.title} {...quiz} />
            ))}
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-100.5 -translate-x-1/2 items-center justify-center bg-[#ebe0ca] px-0 shadow-[0_-1px_0_rgba(0,0,0,0.08)]">
          <NavItem widthClass="w-[126px]" icon={navTesting} label="Testing" />
          <NavItem active widthClass="w-[140px]" icon={navLearning} label="Learning" />
          <NavItem widthClass="w-[136px]" icon={navSettings} label="Settings" />
        </nav>
      </div>
    </main>
  )
}
