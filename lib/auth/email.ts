/**
 * Envoi du code OTP par e-mail via Resend (API REST, sans SDK).
 * En l'absence de RESEND_API_KEY (dev), le code est affiché dans la console
 * serveur pour pouvoir se connecter sans configurer d'e-mail.
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  type: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log(
      `\n=== [reglo] Code OTP (${type}) pour ${email} : ${otp} ===\n` +
        "(RESEND_API_KEY absent → code affiché ici. Configure Resend pour l'e-mail réel.)\n",
    );
    return;
  }

  const from = process.env.OTP_FROM_EMAIL ?? "reglo <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Ton code de connexion reglo",
      text: `Bonjour,\n\nVoici ton code de connexion reglo : ${otp}\nIl est valable 10 minutes.\n\nSi tu n'es pas à l'origine de cette demande, ignore ce message.`,
    }),
  });

  if (!res.ok) {
    console.error("Resend a refusé l'envoi :", res.status, await res.text());
    throw new Error("Échec de l'envoi du code par e-mail.");
  }
}
