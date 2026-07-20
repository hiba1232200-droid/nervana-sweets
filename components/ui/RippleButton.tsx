"use client";

import { useState } from "react";

// Button with a luxury ripple wave on click.
export default function RippleButton({
  children, className, onClick, type = "button", disabled,
}: {
  children: React.ReactNode; className?: string; onClick?: () => void;
  type?: "button" | "submit"; disabled?: boolean;
}) {
  const [waves, setWaves] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const spawn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const id = Date.now();
    setWaves((w) => [...w, { id, x: e.clientX - r.left - size / 2, y: e.clientY - r.top - size / 2, size }]);
    setTimeout(() => setWaves((w) => w.filter((x) => x.id !== id)), 600);
    onClick?.();
  };

  return (
    <button type={type} disabled={disabled} onClick={spawn} className={`ripple ${className ?? ""}`}>
      {children}
      {waves.map((w) => (
        <span key={w.id} className="ripple-wave" style={{ left: w.x, top: w.y, width: w.size, height: w.size }} />
      ))}
    </button>
  );
}
