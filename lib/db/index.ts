import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as appSchema from "./schema";
import * as authSchema from "./auth-schema";

// Schéma applicatif + tables d'auth (Better Auth) réunis pour l'adaptateur.
const schema = { ...appSchema, ...authSchema };
type Schema = typeof schema;

/**
 * Initialisation PARESSEUSE : le module peut être importé sans DATABASE_URL
 * (analyse au build), la connexion n'est créée qu'à la première requête réelle.
 * L'erreur "DATABASE_URL manquant" ne survient donc qu'à l'exécution, pas au build.
 */
let _db: NeonHttpDatabase<Schema> | null = null;

function initDb(): NeonHttpDatabase<Schema> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL manquant (voir .env.local / variables Vercel).",
    );
  }
  const sql: NeonQueryFunction<false, false> = neon(url);
  return drizzle(sql, { schema });
}

export const db = new Proxy({} as NeonHttpDatabase<Schema>, {
  get(_target, prop, receiver) {
    if (!_db) _db = initDb();
    return Reflect.get(_db, prop, receiver);
  },
});

export { schema };
