import PreferenceSelector from "@/components/preference-selector"
import SettingsChrome from "@/components/settings-chrome"

export default function InteractionModeSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background">
      <SettingsChrome
        mobileTitle="Interaction"
        mobileBackHref="/settings"
        secondaryTitle="Interaction"
      />
      <PreferenceSelector kind="interaction" />
    </main>
  )
}
