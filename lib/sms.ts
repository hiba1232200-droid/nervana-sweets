// SMS / OTP abstraction. Uses Twilio when configured, else logs (dev).
export async function sendOtpSms(phone: string, code: string) {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_FROM || "",
        Body: `Your NERVANA verification code is ${code}. It expires in 5 minutes.`,
      }),
    });
  } else {
    console.log(`\n📱 [dev-sms] To: ${phone} — code: ${code}\n`);
  }
}
