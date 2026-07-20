"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { SuccessCheck } from "@/components/ui/Feedback";

export default function RegisterPage() {
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || "Registration failed.");
    else setDone(true);
  };

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle="We sent a verification link to your email" footer={<Link href="/auth/login" className="text-gold hover:underline">Back to sign in</Link>}>
        <SuccessCheck label={`A verification email was sent to ${f.email}. Verify to activate your account.`} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join NERVANA for a sweeter experience"
      footer={<>Already have an account? <Link href="/auth/login" className="text-gold hover:underline">Sign in</Link></>}
    >
      <button onClick={() => signIn("google", { callbackUrl: "/account" })}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 py-3 font-semibold text-cream transition hover:bg-white/10">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3.6 14.7 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.6H12z"/></svg>
        Sign up with Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs text-white/30"><span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" /></div>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <User size={16} className="text-gold/70" />
          <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="w-full bg-transparent py-3 text-cream outline-none" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <Mail size={16} className="text-gold/70" />
          <input type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="w-full bg-transparent py-3 text-cream outline-none" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <Lock size={16} className="text-gold/70" />
          <input type={show ? "text" : "password"} required placeholder="Password (8+, mixed case, number)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="w-full bg-transparent py-3 text-cream outline-none" />
          <button type="button" onClick={() => setShow((s) => !s)} className="text-cream/40 hover:text-gold">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {error && <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertTriangle size={14} /> {error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Creating…" : "Create account"}</button>
      </form>
    </AuthShell>
  );
}
