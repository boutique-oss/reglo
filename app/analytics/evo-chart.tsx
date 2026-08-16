"use client";

import { useState } from "react";
import styles from "./analytics.module.css";

export type EvoPoint = {
  mois: string;
  label: string;
  budgetLabel: string;
  depenseLabel: string;
  hBudget: number;
  hDepense: number;
};

/**
 * Budgété vs dépensé — barres groupées avec lecture des montants au
 * survol / tap (les title HTML natifs sont morts au tactile). Une seule
 * ligne de « readout » sous le graphe, plutôt qu'un nombre sur chaque
 * barre : lisible sur mobile et conforme aux « selective direct labels ».
 */
export function EvoChart({ points }: { points: EvoPoint[] }) {
  const [actif, setActif] = useState<string | null>(null);
  const sel = points.find((p) => p.mois === actif) ?? null;

  return (
    <div>
      <div className={styles.legende}>
        <span>
          <i className={styles.dotBudget} /> Budgété
        </span>
        <span>
          <i className={styles.dotDepense} /> Dépensé
        </span>
      </div>

      <div
        className={styles.evo}
        role="group"
        aria-label="Budgété contre dépensé par mois"
        onMouseLeave={() => setActif(null)}
      >
        {points.map((p) => (
          <button
            type="button"
            className={styles.evoCol}
            key={p.mois}
            data-active={p.mois === actif || undefined}
            onMouseEnter={() => setActif(p.mois)}
            onFocus={() => setActif(p.mois)}
            onClick={() => setActif((c) => (c === p.mois ? null : p.mois))}
            aria-label={`${p.label} : budgété ${p.budgetLabel}, dépensé ${p.depenseLabel}`}
          >
            <div className={styles.evoBars}>
              <div
                className={styles.barBudget}
                style={{ height: `${p.hBudget}%` }}
              />
              <div
                className={styles.barDepense}
                style={{ height: `${p.hDepense}%` }}
              />
            </div>
            <span className={styles.evoLabel}>{p.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.evoReadout} aria-live="polite">
        {sel ? (
          <>
            <span className={styles.evoReadoutMois}>{sel.label}</span>
            <span>
              <i className={styles.dotBudget} />
              <span className="chiffre">{sel.budgetLabel}</span>
            </span>
            <span>
              <i className={styles.dotDepense} />
              <span className="chiffre">{sel.depenseLabel}</span>
            </span>
          </>
        ) : (
          <span className={styles.evoHint}>
            Touchez une barre pour voir les montants
          </span>
        )}
      </div>
    </div>
  );
}
