import { authenticator } from "otplib";
import QRCode from "qrcode";

// Time-based One-Time Password (RFC 6238) for Two-Factor Authentication.
authenticator.options = { window: 1 }; // tolerate ±1 step for clock drift

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

// otpauth:// URI + QR data URL for authenticator-app enrolment.
export function otpAuthUri(email: string, secret: string): string {
  return authenticator.keyuri(email, "NERVANA Sweets", secret);
}

export function enrolmentQr(email: string, secret: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUri(email, secret));
}
