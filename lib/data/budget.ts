import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, envelopes, envelopeMonths } from "@/lib/db/schema";
import { etatBudget, type EtatBudget } from "@/lib/format";

export type PosteVue = {
  envelopeId: string;
  nom: string;
  budget: number;
  spent: number;
  carryover: number;
  reste: number;
  etat: EtatBudget;
};

export type CompteVue = {
  id: string;
  slug: string;
  nom: string;
  color: string;
  isCommon: boolean;
  postes: PosteVue[];
  budget: number;
  spent: number;
  reste: number;
};

export type FoyerVue = {
  mois: string;
  comptes: CompteVue[];
  budget: number;
  spent: number;
  reste: number;
};

/**
 * Vue budgétaire du foyer pour un mois donné (postes de dépense uniquement ;
 * les projets d'épargne ont leur propre écran). Les montants numeric (string
 * côté DB) sont convertis en nombres ici.
 */
export async function getBudgetFoyer(mois: string): Promise<FoyerVue> {
  const comptesRows = await db
    .select()
    .from(accounts)
    .orderBy(asc(accounts.sortOrder));

  const rows = await db
    .select({
      accountId: envelopes.accountId,
      envelopeId: envelopes.id,
      nom: envelopes.name,
      budget: envelopeMonths.budget,
      spent: envelopeMonths.spent,
      carryover: envelopeMonths.carryover,
    })
    .from(envelopes)
    .leftJoin(
      envelopeMonths,
      and(
        eq(envelopeMonths.envelopeId, envelopes.id),
        eq(envelopeMonths.month, mois),
      ),
    )
    .where(and(eq(envelopes.archived, false), eq(envelopes.kind, "expense")))
    .orderBy(asc(envelopes.sortOrder));

  const parCompte = new Map<string, PosteVue[]>();
  for (const r of rows) {
    const budget = Number(r.budget ?? 0);
    const spent = Number(r.spent ?? 0);
    const carryover = Number(r.carryover ?? 0);
    const poste: PosteVue = {
      envelopeId: r.envelopeId,
      nom: r.nom,
      budget,
      spent,
      carryover,
      reste: budget + carryover - spent,
      etat: etatBudget(spent, budget),
    };
    const arr = parCompte.get(r.accountId) ?? [];
    arr.push(poste);
    parCompte.set(r.accountId, arr);
  }

  const comptes: CompteVue[] = comptesRows.map((c) => {
    const postes = parCompte.get(c.id) ?? [];
    const budget = postes.reduce((s, p) => s + p.budget, 0);
    const spent = postes.reduce((s, p) => s + p.spent, 0);
    const reste = postes.reduce((s, p) => s + p.reste, 0);
    return {
      id: c.id,
      slug: c.slug,
      nom: c.name,
      color: c.color,
      isCommon: c.isCommon,
      postes,
      budget,
      spent,
      reste,
    };
  });

  return {
    mois,
    comptes,
    budget: comptes.reduce((s, c) => s + c.budget, 0),
    spent: comptes.reduce((s, c) => s + c.spent, 0),
    reste: comptes.reduce((s, c) => s + c.reste, 0),
  };
}
