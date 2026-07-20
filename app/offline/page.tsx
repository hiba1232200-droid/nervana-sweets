import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline · NERVANA", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="grid min-h-screen place-items-center bg-luxury-radial px-6 text-center">
      <div>
        <span className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl border border-gold/40 font-display text-3xl font-bold text-gold">N</span>
        <h1 className="font-display text-4xl font-bold text-gold-gradient">You&apos;re offline</h1>
        <p className="mx-auto mt-3 max-w-md text-cream/60">
          It looks like you&apos;ve lost connection. Some pages you&apos;ve visited are still available — reconnect for the full experience.
        </p>
        <Link href="/" className="btn-gold mt-6">Try again</Link>
      </div>
    </div>
  );
}
