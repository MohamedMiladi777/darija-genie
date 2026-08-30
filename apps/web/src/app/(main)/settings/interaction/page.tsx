import LearningMobileNavigation from "@/components/learning-navigation-mobile"
import LearningSidebar from "@/components/app-sidebar"
import PreferenceSelector from "@/components/preference-selector"
import SettingsChrome from "@/components/settings-chrome"

export default function InteractionModeSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background md:flex">
      <LearningSidebar activeItem="settings" />

      <div className="min-w-0 flex-1">
        <SettingsChrome
          mobileTitle="Interaction"
          mobileBackHref="/settings"
          secondaryTitle="Interaction"
        />
        <PreferenceSelector kind="interaction" />
      </div>

      <LearningMobileNavigation activeItem="settings" />
    </main>
  )
}
