#!/usr/bin/env node
/**
 * End-to-end verification of the new data layer. Run after filling in
 * DATABASE_URL (and optionally AZURE_STORAGE_CONNECTION_STRING) in
 * apps/web/.env.local and running `pnpm db:migrate` from apps/web.
 *
 *   cd apps/web && node scripts/verify-db.mjs
 *
 * Steps:
 *   1. Connect to Postgres, SELECT version().
 *   2. Insert a lesson → vocabulary → example → audio_asset chain, read it
 *      back through a join, then delete it (leaves the DB clean).
 *   3. If Azure credentials are present, upload a tiny silent WAV, fetch it
 *      back over HTTPS, then delete the blob.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import postgres from "postgres";
import { BlobServiceClient } from "@azure/storage-blob";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Load .env.local the same way drizzle.config.ts does.
const envPath = path.join(appDir, ".env.local");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    const key = match?.[1];
    if (key && !(key in process.env)) {
      process.env[key] = (match?.[2] ?? "").replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // no .env.local — fall back to process.env
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set.\n   Add your Neon connection string to apps/web/.env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 2 });
let failures = 0;

function ok(label) {
  console.log(`   ✅ ${label}`);
}
function fail(label, error) {
  failures++;
  console.error(`   ❌ ${label}: ${error}`);
}

try {
  // --- 1. connectivity -------------------------------------------------------
  console.log("\n1) Postgres connectivity");
  try {
    const [{ version }] = await sql`select version() as version`;
    ok(`connected — ${version.split(",")[0]}`);
  } catch (error) {
    fail("connection", error.message);
    process.exit(1);
  }

  // --- 2. content round-trip -------------------------------------------------
  console.log("\n2) Content tables round-trip (write → join → read → delete)");
  try {
    const [lesson] = await sql`
      insert into lessons (slug, title, level, sort_order)
      values ('__verify__', 'Setup verification lesson', 'beginner', 999)
      returning id`;
    const [vocab] = await sql`
      insert into vocabulary (lesson_id, term, translation, transliteration)
      values (${lesson.id}, 'سلام', 'hello/peace', 'salam')
      returning id`;
    await sql`
      insert into examples (vocabulary_id, darija_text, translation)
      values (${vocab.id}, 'سلام، كيف داير؟', 'Hello, how are you?')`;

    const [audio] = await sql`
      insert into audio_assets (kind, container, storage_key, content_type, duration_seconds, transcript)
      values ('vocab', 'audio', '__verify__/salam.wav', 'audio/wav', 1.0, 'سلام')
      returning id`;
    await sql`
      insert into vocabulary_audio (vocabulary_id, audio_asset_id, role)
      values (${vocab.id}, ${audio.id}, 'pronunciation')`;

    const joined = await sql`
      select v.term, v.translation, a.storage_key, a.transcript, e.darija_text
      from vocabulary v
      join vocabulary_audio va on va.vocabulary_id = v.id
      join audio_assets a on a.id = va.audio_asset_id
      join examples e on e.vocabulary_id = v.id
      where v.id = ${vocab.id}`;

    if (joined.length === 1 && joined[0].storage_key === "__verify__/salam.wav") {
      ok(`join read back: ${joined[0].term} (${joined[0].darija_text}) → ${joined[0].storage_key}`);
    } else {
      fail("join", `unexpected result ${JSON.stringify(joined)}`);
    }

    await sql`delete from lessons where id = ${lesson.id}`; // cascades to the rest
    await sql`delete from audio_assets where id = ${audio.id}`;
    ok("cleanup — verification rows deleted");
  } catch (error) {
    fail("round-trip", error.message);
    console.error("      (Did you run `pnpm db:migrate` from apps/web yet?)");
  }

  // --- 3. Azure Blob round-trip (optional) ------------------------------------
  console.log("\n3) Azure Blob Storage round-trip");
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const container = process.env.AZURE_STORAGE_CONTAINER || "audio";
  if (!connectionString) {
    console.log("   ⏭️  skipped — AZURE_STORAGE_CONNECTION_STRING not set yet");
  } else {
    try {
      const service = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = service.getContainerClient(container);
      await containerClient.createIfNotExists({ access: "blob" });

      // 1 second of silence, 8 kHz mono 16-bit PCM WAV.
      const sampleRate = 8000;
      const data = Buffer.alloc(sampleRate * 2);
      const header = Buffer.alloc(44);
      header.write("RIFF", 0);
      header.writeUInt32LE(36 + data.length, 4);
      header.write("WAVE", 8);
      header.write("fmt ", 12);
      header.writeUInt32LE(16, 16);
      header.writeUInt16LE(1, 20);
      header.writeUInt16LE(1, 22);
      header.writeUInt32LE(sampleRate, 24);
      header.writeUInt32LE(sampleRate * 2, 28);
      header.writeUInt16LE(2, 32);
      header.writeUInt16LE(16, 34);
      header.write("data", 36);
      header.writeUInt32LE(data.length, 40);
      const wav = Buffer.concat([header, data]);

      const key = "__verify__/silence.wav";
      await containerClient.getBlockBlobClient(key).uploadData(wav, {
        blobHTTPHeaders: { blobContentType: "audio/wav" },
      });
      const url = `${service.url.replace(/\/$/, "")}/${container}/${key}`;
      const response = await fetch(url);
      if (response.ok && (await response.arrayBuffer()).byteLength === wav.length) {
        ok(`uploaded + fetched over HTTPS (${new URL(url).host})`);
      } else {
        fail("fetch", `HTTP ${response.status} — check container public access`);
      }
      await containerClient.getBlockBlobClient(key).deleteIfExists();
      ok("cleanup — verification blob deleted");
    } catch (error) {
      fail("blob round-trip", error.message);
    }
  }

  console.log(
    failures === 0
      ? "\n✅ All verification steps passed. The data layer is ready."
      : `\n⚠️  ${failures} step(s) failed — see the ❌ lines above.`,
  );
} finally {
  await sql.end({ timeout: 5 });
}
process.exit(failures === 0 ? 0 : 1);
