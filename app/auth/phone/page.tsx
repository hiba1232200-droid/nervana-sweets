"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Phone, AlertTriangle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

export default function PhoneAuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    setLoading(false);
    if (!res.ok) setError("Could not send code. Check the number and try again.");
    else setStep("code");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("phone", { phone, code, redirect: false });
    setLoading(false);
    if (res?.error) setError("Incorrect or expired code.");
    else router.push("/account");
  };

  return (
    <AuthShell
      title={step === "phone" ? "Sign in with phone" : "Enter your code"}
      subtitle={step === "phone" ? "We'll text you a one-time code" : `Sent to ${phone}`}
      footer={<>Prefer email? <Link href="/auth/login" className="text-gold hover:underline">Sign in with email</Link></>}
    >
      {step === "phone" ? (
        <form onSubmit={requestOtp} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Phone size={16} className="text-gold/70" />
            <input type="tel" required placeholder="+963 9xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent py-3 text-cream outline-none" />
          </div>
          {error && <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertTriangle size={14} /> {error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Sending…" : "Send code"}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <input inputMode="numeric" autoFocus required placeholder="______" value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center font-mono text-2xl tracking-[0.5em] text-cream outline-none focus:border-gold" />
          {error && <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertTriangle size={14} /> {error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Verifying…" : "Verify & sign in"}</button>
          <button type="button" onClick={() => setStep("phone")} className="w-full text-center text-xs text-cream/50 hover:text-gold">Change number</button>
        </form>
      )}
    </AuthShell>
  );
}
