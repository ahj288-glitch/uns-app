import { pgSchema } from "drizzle-orm/pg-core";

/**
 * private — never exposed to Supabase PostgREST / Data API.
 * All personal, emotional, and auth-critical tables live here.
 * Only the Express backend (service_role via DATABASE_URL) can reach these.
 */
export const privateSchema = pgSchema("private");

/**
 * api — optionally exposed to Supabase PostgREST for read-only catalog data.
 * Contains no personal data. RLS enforces SELECT-only for anon/authenticated.
 * To expose: Supabase Dashboard → Settings → API → Extra schemas → add "api"
 */
export const apiSchema = pgSchema("api");
