/** Mois courant au format 'YYYY-MM-01' (clé des budgets/dépenses). */
export function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Normalise une entrée ('YYYY-MM' ou 'YYYY-MM-01') en 'YYYY-MM-01', ou null. */
export function normaliserMois(input?: string | null): string | null {
  if (!input) return null;
  const m = input.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (!m) return null;
  const mois = Number(m[2]);
  if (mois < 1 || mois > 12) return null;
  return `${m[1]}-${m[2]}-01`;
}

/** Décale un mois 'YYYY-MM-01' de n mois (n négatif = passé). */
export function decalerMois(mois: string, n: number): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
