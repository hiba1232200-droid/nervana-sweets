"use client";

import { useEffect, useState } from "react";
import { Music, Play, Save, Volume2, Music2, CalendarClock, Sparkles } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { useAudio } from "@/lib/audio/AudioProvider";
import { getEngine, type SfxType } from "@/lib/audio/engine";
import { PageHead, Card, Btn, Badge, Field, inputCls } from "@/components/admin/ui";

const SFX: { key: SfxType; label: string }[] = [
  { key: "hover", label: "Hover" }, { key: "click", label: "Click" }, { key: "open", label: "Open menu" },
  { key: "close", label: "Close menu" }, { key: "cart", label: "Open cart" }, { key: "add", label: "Add to cart" },
  { key: "remove", label: "Remove" }, { key: "coupon", label: "Coupon" }, { key: "notify", label: "Notification" },
  { key: "login", label: "Login" }, { key: "order", label: "Order confirmed" }, { key: "payment", label: "Payment success" },
  { key: "ai", label: "AI assistant" },
];

export default function AudioAdmin() {
  const { themes } = useApp();
  const { musicVol, sfxVol, set } = useAudio();
  const [defaultUrl, setDefaultUrl] = useState("");
  const [seasonal, setSeasonal] = useState<Record<string, string>>({});
  const [sfxUrls, setSfxUrls] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setDefaultUrl(localStorage.getItem("nv_audio_default") || "");
      setSeasonal(JSON.parse(localStorage.getItem("nv_audio_seasonal") || "{}"));
      setSfxUrls(JSON.parse(localStorage.getItem("nv_audio_sfx") || "{}"));
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem("nv_audio_default", defaultUrl);
      localStorage.setItem("nv_audio_seasonal", JSON.stringify(seasonal));
      localStorage.setItem("nv_audio_sfx", JSON.stringify(sfxUrls));
    } catch {}
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };
  const preview = (t: SfxType) => { getEngine().primeSfx(); getEngine().sfx(t); };

  return (
    <div className="space-y-4">
      <PageHead title="Audio Manager" desc="Background music, seasonal playlists, UI sound effects & default volumes." actions={
        <Btn onClick={save}><Save size={15} /> {saved ? "Saved ✓" : "Save all"}</Btn>
      } />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Music size={18} className="text-gold" /> Background Music</h3>
          <Field label="Default music URL (.mp3/.ogg — streamed & cached). Leave blank to use the built-in synth ambience.">
            <input className={inputCls} placeholder="https://…/ambient.mp3" value={defaultUrl} onChange={(e) => setDefaultUrl(e.target.value)} />
          </Field>
          {defaultUrl && <audio controls src={defaultUrl} className="mt-3 w-full" preload="none" />}
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Volume2 size={18} className="text-gold" /> Default Volumes</h3>
          <Field label={`Music — ${Math.round(musicVol * 100)}%`}>
            <input type="range" min={0} max={1} step={0.05} value={musicVol} onChange={(e) => set({ musicVol: +e.target.value })} className="w-full accent-gold" />
          </Field>
          <div className="mt-3">
            <Field label={`Sound FX — ${Math.round(sfxVol * 100)}%`}>
              <input type="range" min={0} max={1} step={0.05} value={sfxVol} onChange={(e) => set({ sfxVol: +e.target.value })} className="w-full accent-gold" />
            </Field>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><CalendarClock size={18} className="text-gold" /> Seasonal Playlists</h3>
        <p className="mb-3 text-xs text-cream/50">Assign a soundtrack per theme — it plays automatically while that seasonal theme is active (Ramadan, Eid, New Year, custom…).</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {themes.filter((t) => t.key !== "default").map((t) => (
            <div key={t.key} className="rounded-2xl bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-4 rounded-full" style={{ background: t.accent }} />
                <span className="text-sm font-semibold text-cream">{t.nameEn}</span>
                {["ramadan", "eid-fitr", "eid-adha", "newyear"].includes(t.key) && <Badge tone="gold">featured</Badge>}
              </div>
              <input className={inputCls} placeholder="Music URL…" value={seasonal[t.key] || ""} onChange={(e) => setSeasonal({ ...seasonal, [t.key]: e.target.value })} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Music2 size={18} className="text-gold" /> UI Sound Effects</h3>
        <p className="mb-3 text-xs text-cream/50">Preview the built-in synthesized effects, or provide custom URLs to replace them in production.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SFX.map((s) => (
            <div key={s.key} className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-2">
              <button onClick={() => preview(s.key)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold hover:bg-gold hover:text-ink" title="Preview"><Play size={13} /></button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-cream">{s.label}</p>
                <input className="w-full bg-transparent text-[11px] text-cream/50 outline-none" placeholder="custom URL (optional)" value={sfxUrls[s.key] || ""} onChange={(e) => setSfxUrls({ ...sfxUrls, [s.key]: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-cream/40"><Sparkles size={12} className="mr-1 inline text-gold" /> The storefront ships with a self-contained Web Audio engine (no files needed). Uploaded URLs stream and are browser-cached; nothing is preloaded until the visitor activates audio.</p>
    </div>
  );
}
