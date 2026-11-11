import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config.
 * Reads DATABASE_URL from apps/web/.env.local so `pnpm db:generate`,
 * `db:push` and `db:migrate` work without exporting env vars manually.
 */
function loadEnvLocal() {
  const path = fileURLToPath(new URL("./.env.local", import.meta.url));
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    const key = match?.[1];
    if (key && !(key in process.env)) {
      process.env[key] = (match?.[2] ?? "").replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvLocal();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
