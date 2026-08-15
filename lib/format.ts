/** Formatage monétaire en euros, locale française. */
const eurFmt = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function euros(montant: number): string {
  return eurFmt.format(montant);
}

/** Sans le symbole — pratique pour aligner des colonnes de chiffres. */
const nombreFmt = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function montant(n: number): string {
  return nombreFmt.format(n);
}

/** Libellé de mois : "2026-08-01" (ou Date) -> "août 2026". */
export function libelleMois(mois: string | Date): string {
  const d = typeof mois === "string" ? new Date(mois + "T00:00:00") : mois;
  const s = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Date + heure courtes : "15 août 2026 à 14:32". */
export function dateHeure(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export type EtatBudget = "ok" | "proche" | "depasse";

/** Détermine l'état d'un poste selon le ratio dépensé / budget. */
export function etatBudget(depense: number, budget: number): EtatBudget {
  if (budget <= 0) return depense > 0 ? "depasse" : "ok";
  const ratio = depense / budget;
  if (ratio > 1) return "depasse";
  if (ratio >= 0.85) return "proche";
  return "ok";
}
