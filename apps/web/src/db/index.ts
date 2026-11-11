import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Postgres (Neon) access for the web app.
 *
 * The client is created lazily and reused across requests in a module-scope
 * singleton so hot reloads and serverless invocations don't open a new
 * connection pool every time. `prepare: false` is required for Neon's pooled
 * connection string (PgBouncer transaction mode).
 */

let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to apps/web/.env.local (see .env.example).",
    );
  }
  if (!db) {
    client = postgres(url, { prepare: false, max: 10 });
    db = drizzle(client, { schema });
  }
  return db;
}

export type AppDb = ReturnType<typeof getDb>;

/** Test the connection and close. Intended for scripts/verification, not request paths. */
export async function withDb<T>(fn: (db: AppDb) => Promise<T>): Promise<T> {
  const database = getDb();
  try {
    return await fn(database);
  } finally {
    await client?.end({ timeout: 5 });
  }
}

export { schema };
