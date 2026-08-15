/** E-mails autorisés à se connecter (inscription publique fermée). */
export function allowedEmails(): string[] {
  return (process.env.AUTH_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  const list = allowedEmails();
  // Si la liste est vide (mauvaise config), on refuse par sécurité.
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}
