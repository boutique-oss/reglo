import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, envelopes, envelopeMonths } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

function champCsv(v: string | number): string {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Non authentifié", { status: 401 });
  }

  const rows = await db
    .select({
      month: envelopeMonths.month,
      compte: accounts.name,
      compteOrder: accounts.sortOrder,
      poste: envelopes.name,
      posteOrder: envelopes.sortOrder,
      kind: envelopes.kind,
      budget: envelopeMonths.budget,
      spent: envelopeMonths.spent,
      carryover: envelopeMonths.carryover,
    })
    .from(envelopeMonths)
    .innerJoin(envelopes, eq(envelopes.id, envelopeMonths.envelopeId))
    .innerJoin(accounts, eq(accounts.id, envelopes.accountId))
    .orderBy(
      asc(envelopeMonths.month),
      asc(accounts.sortOrder),
      asc(envelopes.sortOrder),
    );

  const entetes = ["Date", "Compte", "Poste", "Type", "Budget", "Dépensé", "Reste"];
  const lignes = [entetes.join(",")];

  for (const r of rows) {
    const budget = Number(r.budget);
    const spent = Number(r.spent);
    const reste = budget + Number(r.carryover) - spent;
    lignes.push(
      [
        r.month,
        champCsv(r.compte),
        champCsv(r.poste),
        r.kind === "savings" ? "Épargne" : "Dépense",
        budget.toFixed(2),
        spent.toFixed(2),
        reste.toFixed(2),
      ].join(","),
    );
  }

  // BOM UTF-8 pour un affichage correct des accents dans Excel.
  const csv = "﻿" + lignes.join("\r\n") + "\r\n";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reglo-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
