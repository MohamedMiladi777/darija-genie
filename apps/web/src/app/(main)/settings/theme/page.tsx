import SettingsChrome from "@/components/settings-chrome"
import ThemeSelector from "@/components/theme-selector"

export default function ThemeSettingsPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-background">
      <SettingsChrome
        mobileTitle="Theme"
        mobileBackHref="/settings"
        secondaryTitle="Theme"
      />

      <div className="min-h-[calc(100dvh-104px)] md:hidden" />

      <section className="mx-auto hidden w-full max-w-2xl px-5 pt-6 pb-10 md:block">
        <ThemeSelector />
      </section>
    </main>
  )
}
