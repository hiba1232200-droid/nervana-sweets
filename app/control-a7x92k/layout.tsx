import type { Metadata } from "next";
import AdminGate from "@/components/admin/AdminGate";

// Never index the hidden dashboard.
export const metadata: Metadata = {
  title: "NERVANA · Control",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
