"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, KeyRound, Smartphone, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { ADMIN_DEMO } from "@/lib/admin/config";
import Particles from "@/components/ui/Particles";

export default function AdminLogin() {
  const { phase, tryLogin, verify2FA, loginError, attempts } = useAdmin();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState(false);

  const failed = attempts.filter((a) => !a.success).length;

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-luxury-radial px-4">
      <Particles count={22} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-ink" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-gold/20 bg-ink-soft/80 p-8 backdrop-blur-xl shadow-cinematic">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl border border-gold/40 text-gold">
            <Shield size={30} />
          </span>
          <h1 className="font-display text-2xl font-bold text-gold-gradient">NERVANA · Control</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-cream/40">Secure Admin Access</p>
        </div>

        {phase === "login" ? (
          <form onSubmit={(e) => { e.preventDefault(); tryLogin(u, p); }} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-cream/60">Username</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                <KeyRound size={16} className="text-gold/70" />
                <input value={u} onChange={(e) => setU(e.target.value)} autoFocus className="w-full bg-transparent py-3 text-cream outline-none" placeholder="owner" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-cream/60">Encrypted Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                <Lock size={16} className="text-gold/70" />
                <input type={show ? "text" : "password"} value={p} onChange={(e) => setP(e.target.value)} className="w-full bg-transparent py-3 text-cream outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} className="text-cream/40 hover:text-gold">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            {loginError && (
              <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                <AlertTriangle size={14} /> Invalid credentials. This attempt has been logged.
              </p>
            )}
            <button type="submit" className="btn-gold w-full">Continue</button>
            <p className="text-center text-[11px] text-cream/30">Demo · {ADMIN_DEMO.username} / {ADMIN_DEMO.password}</p>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (!verify2FA(code)) setCodeErr(true); }} className="space-y-4">
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-center">
              <Smartphone className="mx-auto text-gold" size={26} />
              <p className="mt-2 text-sm text-cream/80">Two-Factor Authentication</p>
              <p className="text-xs text-cream/40">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setCodeErr(false); }}
              inputMode="numeric" autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center font-mono text-2xl tracking-[0.5em] text-cream outline-none focus:border-gold"
              placeholder="______"
            />
            {codeErr && <p className="text-center text-xs text-rose-300">Enter a valid 6-digit code.</p>}
            <button type="submit" className="btn-gold w-full">Verify & Enter</button>
            <p className="text-center text-[11px] text-cream/30">Demo code · {ADMIN_DEMO.twoFactor} (any 6 digits work)</p>
          </form>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-cream/40">
          <span className="flex items-center gap-1"><Lock size={12} /> 256-bit encrypted</span>
          <span className={failed ? "text-rose-300" : ""}>Failed attempts: {failed}</span>
        </div>
      </motion.div>
    </div>
  );
}
