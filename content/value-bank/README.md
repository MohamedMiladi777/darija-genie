# Value banks

Authoring source for the dialogue slots each scenario can use. A value bank is
a spreadsheet that lists, per slot, the Darija forms a speaker may use.

## Files

| File | Role |
| --- | --- |
| `restaurant-v2.xlsx` | **Source of truth.** Edited by the content author. |
| `restaurant-v2.json` | Generated snapshot. Reviewable diff, consumed by code and imports. |

Never edit the JSON by hand — it is regenerated from the workbook.

## Regenerate

```sh
pnpm content:import
```

Optional overrides:

```sh
node scripts/import-value-bank.mjs \
  --in content/value-bank/restaurant-v2.xlsx \
  --out content/value-bank/restaurant-v2.json \
  --scenario restaurant
```

The script is read-only for the database: it validates and normalises rows and
writes the JSON snapshot.

## Apply to Postgres

Review the JSON diff first, then:

```sh
cd apps/web
pnpm db:migrate          # only when the schema changed
pnpm db:seed:value-bank  # upsert the snapshot
```

The seed is idempotent. It matches pools on `(scenario_slug, key)` and items on
`(pool_id, item_key)`, updates the rest, and deletes rows that no longer exist
in the snapshot — so the database mirrors the reviewed JSON exactly.

`english` and `transliteration` are nullable. When the workbook gains those
columns, re-run both commands and they fill in.

## Workbook format

One sheet, four columns, header row required:

| Column | Meaning |
| --- | --- |
| `pool (slot)` | Pool name plus the dialogue slot it feeds, e.g. `mains (dish)` |
| `item id` | Stable snake_case key, unique within the pool |
| `category` | Display grouping, e.g. `tajines` |
| `Darija forms` | One form per line. **The first line is canonical.** |

Rows whose `item id` starts with `(` are authoring notes and are skipped.

## Kinds

| Kind | Slots | Meaning |
| --- | --- | --- |
| `vocab` | starter, dish, dessert, drink, guest_name, seating, diet, special_requests, payment, split_bill | Literal Darija forms |
| `instruction` | wait_time | Staff behaviour; the model writes the Darija |
| `intent` | guest_question | A customer question plus its answer; the model writes the Darija |

## Validation

The importer fails (exit 1, no output written) on unknown slots, malformed item
ids, duplicate ids within a pool, or rows without forms.

It warns, but still writes, on:

- vocab entries with no Arabic script
- a stray separated Arabic letter (e.g. `ب لاكارط` — probably `بالاكارط`)
- intent/instruction text that references an item id that does not exist
