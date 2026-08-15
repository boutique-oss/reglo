import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Verrou global : toute page exige une session, sauf /connexion.
 * Vérification optimiste (présence du cookie) ; la validation réelle se fait
 * côté serveur avant tout accès aux données.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  const isConnexion = pathname === "/connexion";

  if (!hasSession && !isConnexion) {
    const url = new URL("/connexion", request.url);
    return NextResponse.redirect(url);
  }
  if (hasSession && isConnexion) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // On protège tout sauf les routes d'API, les assets statiques et la PWA.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|icon.png|apple-icon.png).*)",
  ],
};
