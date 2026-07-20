"use client";

import { useApp, type Daypart } from "@/lib/stores/AppProvider";

// Time-of-day atmosphere: four gradient "skies" that crossfade smoothly.
// Concentrated at the top/edges so content stays perfectly readable. Cheap
// (CSS-only, GPU-composited opacity), and honours reduced-motion via globals.
const SKIES: Record<Daypart, React.CSSProperties> = {
  morning: {
    background:
      "radial-gradient(120% 60% at 50% -12%, rgba(244,199,123,0.30), transparent 58%)," +
      "linear-gradient(to bottom, rgba(244,199,123,0.06), transparent 30%)",
  },
  day: {
    background:
      "radial-gradient(120% 55% at 50% -14%, rgba(232,199,102,0.20), transparent 55%)," +
      "radial-gradient(80% 40% at 80% 0%, rgba(255,255,255,0.05), transparent 60%)",
  },
  sunset: {
    background:
      "radial-gradient(120% 65% at 70% -8%, rgba(251,146,60,0.30), transparent 60%)," +
      "linear-gradient(to top, rgba(245,158,91,0.14), transparent 45%)",
  },
  night: {
    background:
      "radial-gradient(130% 70% at 50% -12%, rgba(35,48,92,0.55), transparent 62%)," +
      "radial-gradient(40% 30% at 85% 8%, rgba(212,175,55,0.14), transparent 60%)",
  },
};

export default function EnvironmentLayer() {
  const { daypart, dayNightEnabled } = useApp();
  if (!dayNightEnabled) return null;

  return (
    <div className="env-sky pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {(["morning", "day", "sunset", "night"] as Daypart[]).map((k) => (
        <div key={k} className={`env-layer ${daypart === k ? "env-on" : ""}`} style={SKIES[k]}>
          {k === "night" && <div className="env-layer env-starfield env-on opacity-40" />}
        </div>
      ))}
    </div>
  );
}
