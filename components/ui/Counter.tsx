"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

// Animated number counter — counts up when scrolled into view.
export default function Counter({
  to, suffix = "", prefix = "", duration = 1.8, className,
}: { to: number; suffix?: string; prefix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { node.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`; },
    });
    return () => controls.stop();
  }, [inView, to, suffix, prefix, duration]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
