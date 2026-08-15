import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";
import { db } from "@/lib/db";
import { isEmailAllowed } from "./allowlist";
import { sendOtpEmail } from "./email";
import {
  MAX_UTILISATEURS,
  enregistrerEvenement,
  nombreUtilisateurs,
} from "./security";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const rpID = process.env.NEXT_PUBLIC_PASSKEY_RP_ID ?? "localhost";
const rpName = process.env.NEXT_PUBLIC_PASSKEY_RP_NAME ?? "reglo";

export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [appUrl],

  database: drizzleAdapter(db, { provider: "pg" }),

  // Pas de mot de passe : uniquement passkey + code OTP e-mail.
  emailAndPassword: { enabled: false },

  // Session longue : pas de reconnexion à chaque ouverture sur mobile.
  session: {
    expiresIn: 60 * 60 * 24 * 60, // 60 jours
    updateAge: 60 * 60 * 24, // prolongée chaque jour d'usage
  },

  // Verrou : allowlist + plafond de 2 comptes. Tout blocage est journalisé.
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          if (!isEmailAllowed(newUser.email)) {
            await enregistrerEvenement(
              newUser.email,
              "Adresse non autorisée",
            );
            throw new Error("Adresse non autorisée.");
          }
          if ((await nombreUtilisateurs()) >= MAX_UTILISATEURS) {
            await enregistrerEvenement(
              newUser.email,
              "Plafond de 2 comptes atteint",
            );
            throw new Error("Nombre maximum de comptes atteint.");
          }
          return { data: newUser };
        },
      },
    },
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10, // 10 minutes
      // On n'envoie pas de code à une adresse non autorisée (et on le journalise).
      async sendVerificationOTP({ email, otp, type }) {
        if (!isEmailAllowed(email)) {
          await enregistrerEvenement(email, "Demande de code refusée");
          return;
        }
        await sendOtpEmail(email, otp, type);
      },
    }),
    passkey({ rpID, rpName, origin: appUrl }),
    nextCookies(), // doit rester en dernier
  ],
});

export type Session = typeof auth.$Infer.Session;
