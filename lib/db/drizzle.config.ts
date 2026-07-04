import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Only introspect / push our custom schemas.
  // Without this, drizzle-kit will also diff against public/supabase/auth schemas
  // and generate spurious migrations or fail on tables it doesn't own.
  schemaFilter: ["private", "api"],
});
