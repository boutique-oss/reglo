"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { envelopes, envelopeMonths } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { moisCourant } from "@/lib/mois";

function normaliser(valeur: number): string {
  const n = Number.isFinite(valeur) ? Math.max(0, valeur) : 0;
  return n.toFixed(2);
}

/** Définit le budget ou le dépensé d'un poste pour un mois (upsert). */
export async function definirMontant(
  envelopeId: string,
  mois: string,
  champ: "budget" | "spent",
  valeur: number,
): Promise<void> {
  await requireSession();
  const v = normaliser(valeur);
  const set = champ === "budget" ? { budget: v } : { spent: v };
  await db
    .insert(envelopeMonths)
    .values({ envelopeId, month: mois, ...set })
    .onConflictDoUpdate({
      target: [envelopeMonths.envelopeId, envelopeMonths.month],
      set,
    });
  revalidatePath("/");
}

/** Ajoute un poste (enveloppe) à un compte, avec son budget du mois courant. */
export async function ajouterPoste(
  accountId: string,
  nom: string,
  budget: number,
): Promise<void> {
  await requireSession();
  const nomPropre = nom.trim();
  if (!nomPropre) return;
  const [env] = await db
    .insert(envelopes)
    .values({ accountId, name: nomPropre, kind: "expense", sortOrder: 50 })
    .returning();
  await db.insert(envelopeMonths).values({
    envelopeId: env.id,
    month: moisCourant(),
    budget: normaliser(budget),
    spent: "0.00",
  });
  revalidatePath("/");
}

/** Renomme un poste. */
export async function renommerPoste(
  envelopeId: string,
  nom: string,
): Promise<void> {
  await requireSession();
  const nomPropre = nom.trim();
  if (!nomPropre) return;
  await db
    .update(envelopes)
    .set({ name: nomPropre })
    .where(eq(envelopes.id, envelopeId));
  revalidatePath("/");
}

/** Supprime un poste et tout son historique (cascade). */
export async function supprimerPoste(envelopeId: string): Promise<void> {
  await requireSession();
  await db.delete(envelopes).where(eq(envelopes.id, envelopeId));
  revalidatePath("/");
}
