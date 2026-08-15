"use client";

import { useState, useTransition } from "react";
import { ajouterProjet } from "@/lib/actions/epargne";
import styles from "./poste.module.css";

export function AjoutProjet() {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [objectif, setObjectif] = useState("");
  const [pending, start] = useTransition();

  function ajouter() {
    const n = nom.trim();
    if (!n) return;
    const o = parseFloat(objectif.replace(",", ".")) || 0;
    start(async () => {
      await ajouterProjet(n, o);
      setNom("");
      setObjectif("");
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
          + Nouveau projet
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
          placeholder="Nom du projet"
          value={nom}
          autoFocus
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ajouter()}
        />
        <input
          className={styles.ajoutBudget}
          type="text"
          inputMode="decimal"
          placeholder="Objectif"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ajouter()}
          aria-label="Objectif"
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
            setObjectif("");
          }}
          aria-label="Annuler"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
