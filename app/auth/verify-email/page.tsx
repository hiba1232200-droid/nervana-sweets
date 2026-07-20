"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { SuccessCheck, ErrorX } from "@/components/ui/Feedback";

function VerifyInner() {
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    if (!token) { setState("fail"); return; }
    fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => setState(r.ok ? "ok" : "fail"))
      .catch(() => setState("fail"));
  }, [token]);

  return (
    <AuthShell title="Email verification" footer={<Link href="/auth/login" className="text-gold hover:underline">Continue to sign in</Link>}>
      {state === "loading" && <p className="text-center text-cream/60">Verifying your email…</p>}
      {state === "ok" && <SuccessCheck label="Your email is verified. Welcome to NERVANA!" />}
      {state === "fail" && <ErrorX label="This verification link is invalid or has expired." />}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-ink" />}><VerifyInner /></Suspense>;
}
