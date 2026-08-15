"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { envelopeMonths } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { decalerMois } from "@/lib/mois";

/** Copie les budgets du mois précédent vers `mois` (dépensé inchangé). */
export async function copierBudgetsMoisPrecedent(mois: string): Promise<void> {
  await requireSession();
  const precedent = decalerMois(mois, -1);
  const rows = await db
    .select({
      envelopeId: envelopeMonths.envelopeId,
      budget: envelopeMonths.budget,
    })
    .from(envelopeMonths)
    .where(eq(envelopeMonths.month, precedent));

  for (const r of rows) {
    await db
      .insert(envelopeMonths)
      .values({ envelopeId: r.envelopeId, month: mois, budget: r.budget })
      .onConflictDoUpdate({
        target: [envelopeMonths.envelopeId, envelopeMonths.month],
        set: { budget: r.budget },
      });
  }
  revalidatePath("/");
}

/** Reporte le reste de chaque poste de `mois` vers le report du mois suivant. */
export async function reporterRestes(mois: string): Promise<void> {
  await requireSession();
  const suivant = decalerMois(mois, 1);
  const rows = await db
    .select()
    .from(envelopeMonths)
    .where(eq(envelopeMonths.month, mois));

  for (const r of rows) {
    const reste = Number(r.budget) + Number(r.carryover) - Number(r.spent);
    const v = reste.toFixed(2);
    await db
      .insert(envelopeMonths)
      .values({ envelopeId: r.envelopeId, month: suivant, carryover: v })
      .onConflictDoUpdate({
        target: [envelopeMonths.envelopeId, envelopeMonths.month],
        set: { carryover: v },
      });
  }
  revalidatePath("/");
}
