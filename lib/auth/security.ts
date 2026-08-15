import { count, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { securityEvents } from "@/lib/db/schema";
import { user } from "@/lib/db/auth-schema";

/** Nombre maximum de comptes autorisés dans le foyer. */
export const MAX_UTILISATEURS = 2;

/** Nombre de comptes existants. */
export async function nombreUtilisateurs(): Promise<number> {
  const [row] = await db.select({ c: count() }).from(user);
  return Number(row?.c ?? 0);
}

/** Enregistre une tentative bloquée (affichée dans la note de sécurité). */
export async function enregistrerEvenement(
  email: string | null,
  reason: string,
): Promise<void> {
  try {
    await db.insert(securityEvents).values({ email, reason });
  } catch (e) {
    console.error("Impossible d'enregistrer l'événement de sécurité :", e);
  }
}

/** Derniers événements de sécurité (pour l'affichage dans Réglages). */
export async function derniersEvenements(limite = 10) {
  return db
    .select()
    .from(securityEvents)
    .orderBy(desc(securityEvents.createdAt))
    .limit(limite);
}
