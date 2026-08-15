# reglo

Suivi budgétaire du foyer **Coleen & Raph** — budget par **enveloppes** (esprit
[Actual Budget](https://actualbudget.org/)), **mobile-first**, installable en
**PWA** sur l'écran d'accueil, base de données **partagée** entre les deux.

**En production :** <https://reglofor2.vercel.app>

## Fonctionnalités

- **Tableau de bord** mensuel : synthèse foyer (budgété / dépensé / reste à vivre),
  récap **par personne** (salaire − dépenses perso − versé au commun), cartes par
  compte avec barres de progression (ok / proche / dépassé).
- **CRUD des postes** en ligne : ajout, renommage, édition du budget et du
  dépensé, suppression — recalcul direct.
- **Mois & années** : navigation temporelle, historique, « copier les budgets du
  mois précédent », **report des restes** sur le mois suivant.
- **Compte commun** : alimentation par personne + **« qui paie quoi »** au prorata
  des revenus (part, dû, versé, solde).
- **Projets d'épargne** : objectif, montant cumulé, progression, apports.
- **Analytics** : budgété vs dépensé, répartition par compte, top postes.
- **Export CSV** (mappable à l'import Actual Budget).
- **PWA** installable, hors-ligne, plein écran.

## Stack

| Domaine        | Choix                                                        |
| -------------- | ----------------------------------------------------------- |
| Framework      | Next.js (App Router) + TypeScript, déployé sur **Vercel**   |
| Base de données| **Neon** (Postgres serverless) + **Drizzle ORM**            |
| Auth           | **Better Auth** (auto-hébergé) — passkey (WebAuthn) + OTP e-mail |
| Sécurité       | **RLS** activée sur toutes les tables ; verrou 2 comptes + journal |
| E-mail (OTP)   | **Resend**                                                  |
| PWA            | **Serwist** (manifest + service worker)                     |
| Style          | CSS Modules + design tokens (aucune dépendance de police)   |

Tout tient dans les **paliers gratuits** de ces services à l'échelle d'un foyer.

## Authentification

- **2 comptes maximum** (Coleen & Raph), aucune inscription publique.
- **Allowlist** d'e-mails (`AUTH_ALLOWED_EMAILS`) + **plafond de 2 comptes**.
- Connexion : **code OTP par e-mail** (1ᵉ appareil) → **enrôlement d'une passkey**
  (Réglages) → **passkey** (Face ID / empreinte) au quotidien.
- Toute tentative bloquée est **journalisée** et affichée dans Réglages
  (« note de sécurité »).
- Sessions longues (60 jours) : pas de reconnexion à chaque ouverture.

## Modèle de données

Tables applicatives (montants en `numeric(12,2)`) :

| Table             | Rôle |
| ----------------- | ---- |
| `profiles`        | Les 2 personnes (slug, nom, couleur, lien auth) |
| `accounts`        | 3 comptes : `coleen`, `raph`, `commun` (Boursorama) |
| `envelopes`       | Postes — `kind` = `expense` \| `savings`, `target` (objectif épargne) |
| `envelope_months` | Valeurs par mois : `budget`, `spent`, `carryover` — unique (enveloppe, mois) |
| `contributions`   | Alimentation du compte commun (qui, combien, mois) |
| `incomes`         | Revenu mensuel par personne (prorata) — unique (personne, mois) |
| `security_events` | Journal des tentatives de connexion bloquées |

Tables d'auth (générées par Better Auth) : `user`, `session`, `account`,
`verification`, `passkey`.

> `reste = budget + carryover − spent`. Chaque mois est indépendant ; les budgets
> ne se reportent pas automatiquement (report **du reste** optionnel et manuel).

## Prérequis

- Node.js **≥ 20** (testé sur 24), npm
- Un compte [Neon](https://neon.com), [Resend](https://resend.com) et
  [Vercel](https://vercel.com) (gratuits)

## Démarrage local

```bash
npm install
npm run icons                 # génère les icônes PNG depuis public/icon.svg
cp .env.example .env.local    # puis renseigne les valeurs (voir plus bas)
npm run db:migrate            # applique les migrations sur Neon
npm run db:seed               # précharge comptes/postes de la maquette
npm run dev                   # http://localhost:3000
```

> Sans `RESEND_API_KEY`, le code OTP s'affiche dans la **console serveur** (dev).

## Variables d'environnement

À saisir dans `.env.local` (local) **et** dans Vercel (production).
**Aucune clé n'est committée.** Voir [`.env.example`](.env.example).

| Variable | Rôle |
| -------- | ---- |
| `DATABASE_URL` | Neon, chaîne **pooled** (runtime) |
| `DATABASE_URL_UNPOOLED` | Neon, chaîne **directe** (migrations) |
| `NEXT_PUBLIC_APP_URL` | URL publique (`https://reglofor2.vercel.app`) |
| `BETTER_AUTH_SECRET` | Secret de session — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | = URL publique |
| `NEXT_PUBLIC_PASSKEY_RP_ID` | Domaine WebAuthn (`reglofor2.vercel.app`, `localhost` en dev) |
| `NEXT_PUBLIC_PASSKEY_RP_NAME` | Nom affiché (`reglo`) |
| `AUTH_ALLOWED_EMAILS` | Les 2 e-mails autorisés, séparés par des virgules |
| `RESEND_API_KEY` | Clé Resend (envoi des codes) |
| `OTP_FROM_EMAIL` | Expéditeur (`reglo <onboarding@resend.dev>`) |

## Scripts

| Script | Rôle |
| ------ | ---- |
| `npm run dev` / `build` / `start` | Développement / build / prod |
| `npm run typecheck` | Vérification TypeScript |
| `npm run icons` | (Re)génère les icônes PWA depuis `public/icon.svg` |
| `npm run db:generate` | Génère les migrations SQL Drizzle |
| `npm run db:migrate` | Applique les migrations sur Neon |
| `npm run db:seed` | Précharge les données (idempotent) |
| `npm run db:studio` | Explorateur Drizzle |

## Déploiement complet

### 1. Neon (base de données)

1. Crée un projet sur [neon.com](https://neon.com) (région EU conseillée).
2. **Connect** → copie les chaînes **pooled** et **direct** → `DATABASE_URL` et
   `DATABASE_URL_UNPOOLED`.
3. En local, `npm run db:migrate` puis `npm run db:seed`.

### 2. Resend (e-mails OTP)

1. Crée un compte [resend.com](https://resend.com) avec ton adresse.
2. Copie la clé API → `RESEND_API_KEY`.
3. En test (sans domaine vérifié), Resend n'envoie qu'à l'adresse du compte —
   suffisant pour ton compte. Pour le 2ᵉ utilisateur, **vérifie ton domaine**
   dans Resend et ajuste `OTP_FROM_EMAIL`.

### 3. Vercel (hébergement)

1. Pousse le dépôt sur GitHub.
2. [vercel.com/new](https://vercel.com/new) → **Import** `boutique-oss/reglo`.
   - **Root Directory** : laisse **`./`** (⚠️ ne pas choisir `app`).
   - **Framework** : Next.js (auto-détecté).
3. **Settings → Environment Variables** : ajoute toutes les variables ci-dessus
   (avec les valeurs de production).
4. **Settings → Deployment Protection** : **désactive** Vercel Authentication
   (sinon la PWA redemande une connexion Vercel).
5. **Deploy**. Chaque `git push` sur `main` redéploie automatiquement.

### 4. Installer la PWA

- **iPhone / Safari** : Partager → *Sur l'écran d'accueil*.
- **Android / Chrome** : menu ⋮ → *Installer l'application*.

## Feuille de route

1. ✅ Fondations — scaffold Next, design tokens, coquille PWA
2. ✅ Base de données — schéma Drizzle, migrations, RLS, seed
3. ✅ Authentification — OTP + passkey, verrou 2 comptes, note de sécurité
4. ✅ Tableau de bord réel — données Neon, CRUD des postes, édition en ligne
5. ✅ Mois & années + historique + report du reste
6. ✅ Compte commun — prorata des revenus + revenus éditables + récap par personne
7. ✅ Projets d'épargne — objectif, cumulé, apports
8. ✅ Export CSV compatible Actual Budget
9. ✅ Analytics — graphiques (évolution, répartition, top postes)
10. ✅ Documentation finale

## Sécurité

- RLS activée sur toutes les tables ; l'accès applicatif exige une session valide.
- Aucun secret dans le dépôt (`.env.local` et clés côté Vercel uniquement).
- Pense à faire tourner le mot de passe Neon si une chaîne a fuité.
