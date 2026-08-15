"use client";

import { useState, useTransition } from "react";
import { renommerPoste } from "@/lib/actions/postes";
import styles from "./poste.module.css";

export function NomEditable({
  envelopeId,
  valeur,
}: {
  envelopeId: string;
  valeur: string;
}) {
  const [edition, setEdition] = useState(false);
  const [saisie, setSaisie] = useState(valeur);
  const [pending, start] = useTransition();

  function valider() {
    setEdition(false);
    const v = saisie.trim();
    if (v && v !== valeur) start(() => renommerPoste(envelopeId, v));
  }

  if (edition) {
    return (
      <input
        className={styles.nomInput}
        type="text"
        value={saisie}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setSaisie(e.target.value)}
        onBlur={valider}
        onKeyDown={(e) => {
          if (e.key === "Enter") valider();
          if (e.key === "Escape") {
            setSaisie(valeur);
            setEdition(false);
          }
        }}
        aria-label="Nom du poste"
      />
    );
  }

  return (
    <button
      type="button"
      className={styles.nomBtn}
      onClick={() => {
        setSaisie(valeur);
        setEdition(true);
      }}
      style={pending ? { opacity: 0.5 } : undefined}
    >
      {valeur}
    </button>
  );
}
