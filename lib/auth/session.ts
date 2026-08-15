import { headers } from "next/headers";
import { auth } from "./server";

/** Récupère la session courante (ou null). */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Exige une session — à appeler au début de chaque action serveur. */
export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié.");
  return session;
}
