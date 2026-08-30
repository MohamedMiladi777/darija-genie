import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import LearningSidebar from "@/components/app-sidebar"
import PreferenceSelector from "@/components/preference-selector"
import SettingsChrome from "@/components/settings-chrome"

export default function FontSizeSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background md:flex">
      <LearningSidebar />

      <div className="min-w-0 flex-1">
        <SettingsChrome
          mobileTitle="Font size"
          mobileBackHref="/settings"
          secondaryTitle="Font size"
        />
        <PreferenceSelector kind="fontSize" />
      </div>

      <LearningMobileNavigation activeItem="settings" />
    </main>
  )
}
