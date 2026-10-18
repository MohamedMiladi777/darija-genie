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

const scenarioProfiles: Record<ScenarioFamily, ScenarioProfile> = {
  restaurant: {
    family: "restaurant",
    title: "Restaurant",
    subtitle: "Foundations before dialogue",
    image: "/assets/genie-chat/restaurant.jpg",
    accentColor: "#9a3412",
    words: [
      {
        id: "restaurant-menu",
        type: "noun",
        darija: "المينيو",
        transliteration: "lminyu",
        english: "menu",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["M", "S", "plural: lminyuwat"],
        cue: "Use it to ask what dishes are available.",
      },
      {
        id: "restaurant-table",
        type: "noun",
        darija: "الطابلة",
        transliteration: "ttabla",
        english: "table",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["F", "S", "plural: twabel"],
        cue: "Useful when asking for a table for two.",
      },
      {
        id: "restaurant-water",
        type: "noun",
        darija: "الما",
        transliteration: "lma",
        english: "water",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["M", "S", "mass noun"],
        cue: "Common in polite requests before food arrives.",
      },
      {
        id: "restaurant-bill",
        type: "noun",
        darija: "لحساب",
        transliteration: "l7sab",
        english: "bill / check",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["M", "S", "plural: l7sabat"],
        cue: "Essential at the end of the meal.",
      },
      {
        id: "restaurant-tea",
        type: "noun",
        darija: "أتاي",
        transliteration: "atay",
        english: "mint tea",
        image: "/assets/images/atay.svg",
        grammar: ["M", "S", "cultural staple"],
        cue: "A strong culture marker in Moroccan hospitality.",
      },
      {
        id: "restaurant-delicious",
        type: "adjective",
        darija: "بنين",
        transliteration: "bnin",
        english: "delicious",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["M.S", "F.S: bnina", "plural: bninine"],
        cue: "Say it when complimenting the food.",
      },
      {
        id: "restaurant-hot",
        type: "adjective",
        darija: "سخون",
        transliteration: "skhun",
        english: "hot",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["M.S", "F.S: skhuna", "plural: skhan"],
        cue: "Useful for soup, tea, or tajine.",
      },
      {
        id: "restaurant-ready",
        type: "adjective",
        darija: "واجد",
        transliteration: "wajed",
        english: "ready",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["M.S", "F.S: wajda", "plural: wajdin"],
        cue: "Great for checking if your order is ready.",
      },
      {
        id: "restaurant-want",
        type: "verb",
        darija: "بغيت",
        transliteration: "bghit",
        english: "I want",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["verb", "first person", "polite request starter"],
        cue: "Most common entry phrase for ordering.",
      },
      {
        id: "restaurant-bring",
        type: "verb",
        darija: "جيب",
        transliteration: "jib",
        english: "bring",
        image: "/assets/genie-chat/restaurant.jpg",
        grammar: ["imperative", "plural: jibou", "irregular usage"],
        cue: "Use with care: soften with please for politeness.",
      },
    ],
  },
  shopping: {
    family: "shopping",
    title: "Shopping",
    subtitle: "Souk essentials before bargaining",
    image: "/assets/scenarios/shopping.jpg",
    accentColor: "#0f766e",
    words: [
      {
        id: "shopping-price",
        type: "noun",
        darija: "الثمن",
        transliteration: "ttaman",
        english: "price",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M", "S", "plural: tamanat"],
        cue: "Key noun for every negotiation.",
      },
      {
        id: "shopping-market",
        type: "noun",
        darija: "السوق",
        transliteration: "ssouq",
        english: "market",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M", "S", "plural: l-aswaq"],
        cue: "Refers to both souk areas and local markets.",
      },
      {
        id: "shopping-bag",
        type: "noun",
        darija: "الشكارة",
        transliteration: "shkara",
        english: "bag",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["F", "S", "plural: shkayer"],
        cue: "Useful when buying multiple items.",
      },
      {
        id: "shopping-size",
        type: "noun",
        darija: "المقاس",
        transliteration: "lme9yas",
        english: "size",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M", "S", "plural: me9yasat"],
        cue: "Important for clothes and shoes.",
      },
      {
        id: "shopping-color",
        type: "noun",
        darija: "اللون",
        transliteration: "llawn",
        english: "color",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M", "S", "plural: lwan"],
        cue: "Great for specifying preferences quickly.",
      },
      {
        id: "shopping-cheap",
        type: "adjective",
        darija: "رخيص",
        transliteration: "rkhis",
        english: "cheap",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M.S", "F.S: rkhisa", "plural: rkhass"],
        cue: "Core adjective in bargaining conversations.",
      },
      {
        id: "shopping-expensive",
        type: "adjective",
        darija: "غالي",
        transliteration: "ghali",
        english: "expensive",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M.S", "F.S: ghalia", "plural: ghalyin"],
        cue: "Useful to push the seller toward a better offer.",
      },
      {
        id: "shopping-beautiful",
        type: "adjective",
        darija: "زوين",
        transliteration: "zwin",
        english: "beautiful / nice",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["M.S", "F.S: zwina", "plural: zwinin"],
        cue: "Common compliment before asking for discount.",
      },
      {
        id: "shopping-buy",
        type: "verb",
        darija: "نشري",
        transliteration: "nshri",
        english: "I buy / to buy",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["verb", "present", "first person"],
        cue: "Core verb to state purchase intent.",
      },
      {
        id: "shopping-reduce",
        type: "verb",
        darija: "نقص",
        transliteration: "n9es",
        english: "reduce",
        image: "/assets/scenarios/shopping.jpg",
        grammar: ["imperative", "polite bargaining", "irregular tone"],
        cue: "Use to ask for a lower price respectfully.",
      },
    ],
  },
}

export function getScenarioProfile(scenarioId: string): ScenarioProfile {
  return scenarioProfiles[getScenarioFamily(scenarioId)]
}
