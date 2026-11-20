import { asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { valueItems, valuePools } from "@/db/schema";

/**
 * Builds the "value bank" section of the GenieChat system prompt from Postgres.
 *
 * The bank is the authoritative list of forms the model may use for each slot.
 * It is read from `value_pools` / `value_items`, cached briefly per scenario,
 * and degrades to `null` (static prompt only) when the database is unavailable
 * — e.g. during `next build` or when `DATABASE_URL` is missing.
 */

const CACHE_TTL_MS = 60_000;

type CacheEntry = { value: string | null; expiresAt: number };

const cache = new Map<string, CacheEntry>();

/** Pools small enough that showing every variant is worth the tokens. */
const SHOW_ALL_FORMS_MAX_ITEMS = 5;

type Pool = typeof valuePools.$inferSelect;
type Item = typeof valueItems.$inferSelect;

function normalizeKnownTypos(form: string): string {
  return form
    .replace("ب لاكارط", "بالاكارط")
    .replace("ب ليسپيس", "باليسپيس")
}

function formatPool(pool: Pool, items: Item[]): string | null {
  if (items.length === 0) return null;

  if (pool.slot === "guest_question") {
    const lines = items.map((item) => `- ${item.canonical}`);
    return [
      "GUEST QUESTIONS",
      "Answer these from the facts below. Write the Darija yourself; never invent facts.",
      ...lines,
    ].join("\n");
  }

  if (pool.slot === "wait_time") {
    const lines = items.map((item) => `- ${item.canonical}`);
    return [
      "WAIT TIMES",
      "State these in Darija yourself; do not ask about them.",
      ...lines,
    ].join("\n");
  }

  const showAllForms = items.length <= SHOW_ALL_FORMS_MAX_ITEMS;
  const forms = items.map((item) => {
    const values = showAllForms ? item.forms : [item.canonical]
    return values.map(normalizeKnownTypos).join(" / ")
  });

  return `${pool.label} (${pool.slot}): ${forms.join(" | ")}`;
}

export function formatValueBankPrompt(pools: Pool[], items: Item[]): string {
  const byPool = new Map<string, Item[]>();
  for (const item of items) {
    const group = byPool.get(item.poolId);
    if (group) group.push(item);
    else byPool.set(item.poolId, [item]);
  }

  const sections: string[] = [];
  for (const pool of pools) {
    const section = formatPool(pool, byPool.get(pool.id) ?? []);
    if (section) sections.push(section);
  }

  if (sections.length === 0) return "";

  return [
    "VALUE BANK (authoritative, loaded from the restaurant database)",
    "When you fill a slot, use ONLY the values below and copy the Darija exactly.",
    "If the guest asks for something that is not listed, say you do not have it",
    "and offer a listed alternative as a statement.",
    "",
    ...sections,
  ].join("\n");
}

async function readBank(scenarioSlug: string): Promise<string | null> {
  const db = getDb();

  const pools = await db
    .select()
    .from(valuePools)
    .where(eq(valuePools.scenarioSlug, scenarioSlug))
    .orderBy(asc(valuePools.sortOrder));

  if (pools.length === 0) return null;

  const items = await db
    .select()
    .from(valueItems)
    .where(
      inArray(
        valueItems.poolId,
        pools.map((pool) => pool.id),
      ),
    )
    .orderBy(asc(valueItems.sortOrder));

  const prompt = formatValueBankPrompt(pools, items);
  return prompt || null;
}

export async function loadValueBankPrompt(
  scenarioSlug: string,
): Promise<string | null> {
  const cached = cache.get(scenarioSlug);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  let value: string | null = null;
  try {
    value = await readBank(scenarioSlug);
  } catch (error) {
    // A missing database must not break the chat; the static prompt still works.
    console.warn(
      `[value-bank] could not load "${scenarioSlug}":`,
      error instanceof Error ? error.message : error,
    );
  }

  cache.set(scenarioSlug, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/** Exposed for scripts/tests: drop the in-process cache. */
export function clearValueBankCache(): void {
  cache.clear();
}
