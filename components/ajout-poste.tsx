"use client";

import { useState, useTransition } from "react";
import { ajouterPoste } from "@/lib/actions/postes";
import styles from "./poste.module.css";

export function AjoutPoste({ accountId }: { accountId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [budget, setBudget] = useState("");
  const [pending, start] = useTransition();

  function ajouter() {
    const n = nom.trim();
    if (!n) return;
    const b = parseFloat(budget.replace(",", ".")) || 0;
    start(async () => {
      await ajouterPoste(accountId, n, b);
      setNom("");
      setBudget("");
      setOuvert(false);
    });
  }

  if (!ouvert) {
    return (
      <div className={styles.ajout}>
        <button
          type="button"
          className={styles.ajoutBtn}
          onClick={() => setOuvert(true)}
        >
          + Ajouter un poste
        </button>
      </div>
    );
  }

  return (
    <div className={styles.ajout}>
      <div className={styles.ajoutForm}>
        <input
          className={styles.ajoutNom}
          type="text"
          placeholder="Nom du poste"
          value={nom}
          autoFocus
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ajouter()}
        />
        <input
          className={styles.ajoutBudget}
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ajouter()}
          aria-label="Budget"
        />
        <button
          type="button"
          className={styles.ajoutOk}
          onClick={ajouter}
          disabled={pending || !nom.trim()}
        >
          OK
        </button>
        <button
          type="button"
          className={styles.ajoutAnnuler}
          onClick={() => {
            setOuvert(false);
            setNom("");
            setBudget("");
          }}
          aria-label="Annuler"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
