import PreferenceSelector from "@/components/preference-selector"
import SettingsChrome from "@/components/settings-chrome"

export default function FontSizeSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background">
      <SettingsChrome
        mobileTitle="Font size"
        mobileBackHref="/settings"
        secondaryTitle="Font size"
      />
      <PreferenceSelector kind="fontSize" />
    </main>
  )
}
