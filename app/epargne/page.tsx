import type { Metadata } from "next";
import styles from "./epargne.module.css";
import { euros } from "@/lib/format";
import { getProjets } from "@/lib/data/epargne";
import { definirObjectif } from "@/lib/actions/epargne";
import { MontantInline } from "@/components/montant-inline";
import { NomEditable } from "@/components/nom-editable";
import { SupprimerPoste } from "@/components/supprimer-poste";
import { AjoutProjet } from "@/components/ajout-projet";
import { AjoutAuProjet } from "@/components/ajout-au-projet";

export const metadata: Metadata = { title: "Épargne" };
export const dynamic = "force-dynamic";

export default async function Epargne() {
  const projets = await getProjets();
  const totalCumule = projets.reduce((s, p) => s + p.cumule, 0);
  const totalObjectif = projets.reduce((s, p) => s + p.objectif, 0);

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Épargne</div>
      </header>

      <section className={styles.synthese}>
        <span className={styles.syntheseLabel}>Épargne cumulée</span>
        <span className={`${styles.syntheseVal} chiffre`}>
          {euros(totalCumule)}
        </span>
        {totalObjectif > 0 && (
          <span className={styles.syntheseObj}>
            sur {euros(totalObjectif)} d’objectifs
          </span>
        )}
      </section>

      <div className={styles.projets}>
        {projets.map((p) => {
          const pct = Math.round(p.progression * 100);
          return (
            <article key={p.envelopeId} className={styles.projet}>
              <div className={styles.projTop}>
                <NomEditable envelopeId={p.envelopeId} valeur={p.nom} />
                <SupprimerPoste envelopeId={p.envelopeId} nom={p.nom} />
              </div>

              <div className={styles.projMontants}>
                <span className={`${styles.cumule} chiffre`}>
                  {euros(p.cumule)}
                </span>
                <span className={styles.sur}>/</span>
                <MontantInline
                  valeur={p.objectif}
                  action={definirObjectif.bind(null, p.envelopeId)}
                  emphase="doux"
                  ariaLabel={`Objectif de ${p.nom}`}
                />
              </div>

              <div
                className={styles.piste}
                role="progressbar"
                aria-label={`${p.nom} : ${pct}%`}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={styles.barre}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className={styles.projBas}>
                <span className={styles.pct}>{pct} %</span>
                <AjoutAuProjet envelopeId={p.envelopeId} />
              </div>
            </article>
          );
        })}
      </div>

      <AjoutProjet />
    </div>
  );
}
