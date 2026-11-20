import { notFound } from "next/navigation"

import { TestingStudio } from "@/components/testing-studio"
import { isScenarioId, scenarioIds } from "../../scenario-data"

export function generateStaticParams(): Array<{ scenario: string }> {
  return scenarioIds.map((scenario) => ({ scenario }))
}

export default async function ScenarioQuizPage({
  params,
}: {
  params: Promise<{ scenario: string }>
}): Promise<React.JSX.Element> {
  const { scenario } = await params
  if (!isScenarioId(scenario)) {
    notFound()
  }

  return <TestingStudio key={scenario} scenario={scenario} />
}
