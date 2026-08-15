"use client";

import { useState, useTransition } from "react";
import { euros } from "@/lib/format";
import { definirMontant } from "@/lib/actions/postes";
import styles from "./poste.module.css";

export function MontantEditable({
  envelopeId,
  mois,
  champ,
  valeur,
  emphase = "doux",
}: {
  envelopeId: string;
  mois: string;
  champ: "budget" | "spent";
  valeur: number;
  emphase?: "fort" | "doux";
}) {
  const [edition, setEdition] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [pending, start] = useTransition();

  function ouvrir() {
    setSaisie(valeur.toFixed(2));
    setEdition(true);
  }

  function valider() {
    setEdition(false);
    const n = parseFloat(saisie.replace(",", "."));
    if (!Number.isNaN(n) && n !== valeur) {
      start(() => definirMontant(envelopeId, mois, champ, n));
    }
  }

  if (edition) {
    return (
      <input
        className={styles.montantInput}
        type="text"
        inputMode="decimal"
        value={saisie}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setSaisie(e.target.value)}
        onBlur={valider}
        onKeyDown={(e) => {
          if (e.key === "Enter") valider();
          if (e.key === "Escape") setEdition(false);
        }}
        aria-label={champ === "budget" ? "Budget" : "Dépensé"}
      />
    );
  }

  return (
    <button
      type="button"
      className={`${styles.montantBtn} ${styles[emphase]} ${pending ? styles.pending : ""}`}
      onClick={ouvrir}
    >
      {euros(valeur)}
    </button>
  );
}
