import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------
   Modèle de données reglo — enveloppes (esprit Actual Budget).
   RLS activée sur toutes les tables (baseline « refus par défaut » pour tout
   rôle non-propriétaire) ; les policies liées à l'auth arrivent en Phase 3.
   Montant en numeric(12,2) → typé string par Drizzle (lecture ET écriture) ;
   conversion via Number() / .toFixed(2) à la frontière d'accès aux données.
   ------------------------------------------------------------------------- */

export const envelopeKind = pgEnum("envelope_kind", ["expense", "savings"]);

/** Les 2 personnes du foyer. authUserId sera relié à Better Auth en Phase 3. */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'coleen' | 'raph'
  displayName: text("display_name").notNull(),
  email: text("email"), // pour l'OTP (Phase 3)
  color: text("color").notNull(),
  authUserId: text("auth_user_id"), // lien vers l'utilisateur d'auth (Phase 3)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/** Les 3 comptes budgétaires : coleen, raph, commun (Boursorama). */
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'coleen' | 'raph' | 'commun'
  name: text("name").notNull(),
  color: text("color").notNull(),
  isCommon: boolean("is_common").notNull().default(false),
  bank: text("bank"),
  sortOrder: integer("sort_order").notNull().default(0),
}).enableRLS();

/** Identité stable d'un poste (traverse les mois). */
export const envelopes = pgTable("envelopes", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: envelopeKind("kind").notNull().default("expense"),
  target: numeric("target", { precision: 12, scale: 2 }), // objectif épargne
  sortOrder: integer("sort_order").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/** Valeurs par mois d'un poste (l'axe temporel). reste = budget + carryover − spent. */
export const envelopeMonths = pgTable(
  "envelope_months",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    envelopeId: uuid("envelope_id")
      .notNull()
      .references(() => envelopes.id, { onDelete: "cascade" }),
    month: date("month", { mode: "string" }).notNull(), // 1er du mois : 'YYYY-MM-01'
    budget: numeric("budget", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    spent: numeric("spent", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    carryover: numeric("carryover", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
  },
  (t) => [unique("envelope_months_envelope_month_uq").on(t.envelopeId, t.month)],
).enableRLS();

/** Alimentation du compte commun : qui met combien, par mois. */
export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  month: date("month", { mode: "string" }).notNull(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/** Revenu mensuel par personne — sert au prorata du compte commun. */
export const incomes = pgTable(
  "incomes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    month: date("month", { mode: "string" }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
  },
  (t) => [unique("incomes_profile_month_uq").on(t.profileId, t.month)],
).enableRLS();

export type Profile = typeof profiles.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Envelope = typeof envelopes.$inferSelect;
export type EnvelopeMonth = typeof envelopeMonths.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Income = typeof incomes.$inferSelect;
