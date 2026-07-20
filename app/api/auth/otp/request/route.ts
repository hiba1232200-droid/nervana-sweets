import prisma from "@/lib/db/prisma";
import { ok, route, parseBody } from "@/lib/api/respond";
import { otpRequestSchema } from "@/lib/validation/schemas";
import { generateOtp, minutesFromNow } from "@/lib/tokens";
import { hashPassword } from "@/lib/security/password";
import { sendOtpSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

// POST /api/auth/otp/request — send a 6-digit OTP to a phone number.
export const POST = route(async (req) => {
  const { phone } = await parseBody(req, otpRequestSchema);
  const code = generateOtp();
  await prisma.phoneOtp.create({
    data: { phone, codeHash: await hashPassword(code), expiresAt: minutesFromNow(5) },
  });
  await sendOtpSms(phone, code);
  return ok({ sent: true });
});
