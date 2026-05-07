import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Booking flow requires Neon Postgres in production. Set DATABASE_URL in Vercel env or .env.local.",
    );
  }
  const client = neon(url);
  _db = drizzle({ client, schema });
  return _db;
}

export { schema };
