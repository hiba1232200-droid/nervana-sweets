"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Phone, AlertTriangle } from "lucide-react";
import AuthShell, { authInput } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [f, setF] = useState({ email: "", password: "", totp: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { ...f, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email, password, or 2FA code.");
    else router.push("/account");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your NERVANA account"
      footer={<>New here? <Link href="/auth/register" className="text-gold hover:underline">Create an account</Link></>}
    >
      <button onClick={() => signIn("google", { callbackUrl: "/account" })}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 py-3 font-semibold text-cream transition hover:bg-white/10">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3.6 14.7 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.6H12z"/></svg>
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-white/30"><span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" /></div>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <Mail size={16} className="text-gold/70" />
          <input type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="w-full bg-transparent py-3 text-cream outline-none" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <Lock size={16} className="text-gold/70" />
          <input type={show ? "text" : "password"} required placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="w-full bg-transparent py-3 text-cream outline-none" />
          <button type="button" onClick={() => setShow((s) => !s)} className="text-cream/40 hover:text-gold">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <ShieldCheck size={16} className="text-gold/70" />
          <input inputMode="numeric" placeholder="2FA code (if enabled)" value={f.totp} onChange={(e) => setF({ ...f, totp: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="w-full bg-transparent py-3 text-cream outline-none" />
        </div>

        {error && <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertTriangle size={14} /> {error}</p>}

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs text-cream/50 hover:text-gold">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button>
      </form>

      <Link href="/auth/phone" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10">
        <Phone size={15} /> Sign in with phone number
      </Link>
    </AuthShell>
  );
}
