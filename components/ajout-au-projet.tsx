"use client";

import { useState, useTransition } from "react";
import { ajouterAuProjet } from "@/lib/actions/epargne";
import styles from "./epargne-widgets.module.css";

export function AjoutAuProjet({ envelopeId }: { envelopeId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [montant, setMontant] = useState("");
  const [pending, start] = useTransition();

  function ajouter() {
    const n = parseFloat(montant.replace(",", "."));
    if (Number.isNaN(n) || n <= 0) {
      setOuvert(false);
      return;
    }
    start(async () => {
      await ajouterAuProjet(envelopeId, n);
      setMontant("");
      setOuvert(false);
    });
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        className={styles.ajouter}
        onClick={() => setOuvert(true)}
        disabled={pending}
      >
        + Ajouter
      </button>
    );
  }

  return (
    <div className={styles.apportForm}>
      <input
        className={styles.apportInput}
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={montant}
        autoFocus
        onChange={(e) => setMontant(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") ajouter();
          if (e.key === "Escape") setOuvert(false);
        }}
        aria-label="Montant à ajouter"
      />
      <button type="button" className={styles.apportOk} onClick={ajouter}>
        OK
      </button>
    </div>
  );
}
