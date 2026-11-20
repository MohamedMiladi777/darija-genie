#!/usr/bin/env node
/**
 * Upsert a value-bank snapshot into Postgres.
 *
 *   cd apps/web && node scripts/seed-value-bank.mjs
 *   cd apps/web && node scripts/seed-value-bank.mjs --file ../../content/value-bank/restaurant-v2.json
 *
 * The snapshot is produced by `pnpm content:import` at the repo root. This
 * script is idempotent: pools and items are matched on their natural keys, and
 * anything missing from the snapshot is removed (items cascade with pools), so
 * the database mirrors the reviewed JSON exactly.
 *
 * Run `pnpm db:migrate` first.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import postgres from "postgres";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    for (const line of readFileSync(path.join(appDir, ".env.local"), "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      const key = match?.[1];
      if (key && !(key in process.env)) {
        process.env[key] = (match?.[2] ?? "").replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // no .env.local — fall back to process.env
  }
}

function parseArgs(argv) {
  const options = {
    file: path.resolve(appDir, "../../content/value-bank/restaurant-v2.json"),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--file") {
      const value = argv[i + 1];
      if (!value) throw new Error("--file needs a path");
      options.file = path.resolve(value);
      i += 1;
    }
  }
  return options;
}

loadEnvLocal();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL is not set.\n   Add your Neon connection string to apps/web/.env.local",
  );
  process.exit(1);
}

const options = parseArgs(process.argv.slice(2));

let snapshot;
try {
  snapshot = JSON.parse(readFileSync(options.file, "utf8"));
} catch (error) {
  console.error(`❌ Cannot read snapshot ${options.file}: ${error.message}`);
  process.exit(1);
}

for (const field of ["scenario", "pools", "items"]) {
  if (!(field in snapshot)) {
    console.error(`❌ Snapshot is missing "${field}".`);
    process.exit(1);
  }
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 2 });

try {
  const summary = await sql.begin(async (tx) => {
    const poolIds = new Map();

    for (const pool of snapshot.pools) {
      const [row] = await tx`
        insert into value_pools (scenario_slug, key, slot, label, sort_order)
        values (${snapshot.scenario}, ${pool.key}, ${pool.slot}, ${pool.label}, ${pool.sortOrder ?? 0})
        on conflict (scenario_slug, key) do update set
          slot = excluded.slot,
          label = excluded.label,
          sort_order = excluded.sort_order
        returning id`;
      poolIds.set(pool.key, row.id);
    }

    // Pools removed from the workbook (items cascade).
    const poolKeys = snapshot.pools.map((pool) => pool.key);
    await tx`
      delete from value_pools
      where scenario_slug = ${snapshot.scenario}
        and not (key = any(${poolKeys}))`;

    let inserted = 0;
    for (const item of snapshot.items) {
      const poolId = poolIds.get(item.pool);
      if (!poolId) {
        throw new Error(
          `Item "${item.itemKey}" references unknown pool "${item.pool}".`,
        );
      }

      await tx`
        insert into value_items (
          pool_id, item_key, category, kind, canonical, forms,
          english, transliteration, sort_order
        )
        values (
          ${poolId}, ${item.itemKey}, ${item.category ?? null}, ${item.kind},
          ${item.canonical}, ${item.forms},
          ${item.english ?? null}, ${item.transliteration ?? null}, ${item.sortOrder ?? 0}
        )
        on conflict (pool_id, item_key) do update set
          category = excluded.category,
          kind = excluded.kind,
          canonical = excluded.canonical,
          forms = excluded.forms,
          english = excluded.english,
          transliteration = excluded.transliteration,
          sort_order = excluded.sort_order`;
      inserted += 1;
    }

    // Items removed from the workbook, per pool.
    for (const [poolKey, poolId] of poolIds) {
      const itemKeys = snapshot.items
        .filter((item) => item.pool === poolKey)
        .map((item) => item.itemKey);
      if (itemKeys.length === 0) {
        await tx`delete from value_items where pool_id = ${poolId}`;
      } else {
        await tx`
          delete from value_items
          where pool_id = ${poolId}
            and not (item_key = any(${itemKeys}))`;
      }
    }

    const [{ count: poolCount }] =
      await tx`select count(*)::int as count from value_pools where scenario_slug = ${snapshot.scenario}`;
    const [{ count: itemCount }] = await tx`
      select count(*)::int as count
      from value_items i
      join value_pools p on p.id = i.pool_id
      where p.scenario_slug = ${snapshot.scenario}`;

    return { inserted, poolCount, itemCount };
  });

  console.log(`Snapshot: ${options.file}`);
  console.log(
    `Upserted ${summary.inserted} item(s) across ${summary.poolCount} pool(s).`,
  );
  console.log(
    `Database now holds ${summary.itemCount} item(s) for "${snapshot.scenario}".`,
  );
} catch (error) {
  console.error(`❌ Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
