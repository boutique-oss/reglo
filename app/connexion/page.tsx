"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import styles from "./connexion.module.css";

export default function Connexion() {
  const router = useRouter();
  const [etape, setEtape] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function reset(msg?: string) {
    setErreur(msg ?? null);
    setInfo(null);
  }

  async function envoyerCode(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setChargement(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    setChargement(false);
    if (error) {
      setErreur("Impossible d'envoyer le code. Vérifie l'adresse e-mail.");
      return;
    }
    setEtape("otp");
    setInfo("Code envoyé. Regarde ta boîte mail.");
  }

  async function verifierCode(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setChargement(true);
    const { error } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: otp.trim(),
    });
    setChargement(false);
    if (error) {
      setErreur("Code incorrect ou expiré.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function connexionPasskey() {
    reset();
    setChargement(true);
    const { error } = await authClient.signIn.passkey();
    setChargement(false);
    if (error) {
      setErreur(
        "Aucune passkey disponible sur cet appareil. Connecte-toi par e-mail, puis ajoute une passkey dans Réglages.",
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        reglo
        <span className={styles.brandDots} aria-hidden="true">
          <span style={{ background: "var(--coleen)" }} />
          <span style={{ background: "var(--raph)" }} />
          <span style={{ background: "var(--commun)" }} />
        </span>
      </div>
      <p className={styles.baseline}>Le budget du foyer, à deux.</p>

      <div className={styles.card}>
        {erreur && <p className={`${styles.msg} ${styles.msgError}`}>{erreur}</p>}
        {info && <p className={`${styles.msg} ${styles.msgInfo}`}>{info}</p>}

        {etape === "email" ? (
          <>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPasskey}`}
              onClick={connexionPasskey}
              disabled={chargement}
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
              Se connecter avec une passkey
            </button>

            <div className={styles.sep}>ou par e-mail</div>

            <form onSubmit={envoyerCode}>
              <label className={styles.label} htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                inputMode="email"
                autoComplete="email webauthn"
                placeholder="toi@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div style={{ height: "var(--e-4)" }} />
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={chargement || !email}
              >
                {chargement ? "Envoi…" : "Recevoir un code"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={verifierCode}>
            <label className={styles.label} htmlFor="otp">
              Code reçu par e-mail
            </label>
            <input
              id="otp"
              className={`${styles.input} ${styles.otp}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
            <div style={{ height: "var(--e-4)" }} />
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={chargement || otp.length < 6}
            >
              {chargement ? "Vérification…" : "Se connecter"}
            </button>
            <div style={{ height: "var(--e-3)" }} />
            <button
              type="button"
              className={styles.retour}
              onClick={() => {
                setEtape("email");
                setOtp("");
                reset();
              }}
            >
              ← Changer d'adresse
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
