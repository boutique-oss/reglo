"use client";

import { useTransition } from "react";
import {
  copierBudgetsMoisPrecedent,
  reporterRestes,
} from "@/lib/actions/mois";
import { decalerMois } from "@/lib/mois";
import { libelleMois } from "@/lib/format";
import styles from "./actions-mois.module.css";

export function CopierBudgets({ mois }: { mois: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={styles.copier}
      disabled={pending}
      onClick={() => start(() => copierBudgetsMoisPrecedent(mois))}
    >
      {pending
        ? "Copie…"
        : `Copier les budgets de ${libelleMois(decalerMois(mois, -1))}`}
    </button>
  );
}

export function ReporterRestes({ mois }: { mois: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={styles.reporter}
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            `Reporter les restes de ${libelleMois(mois)} sur ${libelleMois(decalerMois(mois, 1))} ?`,
          )
        ) {
          start(() => reporterRestes(mois));
        }
      }}
    >
      {pending ? "Report…" : `Reporter les restes sur le mois suivant`}
    </button>
  );
}
