// Email abstraction. Uses SMTP (nodemailer) when configured, otherwise logs to
// the console in development. Swap for Resend/SendGrid/SES by editing `send`.
import { SITE_URL } from "@/lib/seo/schema";

interface Mail { to: string; subject: string; html: string; }

async function send(mail: Mail) {
  if (process.env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({ from: process.env.SMTP_FROM || "NERVANA <no-reply@nervana.sweets>", ...mail });
  } else {
    console.log(`\n📧 [dev-mail] To: ${mail.to}\nSubject: ${mail.subject}\n${mail.html}\n`);
  }
}

const shell = (title: string, body: string) => `
  <div style="background:#0B0B0B;padding:40px;font-family:Georgia,serif;color:#F7F1E3">
    <div style="max-width:520px;margin:auto;background:#1A1A1A;border:1px solid #D4AF3733;border-radius:20px;padding:36px;text-align:center">
      <div style="font-size:28px;font-weight:bold;color:#D4AF37;letter-spacing:2px">NERVANA</div>
      <div style="font-size:11px;letter-spacing:4px;color:#F7F1E399;text-transform:uppercase;margin-bottom:24px">Fine Oriental Sweets</div>
      <h1 style="color:#F7F1E3;font-size:22px">${title}</h1>
      ${body}
      <p style="color:#F7F1E366;font-size:12px;margin-top:28px">© NERVANA Sweets</p>
    </div>
  </div>`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin:22px 0;background:linear-gradient(135deg,#F0E0B0,#D4AF37,#A8842A);color:#0B0B0B;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:bold">${label}</a>`;

export function sendVerificationEmail(to: string, token: string) {
  const url = `${SITE_URL}/auth/verify-email?token=${token}`;
  return send({ to, subject: "Verify your NERVANA account", html: shell("Verify your email", `<p style="color:#F7F1E3cc">Welcome! Confirm your email to activate your account.</p>${button(url, "Verify Email")}<p style="color:#F7F1E366;font-size:12px">Or open: ${url}</p>`) });
}

export function sendPasswordResetEmail(to: string, token: string) {
  const url = `${SITE_URL}/auth/reset-password?token=${token}`;
  return send({ to, subject: "Reset your NERVANA password", html: shell("Reset your password", `<p style="color:#F7F1E3cc">We received a request to reset your password. This link expires in 30 minutes.</p>${button(url, "Reset Password")}<p style="color:#F7F1E366;font-size:12px">If you didn't request this, ignore this email.</p>`) });
}
