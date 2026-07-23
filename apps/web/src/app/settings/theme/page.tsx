import LearningMobileNavigation from "@/components/LearningMobileNavigation"
import LearningSidebar from "@/components/LearningSidebar"
import SettingsChrome from "@/components/SettingsChrome"
import ThemeSelector from "@/components/ThemeSelector"

export default function ThemeSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-[#f2efe4] md:flex">
      <LearningSidebar activeItem="settings" />

      <div className="min-w-0 flex-1">
        <SettingsChrome
          mobileTitle="Theme"
          mobileBackHref="/settings"
          secondaryTitle="Theme"
        />

        <div className="min-h-[calc(100dvh-104px)] md:hidden" />

        <section className="mx-auto hidden w-full max-w-2xl px-5 pt-6 pb-10 md:block">
          <ThemeSelector />
        </section>
      </div>

      <LearningMobileNavigation activeItem="settings" />
    </main>
  )
}
