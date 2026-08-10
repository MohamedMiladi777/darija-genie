import ContinueSessionSection from "@/components/continue-session-section"
import Header from "@/components/header"
import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import { AppSidebar } from "@/components/app-sidebar"
import QuizSection from "@/components/quiz-section"
import ScenarioSection from "@/components/scenario-section"

export default function LearningPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-[#f2efe4] text-[#162456] md:flex">
      <AppSidebar />
      <div className="min-w-0 flex-1 bg-[#f2efe4] md:h-dvh md:overflow-y-auto">
        <div className="w-full">
          <Header />
          <div className="flex min-h-0 w-full flex-col gap-8 overflow-hidden px-4 py-6 pb-24 sm:px-6 sm:pb-28 md:px-8 md:pb-8">
            <ContinueSessionSection />
            <ScenarioSection />
            <QuizSection />
          </div>
        </div>
      </div>
      <LearningMobileNavigation />
    </main>
  )
}
