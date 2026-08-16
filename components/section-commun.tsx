import Link from "next/link";
import styles from "./section-commun.module.css";
import { euros } from "@/lib/format";
import { getCommun } from "@/lib/data/commun";
import { definirContribution } from "@/lib/actions/commun";
import { MontantInline } from "@/components/montant-inline";

/** Bloc « qui paie quoi » du compte commun, embarqué sur l'accueil. */
export async function SectionCommun({ mois }: { mois: string }) {
  const { totalCommun, totalRevenus, profils } = await getCommun(mois);
  const totalContribue = profils.reduce((s, p) => s + p.contribue, 0);

  return (
    <section id="commun" className={styles.bloc}>
      <div className={styles.enteteTitre}>
        <h2 className={styles.titre}>Compte commun — qui paie quoi</h2>
        <Link href="/epargne" className={styles.lienProjets}>
          Projets d’épargne →
        </Link>
      </div>

      <div className={styles.entete}>
        <span className={styles.enteteLabel}>À financer ce mois</span>
        <span className={`${styles.enteteVal} chiffre`}>
          {euros(totalCommun)}
        </span>
      </div>
      <p className={styles.sousLigne}>
        Réparti au prorata des revenus. Déjà versé :{" "}
        <b className="chiffre">{euros(totalContribue)}</b>
      </p>

      {totalRevenus === 0 && (
        <p className={styles.hint}>
          Renseigne les revenus dans{" "}
          <Link href="/reglages" className={styles.lien}>
            Réglages
          </Link>{" "}
          pour calculer le prorata.
        </p>
      )}

      <div className={styles.personnes}>
        {profils.map((p) => {
          const soldePos = p.solde >= -0.005;
          return (
            <div
              key={p.id}
              className={styles.personne}
              style={{ ["--accent" as string]: p.color }}
            >
              <div className={styles.pTitre}>
                <span className={styles.pastille} aria-hidden="true" />
                {p.nom}
                <span className={styles.part}>{Math.round(p.part * 100)} %</span>
              </div>
              <div className={styles.grille}>
                <span className={styles.gLabel}>Doit (prorata)</span>
                <span className={`${styles.gVal} chiffre`}>{euros(p.du)}</span>
                <span className={styles.gLabel}>A versé</span>
                <span className={styles.gEdit}>
                  <MontantInline
                    valeur={p.contribue}
                    action={definirContribution.bind(null, p.id, mois)}
                    ariaLabel={`Contribution de ${p.nom}`}
                  />
                </span>
                <span className={styles.gLabel}>Solde</span>
                <span
                  className={`${styles.solde} chiffre ${soldePos ? styles.pos : styles.neg}`}
                >
                  {soldePos ? "" : ""}
                  {euros(p.solde)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
