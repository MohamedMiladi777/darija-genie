import ContinueSessionSection from "@/components/continue-session-section"
import Header from "@/components/header"
import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import { AppSidebar } from "@/components/app-sidebar"
import QuizSection from "@/components/quiz-section"
import ScenarioSection from "@/components/scenario-section"

export default function LearningPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh w-full bg-white text-[#162456] md:flex">
      <AppSidebar />

      <div className="min-w-0 flex-1 bg-[#f2efe4] md:h-dvh md:overflow-y-auto">
        <Header />
        <div className="mx-auto min-h-dvh w-full max-w-6xl overflow-hidden bg-[#f2efe4] pb-20 sm:pb-28 md:flex md:min-h-0 md:max-w-[896px] md:flex-col md:gap-8 md:overflow-visible md:px-8 md:py-6 md:pb-8">
          <ContinueSessionSection />
          <ScenarioSection />
          <QuizSection />
        </div>
      </div>

      <LearningMobileNavigation />
    </main>
  )
}
