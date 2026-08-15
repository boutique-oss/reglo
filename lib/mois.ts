/** Mois courant au format 'YYYY-MM-01' (clé des budgets/dépenses). */
export function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Décale un mois 'YYYY-MM-01' de n mois (n négatif = passé). */
export function decalerMois(mois: string, n: number): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
