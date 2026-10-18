import { notFound } from "next/navigation"

import ScenarioPageChrome from "@/components/scenario-page-chrome"
import ScenarioPreviewMorphingCards from "@/components/scenario-preview-morphing-cards"
import { isScenarioId, scenarioIds } from "../../scenario-data"

export function generateStaticParams(): Array<{ scenario: string }> {
  return scenarioIds.map((scenario) => ({ scenario }))
}

export default async function ScenarioPreviewPage({
  params,
}: {
  params: Promise<{ scenario: string }>
}): Promise<React.JSX.Element> {
  const { scenario } = await params

  if (!isScenarioId(scenario)) {
    notFound()
  }

  return (
    <main className="min-h-dvh w-full bg-card text-foreground md:flex">
      <div className="min-w-0 flex-1 bg-background md:h-dvh md:overflow-y-auto">
        <ScenarioPageChrome
          backHref={`/learning/scenarios/${scenario}`}
          desktopSubtitle="Build confidence with core words before speaking"
        />
        <div className="pt-2 md:pt-6">
          <ScenarioPreviewMorphingCards scenario={scenario} />
        </div>
      </div>
    </main>
  )
}
