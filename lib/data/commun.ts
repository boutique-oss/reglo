import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accounts,
  contributions,
  envelopes,
  envelopeMonths,
  incomes,
  profiles,
} from "@/lib/db/schema";

export type ProfilRevenu = {
  id: string;
  nom: string;
  slug: string;
  color: string;
  revenu: number;
};

/** Revenus de chaque personne pour un mois (pour l'édition dans Réglages). */
export async function getRevenus(mois: string): Promise<ProfilRevenu[]> {
  const profs = await db.select().from(profiles).orderBy(asc(profiles.slug));
  const revs = await db
    .select()
    .from(incomes)
    .where(eq(incomes.month, mois));
  const parProfil = new Map(revs.map((r) => [r.profileId, Number(r.amount)]));
  return profs.map((p) => ({
    id: p.id,
    nom: p.displayName,
    slug: p.slug,
    color: p.color,
    revenu: parProfil.get(p.id) ?? 0,
  }));
}

export type PersonneVue = {
  id: string;
  nom: string;
  slug: string;
  color: string;
  revenu: number; // salaire du mois
  depense: number; // dépenses de son compte perso
  commun: number; // versé au compte commun
  reste: number; // revenu - depense - commun
};

/** Total réel par personne : salaire − dépenses perso − versé au commun. */
export async function getParPersonne(mois: string): Promise<PersonneVue[]> {
  const [revenus, contribs, spentRows] = await Promise.all([
    getRevenus(mois),
    db.select().from(contributions).where(eq(contributions.month, mois)),
    db
      .select({ slug: accounts.slug, spent: envelopeMonths.spent })
      .from(envelopeMonths)
      .innerJoin(envelopes, eq(envelopes.id, envelopeMonths.envelopeId))
      .innerJoin(accounts, eq(accounts.id, envelopes.accountId))
      .where(and(eq(envelopeMonths.month, mois), eq(accounts.isCommon, false))),
  ]);

  const depenseParSlug = new Map<string, number>();
  for (const r of spentRows) {
    depenseParSlug.set(r.slug, (depenseParSlug.get(r.slug) ?? 0) + Number(r.spent));
  }
  const contribParProfil = new Map<string, number>();
  for (const c of contribs) {
    contribParProfil.set(
      c.profileId,
      (contribParProfil.get(c.profileId) ?? 0) + Number(c.amount),
    );
  }

  return revenus.map((r) => {
    const depense = depenseParSlug.get(r.slug) ?? 0;
    const commun = contribParProfil.get(r.id) ?? 0;
    return {
      id: r.id,
      nom: r.nom,
      slug: r.slug,
      color: r.color,
      revenu: r.revenu,
      depense,
      commun,
      reste: r.revenu - depense - commun,
    };
  });
}

export type ProfilCommun = ProfilRevenu & {
  part: number; // part des revenus (0..1)
  du: number; // dû au prorata
  contribue: number; // versé au commun
  solde: number; // contribue - du (>0 = a trop mis)
};

export type CommunVue = {
  mois: string;
  totalCommun: number; // montant à financer (budgets du compte commun)
  totalRevenus: number;
  profils: ProfilCommun[];
};

/** Vue « qui paie quoi » : prorata des revenus vs contributions réelles. */
export async function getCommun(mois: string): Promise<CommunVue> {
  const [revenus, commun] = await Promise.all([
    getRevenus(mois),
    db.select().from(accounts).where(eq(accounts.slug, "commun")),
  ]);

  const communId = commun[0]?.id;
  let totalCommun = 0;
  if (communId) {
    const rows = await db
      .select({ b: envelopeMonths.budget })
      .from(envelopes)
      .innerJoin(
        envelopeMonths,
        and(
          eq(envelopeMonths.envelopeId, envelopes.id),
          eq(envelopeMonths.month, mois),
        ),
      )
      .where(and(eq(envelopes.accountId, communId), eq(envelopes.archived, false)));
    totalCommun = rows.reduce((s, r) => s + Number(r.b), 0);
  }

  const contribs = await db
    .select()
    .from(contributions)
    .where(eq(contributions.month, mois));
  const contribParProfil = new Map<string, number>();
  for (const c of contribs) {
    contribParProfil.set(
      c.profileId,
      (contribParProfil.get(c.profileId) ?? 0) + Number(c.amount),
    );
  }

  const totalRevenus = revenus.reduce((s, r) => s + r.revenu, 0);

  const profils: ProfilCommun[] = revenus.map((r) => {
    const part = totalRevenus > 0 ? r.revenu / totalRevenus : 0;
    const du = part * totalCommun;
    const contribue = contribParProfil.get(r.id) ?? 0;
    return { ...r, part, du, contribue, solde: contribue - du };
  });

  return { mois, totalCommun, totalRevenus, profils };
}
