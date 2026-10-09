import PreferenceSelector from "@/components/preference-selector"
import SettingsChrome from "@/components/settings-chrome"

export default function TextScriptSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background">
      <SettingsChrome
        mobileTitle="Script"
        mobileBackHref="/settings"
        secondaryTitle="Script"
      />
      <PreferenceSelector kind="script" />
    </main>
  )
}
