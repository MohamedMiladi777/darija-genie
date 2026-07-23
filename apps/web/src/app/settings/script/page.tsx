import LearningMobileNavigation from "@/components/LearningMobileNavigation"
import LearningSidebar from "@/components/LearningSidebar"
import PreferenceSelector from "@/components/PreferenceSelector"
import SettingsChrome from "@/components/SettingsChrome"

export default function TextScriptSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-[#f2efe4] md:flex">
      <LearningSidebar activeItem="settings" />

      <div className="min-w-0 flex-1">
        <SettingsChrome
          mobileTitle="Script"
          mobileBackHref="/settings"
          secondaryTitle="Script"
        />
        <PreferenceSelector kind="script" />
      </div>

      <LearningMobileNavigation activeItem="settings" />
    </main>
  )
}
