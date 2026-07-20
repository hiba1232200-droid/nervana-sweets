"use client";
import { SessionProvider } from "next-auth/react";

// Exposes the NextAuth session to client components (useSession).
export default function AuthSession({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
