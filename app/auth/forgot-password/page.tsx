"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { SuccessCheck } from "@/components/ui/Feedback";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setLoading(false); setDone(true);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link"
      footer={<Link href="/auth/login" className="text-gold hover:underline">Back to sign in</Link>}
    >
      {done ? (
        <SuccessCheck label="If an account exists for that email, a reset link is on its way." />
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Mail size={16} className="text-gold/70" />
            <input type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-3 text-cream outline-none" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
    </AuthShell>
  );
}
