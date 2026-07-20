"use client";

import { Sunrise, Sun, Sunset, Moon, Zap, Sparkles, Check } from "lucide-react";
import { useApp, type Daypart } from "@/lib/stores/AppProvider";
import { PageHead, Card, Field, Toggle, Badge } from "@/components/admin/ui";

const PERIODS: { key: Daypart; label: string; icon: any; desc: string; swatch: string }[] = [
  { key: "morning", label: "Morning", icon: Sunrise, desc: "Soft golden sunrise, warm light, gentle particles", swatch: "linear-gradient(135deg,#F4C77B,#D4AF37)" },
  { key: "day", label: "Day", icon: Sun, desc: "Bright premium lighting, crystal reflections, vibrant gold", swatch: "linear-gradient(135deg,#FFF6E0,#E8C766)" },
  { key: "sunset", label: "Sunset", icon: Sunset, desc: "Warm orange & gold, cinematic gradients, slow particles", swatch: "linear-gradient(135deg,#F59E5B,#EF7A46)" },
  { key: "night", label: "Night", icon: Moon, desc: "Deep black, star field, golden glow, rich 3D depth", swatch: "linear-gradient(135deg,#23305C,#0B0B0B)" },
];

export default function EnvironmentAdmin() {
  const {
    daypart, dayNightEnabled, daypartOverride, lightIntensity, animIntensity,
    setDayNightEnabled, setDaypartOverride, setLightIntensity, setAnimIntensity,
  } = useApp();

  return (
    <div className="space-y-4">
      <PageHead title="Dynamic Day & Night" desc="The site adapts to the visitor's local time — cinematically." actions={
        <Badge tone="gold"><span className="inline-flex items-center gap-1"><Sparkles size={11} /> Live: {daypart}</span></Badge>
      } />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-cream">Enable Dynamic Day & Night mode</p>
          <p className="text-xs text-cream/50">Automatically transforms backgrounds, lighting, 3D scene, particles and ambient audio by time of day.</p>
        </div>
        <Toggle on={dayNightEnabled} onChange={setDayNightEnabled} />
      </Card>

      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Override / Preview</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDaypartOverride("auto")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${daypartOverride === "auto" ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>Auto (by time)</button>
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setDaypartOverride(p.key)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${daypartOverride === p.key ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>
              <p.icon size={15} /> Force {p.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-cream/40">Selecting a period previews it instantly on the storefront. Set back to Auto to resume automatic switching.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Zap size={18} className="text-gold" /> Lighting Intensity — {Math.round(lightIntensity * 100)}%</h3>
          <input type="range" min={0.5} max={1.5} step={0.05} value={lightIntensity} onChange={(e) => setLightIntensity(+e.target.value)} className="w-full accent-gold" />
          <p className="mt-2 text-xs text-cream/40">Scales the 3D hero lighting for every period.</p>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Sparkles size={18} className="text-gold" /> Animation Intensity — {Math.round(animIntensity * 100)}%</h3>
          <input type="range" min={0.3} max={1.2} step={0.05} value={animIntensity} onChange={(e) => setAnimIntensity(+e.target.value)} className="w-full accent-gold" />
          <p className="mt-2 text-xs text-cream/40">Controls the pace of the ambient particle & ornament motion.</p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PERIODS.map((p) => (
          <Card key={p.key} className={daypart === p.key ? "border-gold/50" : ""}>
            <div className="mb-3 h-16 rounded-xl" style={{ background: p.swatch }} />
            <div className="flex items-center gap-2"><p.icon size={16} className="text-gold" /><h4 className="font-display font-bold text-cream">{p.label}</h4>{daypart === p.key && <Check size={15} className="text-gold" />}</div>
            <p className="mt-1 text-xs text-cream/50">{p.desc}</p>
            <p className="mt-2 text-[11px] text-cream/35">Ambient tone auto-crossfades; assign period music in <b className="text-gold">Audio</b>.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
