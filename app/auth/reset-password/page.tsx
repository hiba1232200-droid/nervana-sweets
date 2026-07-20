"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { SuccessCheck } from "@/components/ui/Feedback";

function ResetInner() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || "Reset failed.");
    else setDone(true);
  };

  if (done) {
    return <AuthShell title="Password updated" footer={<Link href="/auth/login" className="text-gold hover:underline">Sign in</Link>}>
      <SuccessCheck label="Your password was reset. You can now sign in." />
    </AuthShell>;
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password" footer={<Link href="/auth/login" className="text-gold hover:underline">Back to sign in</Link>}>
      {!token ? (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">Missing or invalid reset link.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Lock size={16} className="text-gold/70" />
            <input type={show ? "text" : "password"} required placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-3 text-cream outline-none" />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-cream/40 hover:text-gold">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {error && <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertTriangle size={14} /> {error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Saving…" : "Update password"}</button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-ink" />}><ResetInner /></Suspense>;
}
