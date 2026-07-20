"use client";
import { useEffect, useMemo, useState } from "react";

// Floating golden particles rising through the section.
// Generated only after mount to avoid SSR/client hydration mismatch.
export default function Particles({ count = 26 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const bits = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 12,
        dur: 10 + Math.random() * 14,
        opacity: 0.3 + Math.random() * 0.6,
      })),
    [count]
  );
  if (!mounted) return null;
  return (
    <div className="particles" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
