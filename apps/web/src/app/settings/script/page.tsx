import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import LearningSidebar from "@/components/app-sidebar"
import PreferenceSelector from "@/components/preference-selector"
import SettingsChrome from "@/components/settings-chrome"

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
