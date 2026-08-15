import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, envelopes, envelopeMonths } from "@/lib/db/schema";

export type PointMensuel = { mois: string; budget: number; depense: number };

/** Évolution budgété vs dépensé (postes de dépense) sur tous les mois. */
export async function getEvolutionMensuelle(
  limite = 12,
): Promise<PointMensuel[]> {
  const rows = await db
    .select({
      mois: envelopeMonths.month,
      budget: sql<string>`coalesce(sum(${envelopeMonths.budget}), 0)`,
      depense: sql<string>`coalesce(sum(${envelopeMonths.spent}), 0)`,
    })
    .from(envelopeMonths)
    .innerJoin(envelopes, eq(envelopes.id, envelopeMonths.envelopeId))
    .where(eq(envelopes.kind, "expense"))
    .groupBy(envelopeMonths.month)
    .orderBy(asc(envelopeMonths.month));

  return rows
    .slice(-limite)
    .map((r) => ({
      mois: r.mois,
      budget: Number(r.budget),
      depense: Number(r.depense),
    }));
}

export type Part = { nom: string; couleur: string; valeur: number };

/** Répartition des dépenses par compte pour un mois. */
export async function getRepartitionParCompte(mois: string): Promise<Part[]> {
  const rows = await db
    .select({
      nom: accounts.name,
      couleur: accounts.color,
      ordre: accounts.sortOrder,
      depense: sql<string>`coalesce(sum(${envelopeMonths.spent}), 0)`,
    })
    .from(envelopeMonths)
    .innerJoin(envelopes, eq(envelopes.id, envelopeMonths.envelopeId))
    .innerJoin(accounts, eq(accounts.id, envelopes.accountId))
    .where(and(eq(envelopeMonths.month, mois), eq(envelopes.kind, "expense")))
    .groupBy(accounts.name, accounts.color, accounts.sortOrder)
    .orderBy(asc(accounts.sortOrder));

  return rows
    .map((r) => ({ nom: r.nom, couleur: r.couleur, valeur: Number(r.depense) }))
    .filter((p) => p.valeur > 0);
}

/** Top des postes par dépense pour un mois. */
export async function getTopPostes(mois: string, limite = 8): Promise<Part[]> {
  const rows = await db
    .select({
      nom: envelopes.name,
      couleur: accounts.color,
      depense: sql<string>`coalesce(sum(${envelopeMonths.spent}), 0)`,
    })
    .from(envelopeMonths)
    .innerJoin(envelopes, eq(envelopes.id, envelopeMonths.envelopeId))
    .innerJoin(accounts, eq(accounts.id, envelopes.accountId))
    .where(and(eq(envelopeMonths.month, mois), eq(envelopes.kind, "expense")))
    .groupBy(envelopes.name, accounts.color)
    .orderBy(desc(sql`sum(${envelopeMonths.spent})`))
    .limit(limite);

  return rows
    .map((r) => ({ nom: r.nom, couleur: r.couleur, valeur: Number(r.depense) }))
    .filter((p) => p.valeur > 0);
}
