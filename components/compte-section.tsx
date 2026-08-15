"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth/client";
import styles from "./compte-section.module.css";

export function CompteSection() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [msg, setMsg] = useState<{ t: "ok" | "err"; c: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function ajouterPasskey() {
    setMsg(null);
    setBusy(true);
    const { error } = await authClient.passkey.addPasskey({
      name: "Cet appareil",
    });
    setBusy(false);
    if (error) {
      setMsg({ t: "err", c: "Ajout de la passkey annulé ou impossible." });
      return;
    }
    setMsg({
      t: "ok",
      c: "Passkey ajoutée ! Tu pourras te connecter avec Face ID / empreinte.",
    });
  }

  async function seDeconnecter() {
    setBusy(true);
    await authClient.signOut();
    router.push("/connexion");
    router.refresh();
  }

  if (isPending) {
    return <p className={styles.muted}>Chargement…</p>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.identite}>
        <span className={styles.label}>Connecté·e en tant que</span>
        <span className={styles.email}>{session?.user.email ?? "—"}</span>
      </div>

      {msg && (
        <p className={msg.t === "ok" ? styles.ok : styles.err}>{msg.c}</p>
      )}

      <button
        type="button"
        className={`${styles.btn} ${styles.btnPasskey}`}
        onClick={ajouterPasskey}
        disabled={busy}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 3a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5M7 21v-3a5 5 0 0 1 3-4.6M16.5 10.5a3 3 0 1 0-3-3M15 21v-6m0 0 1.5-1.5M15 17l1.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Ajouter une passkey sur cet appareil
      </button>

      <button
        type="button"
        className={`${styles.btn} ${styles.btnGhost}`}
        onClick={seDeconnecter}
        disabled={busy}
      >
        Se déconnecter
      </button>
    </div>
  );
}
