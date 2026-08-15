import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { envelopes, envelopeMonths } from "@/lib/db/schema";

export type ProjetVue = {
  envelopeId: string;
  nom: string;
  cumule: number;
  objectif: number;
  progression: number; // 0..1
};

/**
 * Projets d'épargne : enveloppes kind='savings'. Le montant cumulé est la
 * somme du « mis de côté » (spent) sur tous les mois.
 */
export async function getProjets(): Promise<ProjetVue[]> {
  const projets = await db
    .select()
    .from(envelopes)
    .where(and(eq(envelopes.kind, "savings"), eq(envelopes.archived, false)))
    .orderBy(asc(envelopes.sortOrder));

  if (projets.length === 0) return [];

  const ids = projets.map((p) => p.id);
  const months = await db
    .select({
      envelopeId: envelopeMonths.envelopeId,
      spent: envelopeMonths.spent,
    })
    .from(envelopeMonths)
    .where(inArray(envelopeMonths.envelopeId, ids));

  const cumul = new Map<string, number>();
  for (const m of months) {
    cumul.set(m.envelopeId, (cumul.get(m.envelopeId) ?? 0) + Number(m.spent));
  }

  return projets.map((p) => {
    const cumule = cumul.get(p.id) ?? 0;
    const objectif = p.target != null ? Number(p.target) : 0;
    return {
      envelopeId: p.id,
      nom: p.name,
      cumule,
      objectif,
      progression: objectif > 0 ? Math.min(1, cumule / objectif) : 0,
    };
  });
}
