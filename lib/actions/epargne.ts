"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { accounts, envelopes, envelopeMonths } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { moisCourant } from "@/lib/mois";

function normaliser(valeur: number): string {
  return (Number.isFinite(valeur) ? Math.max(0, valeur) : 0).toFixed(2);
}

/** Crée un projet d'épargne (enveloppe savings) sur le compte commun. */
export async function ajouterProjet(
  nom: string,
  objectif: number,
): Promise<void> {
  await requireSession();
  const nomPropre = nom.trim();
  if (!nomPropre) return;
  const [commun] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.slug, "commun"));
  if (!commun) return;
  await db.insert(envelopes).values({
    accountId: commun.id,
    name: nomPropre,
    kind: "savings",
    target: normaliser(objectif),
    sortOrder: 100,
  });
  revalidatePath("/epargne");
}

/** Modifie l'objectif d'un projet. */
export async function definirObjectif(
  envelopeId: string,
  montant: number,
): Promise<void> {
  await requireSession();
  await db
    .update(envelopes)
    .set({ target: normaliser(montant) })
    .where(eq(envelopes.id, envelopeId));
  revalidatePath("/epargne");
}

/** Ajoute un montant au cumulé d'un projet (mis de côté du mois courant). */
export async function ajouterAuProjet(
  envelopeId: string,
  montant: number,
): Promise<void> {
  await requireSession();
  const ajout = Math.max(0, Number.isFinite(montant) ? montant : 0);
  if (ajout === 0) return;
  const mois = moisCourant();
  const [existant] = await db
    .select({ spent: envelopeMonths.spent })
    .from(envelopeMonths)
    .where(
      and(
        eq(envelopeMonths.envelopeId, envelopeId),
        eq(envelopeMonths.month, mois),
      ),
    );
  const nouveau = ((existant ? Number(existant.spent) : 0) + ajout).toFixed(2);
  await db
    .insert(envelopeMonths)
    .values({ envelopeId, month: mois, spent: nouveau })
    .onConflictDoUpdate({
      target: [envelopeMonths.envelopeId, envelopeMonths.month],
      set: { spent: nouveau },
    });
  revalidatePath("/epargne");
}
