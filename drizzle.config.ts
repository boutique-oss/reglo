import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Charge en priorité .env.local (secrets locaux), puis .env en repli.
config({ path: ".env.local" });
config();

// Les migrations utilisent la connexion directe (non-poolée).
const url =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
