"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contributions, incomes } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";

function normaliser(valeur: number): string {
  return (Number.isFinite(valeur) ? Math.max(0, valeur) : 0).toFixed(2);
}

/** Définit le revenu d'une personne pour un mois (sert au prorata). */
export async function definirRevenu(
  profileId: string,
  mois: string,
  montant: number,
): Promise<void> {
  await requireSession();
  const amount = normaliser(montant);
  await db
    .insert(incomes)
    .values({ profileId, month: mois, amount })
    .onConflictDoUpdate({
      target: [incomes.profileId, incomes.month],
      set: { amount },
    });
  revalidatePath("/commun");
  revalidatePath("/reglages");
}

/** Définit la contribution d'une personne au compte commun pour un mois. */
export async function definirContribution(
  profileId: string,
  mois: string,
  montant: number,
): Promise<void> {
  await requireSession();
  await db
    .delete(contributions)
    .where(
      and(
        eq(contributions.profileId, profileId),
        eq(contributions.month, mois),
      ),
    );
  const amount = normaliser(montant);
  if (Number(amount) > 0) {
    await db.insert(contributions).values({ profileId, month: mois, amount });
  }
  revalidatePath("/commun");
}
