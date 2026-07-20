"use client";
import { Star } from "lucide-react";

export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-gold text-gold" : "text-white/20"}
        />
      ))}
    </span>
  );
}
