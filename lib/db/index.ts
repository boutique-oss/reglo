import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as appSchema from "./schema";
import * as authSchema from "./auth-schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL manquant (voir .env.local / variables Vercel).");
}

// Schéma applicatif + tables d'auth (Better Auth) réunis pour l'adaptateur.
const schema = { ...appSchema, ...authSchema };

// Driver HTTP serverless Neon — idéal pour les fonctions Vercel et les scripts.
const sql = neon(url);

export const db = drizzle(sql, { schema });
export { schema };
