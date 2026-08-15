"use client";

import { useTransition } from "react";
import { supprimerPoste } from "@/lib/actions/postes";
import styles from "./poste.module.css";

export function SupprimerPoste({
  envelopeId,
  nom,
}: {
  envelopeId: string;
  nom: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className={styles.suppr}
      aria-label={`Supprimer le poste ${nom}`}
      disabled={pending}
      onClick={() => {
        if (confirm(`Supprimer le poste « ${nom} » ?`)) {
          start(() => supprimerPoste(envelopeId));
        }
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
