# reglo

Suivi budgétaire du foyer **Coleen & Raph** — budget par **enveloppes** (esprit
[Actual Budget](https://actualbudget.org/)), pensé **mobile-first**, installable
en **PWA** sur l'écran d'accueil, base de données **partagée** entre les deux.

> État : **Phase 1** (fondations) terminée. L'app se lance et affiche un tableau
> de bord de démonstration à la marque. La base de données, l'authentification et
> le CRUD arrivent dans les phases suivantes (voir la feuille de route en bas).

## Stack

| Domaine        | Choix                                                        |
| -------------- | ----------------------------------------------------------- |
| Framework      | Next.js (App Router) + TypeScript, déployé sur **Vercel**   |
| Base de données| **Neon** (Postgres serverless) + **Drizzle ORM**            |
| Auth (Phase 3) | **Neon Managed Better Auth** — passkey (WebAuthn) + OTP e-mail |
| Sécurité       | **Neon RLS** (`pg_session_jwt`) sur toutes les tables       |
| E-mail (OTP)   | **Resend**                                                  |
| PWA            | **Serwist** (manifest + service worker)                     |
| Style          | CSS Modules + design tokens (aucune dépendance de police)   |

Tout tient dans les **paliers gratuits** de ces services à l'échelle d'un foyer.

## Prérequis

- Node.js **≥ 20** (testé sur 24), npm
- Un compte [Neon](https://neon.com), [Resend](https://resend.com) et
  [Vercel](https://vercel.com) (gratuits)

## Démarrage local

```bash
npm install
npm run icons        # génère les icônes PNG depuis public/icon.svg
cp .env.example .env.local   # puis renseigne les valeurs (voir ci-dessous)
npm run dev          # http://localhost:3000
```

> En Phase 1, aucune variable d'environnement n'est requise pour lancer `npm run
> dev` (le tableau de bord affiche des données de démonstration). Les variables
> deviennent nécessaires à partir de la Phase 2 (base de données).

## Variables d'environnement

Toutes les clés se saisissent dans `.env.local` (local) **et** dans les réglages
Vercel (production). **Aucune clé n'est jamais committée.** Voir
[`.env.example`](.env.example) pour la liste complète et commentée :

- `DATABASE_URL`, `DATABASE_URL_UNPOOLED` — Neon (chaînes poolée / directe)
- `NEXT_PUBLIC_APP_URL` — URL publique de l'app
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — auth (Phase 3)
- `NEXT_PUBLIC_PASSKEY_RP_ID`, `NEXT_PUBLIC_PASSKEY_RP_NAME` — Relying Party WebAuthn
- `RESEND_API_KEY`, `OTP_FROM_EMAIL` — envoi des codes OTP (Phase 3)

Les clés `service_role` / secrètes ne sont utilisées **que côté serveur** ; les
variables `NEXT_PUBLIC_*` sont les seules exposées au navigateur.

## Scripts

| Script                | Rôle                                            |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Serveur de développement                        |
| `npm run build`       | Build de production                             |
| `npm run typecheck`   | Vérification TypeScript                          |
| `npm run icons`       | (Re)génère les icônes PWA depuis `public/icon.svg` |
| `npm run db:generate` | Génère les migrations SQL Drizzle (Phase 2)     |
| `npm run db:migrate`  | Applique les migrations sur Neon (Phase 2)      |
| `npm run db:seed`     | Précharge les comptes/postes de la maquette (Phase 2) |

## Déploiement (Vercel)

1. Pousser le dépôt sur GitHub.
2. Sur Vercel : **New Project** → importer le dépôt (framework détecté : Next.js).
3. Ajouter les variables d'environnement (mêmes clés que `.env.local`, valeurs de
   production).
4. Déployer. Renseigner ensuite `NEXT_PUBLIC_PASSKEY_RP_ID` avec le domaine Vercel
   final (indispensable pour les passkeys).

_(Guide Neon + Resend détaillé ajouté en Phase 9.)_

## Feuille de route

1. **✅ Fondations** — scaffold Next, design tokens, coquille PWA
2. ⏳ Base de données — schéma Drizzle, migrations, RLS, seed (postes de la maquette)
3. ⏳ Authentification — OTP e-mail → passkey, sessions longues, routes protégées
4. ⏳ Tableau de bord réel — comptes, CRUD enveloppes, édition en ligne, barres
5. ⏳ Synthèses + sélecteur de mois + historique + report
6. ⏳ Compte commun — contributions + « qui paie quoi » au prorata des revenus
7. ⏳ Épargne par projet
8. ⏳ Export CSV compatible Actual Budget
9. ⏳ Doc finale (déploiement complet, modèle de données)
