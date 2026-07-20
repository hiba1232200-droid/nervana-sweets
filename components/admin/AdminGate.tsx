"use client";

import { AdminProvider, useAdmin } from "@/lib/admin/AdminProvider";
import AdminLogin from "./AdminLogin";
import AdminShell from "./AdminShell";

function Inner({ children }: { children: React.ReactNode }) {
  const { authed } = useAdmin();
  if (!authed) return <AdminLogin />;
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Inner>{children}</Inner>
    </AdminProvider>
  );
}
