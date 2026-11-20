import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"

export type ScenarioFamily = "restaurant" | "shopping"
export type WordType = "noun" | "adjective" | "verb"

export interface PreviewCardWord {
  id: string
  type: WordType
  darija: string
  transliteration: string
  english: string
  image: string
  grammar: string[]
  cue: string
}

export interface ScenarioProfile {
  family: ScenarioFamily
  title: string
  subtitle: string
  image: string
  accentColor: string
  words: PreviewCardWord[]
}

export function getScenarioFamily(scenarioId: string): ScenarioFamily {
  return scenarioId.startsWith("shopping") ? "shopping" : "restaurant"
}

export function getScenarioTitle(scenarioId: string): string {
  return getScenarioFamily(scenarioId) === "shopping" ? "Shopping" : "Restaurant"
}

export function getPreviewProgressKey(scenarioId: ScenarioId): string {
  return `darija-genie:preview-complete:${scenarioId}`
}
