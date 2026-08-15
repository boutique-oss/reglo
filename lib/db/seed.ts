// Les variables d'env sont chargées par `tsx --env-file=.env.local` (voir package.json).
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  accounts,
  envelopes,
  envelopeMonths,
  incomes,
  profiles,
} from "./schema";

/* -------------------------------------------------------------------------
   Seed idempotent : précharge les comptes, postes et revenus repris de la
   maquette pour le mois courant. Relançable sans dupliquer (garde par count).
   Les montants sont des points de départ éditables dans l'app.
   ------------------------------------------------------------------------- */

const MOIS = "2026-08-01";

async function main() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(accounts);

  if (count > 0) {
    console.log(`↷ Base déjà initialisée (${count} comptes). Rien à faire.`);
    return;
  }

  console.log("→ Initialisation des données…");

  // --- Profils (les 2 personnes) ---
  await db.insert(profiles).values([
    { slug: "coleen", displayName: "Coleen", color: "#c4577a" },
    { slug: "raph", displayName: "Raph", color: "#227a86" },
  ]);

  // --- Comptes ---
  const [coleen, raph, commun] = await db
    .insert(accounts)
    .values([
      { slug: "coleen", name: "Coleen", color: "#c4577a", sortOrder: 1 },
      { slug: "raph", name: "Raph", color: "#227a86", sortOrder: 2 },
      {
        slug: "commun",
        name: "Commun",
        color: "#6b5b95",
        isCommon: true,
        bank: "Boursorama",
        sortOrder: 3,
      },
    ])
    .returning();

  // --- Postes par compte (nom, budget de départ) + projets d'épargne ---
  type Poste = { name: string; budget: number };
  const postesColeen: Poste[] = [
    { name: "Prêt", budget: 320 },
    { name: "Loyer", budget: 520 },
    { name: "Nourriture", budget: 260 },
    { name: "Abonnements", budget: 45 },
    { name: "Loisirs", budget: 120 },
  ];
  const postesRaph: Poste[] = [
    { name: "Loyer", budget: 520 },
    { name: "Nourriture", budget: 240 },
    { name: "Abonnements", budget: 60 },
    { name: "Loisirs", budget: 150 },
  ];
  const postesCommun: Poste[] = [
    { name: "Courses communes", budget: 400 },
    { name: "Énergie & eau", budget: 180 },
    { name: "Internet / téléphone", budget: 65 },
    { name: "Assurances", budget: 110 },
    { name: "Épargne projets", budget: 300 },
  ];

  // Projets d'épargne (kind = savings) : objectif + contribution mensuelle.
  const projets = [
    { name: "Bébé", target: 5000, budget: 100 },
    { name: "Chien", target: 1500, budget: 50 },
    { name: "Pro", target: 3000, budget: 100 },
    { name: "Retraite", target: 20000, budget: 150 },
  ];

  // Une ligne par poste, budget inclus (évite toute collision par nom entre comptes).
  type SeedRow = {
    accountId: string;
    name: string;
    kind?: "savings";
    target?: number;
    sortOrder: number;
    budget: number;
  };
  const seedRows: SeedRow[] = [
    ...postesColeen.map((p, i) => ({
      accountId: coleen.id,
      name: p.name,
      sortOrder: i + 1,
      budget: p.budget,
    })),
    ...postesRaph.map((p, i) => ({
      accountId: raph.id,
      name: p.name,
      sortOrder: i + 1,
      budget: p.budget,
    })),
    ...postesCommun.map((p, i) => ({
      accountId: commun.id,
      name: p.name,
      sortOrder: i + 1,
      budget: p.budget,
    })),
    ...projets.map((p, i) => ({
      accountId: commun.id,
      name: p.name,
      kind: "savings" as const,
      target: p.target,
      sortOrder: 100 + i,
      budget: p.budget,
    })),
  ];

  const insertedEnvelopes = await db
    .insert(envelopes)
    .values(
      seedRows.map((r) => ({
        accountId: r.accountId,
        name: r.name,
        kind: (r.kind ?? "expense") as "expense" | "savings",
        target: r.target != null ? r.target.toFixed(2) : undefined,
        sortOrder: r.sortOrder,
      })),
    )
    .returning();

  // Valeurs du mois courant — alignées par index sur seedRows (RETURNING préserve l'ordre).
  await db.insert(envelopeMonths).values(
    insertedEnvelopes.map((e, i) => ({
      envelopeId: e.id,
      month: MOIS,
      budget: seedRows[i].budget.toFixed(2),
      spent: "0.00",
    })),
  );

  // --- Revenus du mois (placeholders éditables — servent au prorata) ---
  const profs = await db.select().from(profiles);
  const revenus: Record<string, number> = { coleen: 2200, raph: 2500 };
  await db.insert(incomes).values(
    profs.map((p) => ({
      profileId: p.id,
      month: MOIS,
      amount: (revenus[p.slug] ?? 0).toFixed(2), // numeric → string
    })),
  );

  console.log(
    `✓ Seed terminé : ${profs.length} profils, 3 comptes, ${insertedEnvelopes.length} postes, valeurs de ${MOIS}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Échec du seed :", err);
    process.exit(1);
  });
