export const scenarioIds = [
  "restaurant-1",
  "shopping-1",
  "restaurant-2",
  "shopping-2",
] as const

export type ScenarioId = (typeof scenarioIds)[number]

export function isScenarioId(value: string): value is ScenarioId {
  return scenarioIds.some((scenarioId) => scenarioId === value)
}
