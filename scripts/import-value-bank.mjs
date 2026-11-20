#!/usr/bin/env node
/**
 * Convert a Darija Genie "value bank" workbook into a reviewable JSON snapshot.
 *
 * The workbook is the authoring surface (Excel / LibreOffice). This script is
 * the deterministic bridge: it validates, classifies and normalises the rows so
 * the result can be reviewed in a diff before anything is written to Postgres.
 *
 * It does NOT touch the database and does NOT write Drizzle migrations.
 *
 * Usage:
 *   node scripts/import-value-bank.mjs
 *   node scripts/import-value-bank.mjs --in path/to/bank.xlsx --out content/value-bank/restaurant-v2.json
 *
 * Exit codes:
 *   0  snapshot written (warnings may still be present)
 *   1  validation failed, nothing written
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import process from "node:process";

import ExcelJS from "exceljs";

/** Slots the dialogue system knows about. Anything else is a content bug. */
const KNOWN_SLOTS = new Set([
  "starter",
  "dish",
  "dessert",
  "drink",
  "guest_name",
  "seating",
  "diet",
  "special_requests",
  "wait_time",
  "guest_question",
  "payment",
  "split_bill",
]);

/**
 * Slots whose text is authored by the generator, not fixed Darija.
 * `instruction` = staff behaviour, `intent` = a customer question + its answer.
 */
const KIND_BY_SLOT = {
  wait_time: "instruction",
  guest_question: "intent",
};

const POOL_LABELS = {
  starters: "Starters",
  mains: "Mains",
  desserts: "Desserts",
  drinks: "Drinks",
  guest_names: "Guest names",
  seating_options: "Seating options",
  diet_options: "Diet options",
  request_options: "Special requests",
  wait_times: "Wait times",
  guest_questions: "Guest questions",
  payment_options: "Payment options",
  split_options: "Split bill",
};

const EXPECTED_HEADER = ["pool (slot)", "item id", "category", "Darija forms"];

const ARABIC = /[\u0600-\u06FF]/;
// Standalone Arabic letters are usually a stray space (e.g. "ب لاكارط"),
// except the particles that are legitimately written as one letter.
const LEGITIMATE_SINGLE_LETTERS = new Set(["د", "و"]);

function findSeparatedLetter(form) {
  for (const match of form.matchAll(/(^|\s)([\u0600-\u06FF])(?=\s|$)/gu)) {
    if (!LEGITIMATE_SINGLE_LETTERS.has(match[2])) return match[2];
  }
  return null;
}
const ITEM_KEY = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const ITEM_REFERENCE = /\(([a-z0-9]+(?:_[a-z0-9]+)*)\)/g;

function parseArgs(argv) {
  const options = {
    input: "content/value-bank/restaurant-v2.xlsx",
    output: "content/value-bank/restaurant-v2.json",
    scenario: "restaurant",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;
      return value;
    };

    switch (arg) {
      case "--in":
        options.input = next();
        break;
      case "--out":
        options.output = next();
        break;
      case "--scenario":
        options.scenario = next();
        break;
      case "--help":
      case "-h":
        console.log(
          "Usage: node scripts/import-value-bank.mjs [--in <xlsx>] [--out <json>] [--scenario <slug>]",
        );
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function cellText(cell) {
  return String(cell?.text ?? "").replace(/\r\n?/g, "\n").trim();
}

/** "mains (dish)" -> { key: "mains", slot: "dish" } */
function parsePool(raw) {
  const match = /^(.+?)\s*\(([^)]+)\)\s*$/.exec(raw);
  if (!match) return null;
  return { key: match[1].trim(), slot: match[2].trim() };
}

function splitForms(raw) {
  const seen = new Set();
  const forms = [];
  for (const line of raw.split("\n")) {
    const form = line.trim();
    if (!form || seen.has(form)) continue;
    seen.add(form);
    forms.push(form);
  }
  return forms;
}

function readSheet(workbook) {
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("Workbook has no worksheets.");

  const headerCells = [];
  for (let column = 1; column <= 6; column += 1) {
    headerCells.push(cellText(worksheet.getRow(1).getCell(column)).toLowerCase());
  }

  const expected = EXPECTED_HEADER.map((value) => value.toLowerCase());
  if (headerCells.slice(0, 4).join("|") !== expected.join("|")) {
    throw new Error(
      `Unexpected header. Expected ${JSON.stringify(EXPECTED_HEADER)}, got ${JSON.stringify(headerCells.slice(0, 4))}.`,
    );
  }

  // Optional authoring columns; absent today, filled in later.
  const columnOf = (name) => {
    const index = headerCells.indexOf(name);
    return index === -1 ? null : index + 1;
  };
  const englishColumn = columnOf("english");
  const transliterationColumn = columnOf("transliteration");

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    rows.push({
      rowNumber,
      poolRaw: cellText(row.getCell(1)),
      itemKey: cellText(row.getCell(2)),
      category: cellText(row.getCell(3)),
      formsRaw: cellText(row.getCell(4)),
      english: englishColumn ? cellText(row.getCell(englishColumn)) : "",
      transliteration: transliterationColumn
        ? cellText(row.getCell(transliterationColumn))
        : "",
    });
  });

  return rows;
}

function buildSnapshot(rows, options, sourceHash) {
  const errors = [];
  const warnings = [];
  const notes = [];

  const pools = new Map();
  const items = [];
  const seenKeys = new Set();

  for (const row of rows) {
    // Authoring notes live in the item-id column and are not content.
    if (!row.itemKey || row.itemKey.startsWith("(")) {
      notes.push({ row: row.rowNumber, text: row.formsRaw || row.itemKey });
      continue;
    }

    const pool = parsePool(row.poolRaw);
    if (!pool) {
      errors.push(`Row ${row.rowNumber}: cannot parse pool "${row.poolRaw}".`);
      continue;
    }
    if (!KNOWN_SLOTS.has(pool.slot)) {
      errors.push(
        `Row ${row.rowNumber}: unknown slot "${pool.slot}" (pool "${pool.key}").`,
      );
      continue;
    }
    if (!ITEM_KEY.test(row.itemKey)) {
      errors.push(
        `Row ${row.rowNumber}: invalid item id "${row.itemKey}" (expected snake_case).`,
      );
      continue;
    }
    if (seenKeys.has(`${pool.key}:${row.itemKey}`)) {
      errors.push(
        `Row ${row.rowNumber}: duplicate item "${row.itemKey}" in pool "${pool.key}".`,
      );
      continue;
    }

    const forms = splitForms(row.formsRaw);
    if (forms.length === 0) {
      errors.push(`Row ${row.rowNumber}: "${row.itemKey}" has no Darija forms.`);
      continue;
    }

    seenKeys.add(`${pool.key}:${row.itemKey}`);

    const kind = KIND_BY_SLOT[pool.slot] ?? "vocab";

    if (kind === "vocab" && !ARABIC.test(forms[0])) {
      warnings.push(
        `Row ${row.rowNumber}: "${row.itemKey}" is marked vocab but has no Arabic script.`,
      );
    }
    for (const form of forms) {
      const letter = findSeparatedLetter(form);
      if (letter) {
        warnings.push(
          `Row ${row.rowNumber}: "${row.itemKey}" form "${form}" has a separated "${letter}" (possible stray space).`,
        );
      }
    }

    if (!pools.has(pool.key)) {
      pools.set(pool.key, {
        key: pool.key,
        slot: pool.slot,
        label: POOL_LABELS[pool.key] ?? pool.key,
        sortOrder: pools.size,
        categories: [],
      });
    }
    const poolEntry = pools.get(pool.key);
    if (row.category && !poolEntry.categories.includes(row.category)) {
      poolEntry.categories.push(row.category);
    }

    items.push({
      pool: pool.key,
      itemKey: row.itemKey,
      category: row.category || null,
      kind,
      canonical: forms[0],
      forms,
      ...(row.english ? { english: row.english } : {}),
      ...(row.transliteration ? { transliteration: row.transliteration } : {}),
      sortOrder: items.length,
    });
  }

  // Cross-reference ids quoted inside intent/instruction text. References can
  // point at any pool (a guest question quotes a dish id), so match globally.
  const allItemKeys = new Set(items.map((item) => item.itemKey));
  for (const item of items) {
    if (item.kind === "vocab") continue;
    for (const match of item.forms.join("\n").matchAll(ITEM_REFERENCE)) {
      if (!allItemKeys.has(match[1])) {
        warnings.push(
          `"${item.itemKey}" references unknown item id "${match[1]}".`,
        );
      }
    }
  }

  return {
    errors,
    warnings,
    notes,
    snapshot: {
      scenario: options.scenario,
      version: 2,
      source: {
        file: relative(process.cwd(), resolve(options.input)),
        sha256: sourceHash,
      },
      pools: [...pools.values()],
      items,
    },
  };
}

function printReport({ errors, warnings, notes, snapshot }, options) {
  const kindCounts = snapshot.items.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Source: ${options.input}`);
  console.log(`Output: ${options.output}`);
  console.log(
    `Pools: ${snapshot.pools.length} | Items: ${snapshot.items.length} | Kinds: ${JSON.stringify(kindCounts)}`,
  );

  for (const pool of snapshot.pools) {
    const count = snapshot.items.filter((item) => item.pool === pool.key).length;
    console.log(
      `  ${pool.key.padEnd(16)} slot=${pool.slot.padEnd(16)} items=${String(count).padStart(3)}`,
    );
  }

  if (notes.length > 0) {
    console.log(`\nSkipped ${notes.length} note row(s):`);
    for (const note of notes) {
      console.log(`  row ${note.row}: ${note.text}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const warning of warnings) console.log(`  - ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = resolve(options.input);
  const outputPath = resolve(options.output);

  const buffer = await readFile(inputPath);
  const sourceHash = createHash("sha256").update(buffer).digest("hex");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const rows = readSheet(workbook);
  const result = buildSnapshot(rows, options, sourceHash);
  printReport(result, options);

  if (result.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(result.snapshot, null, 2)}\n`,
    "utf8",
  );
  console.log(`\nWrote ${options.output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
