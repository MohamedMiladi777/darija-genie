import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import type { ScenarioId } from "@/app/(main)/learning/scenarios/scenario-data"
import { getDb } from "@/db"
import { valueItems, valuePools } from "@/db/schema"

import {
  getScenarioFamily,
  type PreviewCardWord,
  type ScenarioFamily,
  type ScenarioProfile,
  type WordType,
} from "./scenario-learning-content"
import restaurantSnapshot from "../../../../content/value-bank/restaurant-v2.json"
import shoppingSnapshot from "../../../../content/value-bank/shopping-v1.json"

type Snapshot = {
  scenario: string
  pools: Array<{ key: string; slot: string; label: string; sortOrder?: number }>
  items: Array<{
    pool: string
    itemKey: string
    category?: string | null
    kind: "vocab" | "instruction" | "intent"
    canonical: string
    forms: string[]
    english?: string
    transliteration?: string
    sortOrder?: number
  }>
}

const profileMetaByFamily: Record<
  ScenarioFamily,
  Pick<ScenarioProfile, "family" | "title" | "subtitle" | "image" | "accentColor">
> = {
  restaurant: {
    family: "restaurant",
    title: "Restaurant",
    subtitle: "Foundations before dialogue",
    image: "/assets/genie-chat/restaurant.jpg",
    accentColor: "#9a3412",
  },
  shopping: {
    family: "shopping",
    title: "Shopping",
    subtitle: "Souk essentials before bargaining",
    image: "/assets/scenarios/shopping.jpg",
    accentColor: "#0f766e",
  },
}

const fallbackProfiles: Record<ScenarioFamily, ScenarioProfile> = {
  restaurant: {
    ...profileMetaByFamily.restaurant,
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
    ...profileMetaByFamily.shopping,
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

function toWordType(value?: string | null): WordType {
  if (value === "noun" || value === "adjective" || value === "verb") return value
  return "noun"
}

function chooseImage(family: ScenarioFamily): string {
  return family === "shopping" ? "/assets/scenarios/shopping.jpg" : "/assets/genie-chat/restaurant.jpg"
}

function toProfileFromItems(
  family: ScenarioFamily,
  rows: Array<{
    itemKey: string
    category: string | null
    canonical: string
    english: string | null
    transliteration: string | null
    sortOrder: number
  }>
): ScenarioProfile | null {
  const words = rows
    .filter((row) => row.english && row.transliteration)
    .map((row) => ({
      id: `${family}-${row.itemKey}`,
      type: toWordType(row.category),
      darija: row.canonical,
      transliteration: row.transliteration!,
      english: row.english!,
      image: chooseImage(family),
      grammar: row.category ? [row.category] : [],
      cue: `Use “${row.canonical}” naturally in ${family} conversations.`,
    }))

  if (words.length === 0) return null
  return { ...profileMetaByFamily[family], words }
}

async function loadProfileFromDb(family: ScenarioFamily): Promise<ScenarioProfile | null> {
  const db = getDb()
  const pools = await db
    .select({ id: valuePools.id })
    .from(valuePools)
    .where(eq(valuePools.scenarioSlug, family))

  if (pools.length === 0) return null

  const rows = await db
    .select({
      itemKey: valueItems.itemKey,
      category: valueItems.category,
      canonical: valueItems.canonical,
      english: valueItems.english,
      transliteration: valueItems.transliteration,
      sortOrder: valueItems.sortOrder,
    })
    .from(valueItems)
    .where(
      and(
        inArray(
          valueItems.poolId,
          pools.map((pool) => pool.id)
        ),
        eq(valueItems.kind, "vocab")
      )
    )
    .orderBy(asc(valueItems.sortOrder))

  return toProfileFromItems(family, rows)
}

function loadProfileFromSnapshot(family: ScenarioFamily): ScenarioProfile | null {
  const snapshot = (family === "shopping" ? shoppingSnapshot : restaurantSnapshot) as Snapshot
  if (!snapshot) return null

  const rows = snapshot.items
    .filter((item) => item.kind === "vocab")
    .map((item, index) => ({
      itemKey: item.itemKey,
      category: item.category ?? null,
      canonical: item.canonical,
      english: item.english ?? null,
      transliteration: item.transliteration ?? null,
      sortOrder: item.sortOrder ?? index,
    }))

  return toProfileFromItems(family, rows)
}

export async function loadScenarioProfile(scenarioId: ScenarioId): Promise<ScenarioProfile> {
  const family = getScenarioFamily(scenarioId)

  try {
    const fromDb = await loadProfileFromDb(family)
    if (fromDb) return fromDb
  } catch {
    // fall through to snapshot/fallback
  }

  const fromSnapshot = loadProfileFromSnapshot(family)
  if (fromSnapshot) return fromSnapshot

  return fallbackProfiles[family]
}

function splitWords(words: PreviewCardWord[]): [PreviewCardWord[], PreviewCardWord[]] {
  if (words.length <= 2) return [words, words]
  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint), words.slice(midpoint)]
}

export async function loadUnitWordBank(): Promise<Record<ScenarioId, PreviewCardWord[]>> {
  const [restaurant, shopping] = await Promise.all([
    loadScenarioProfile("restaurant-1"),
    loadScenarioProfile("shopping-1"),
  ])

  const [restaurant1, restaurant2] = splitWords(restaurant.words)
  const [shopping1, shopping2] = splitWords(shopping.words)

  return {
    "restaurant-1": restaurant1,
    "restaurant-2": restaurant2,
    "shopping-1": shopping1,
    "shopping-2": shopping2,
  }
}
