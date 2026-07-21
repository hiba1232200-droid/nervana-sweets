"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music, Volume2, VolumeX, X, Music2, Waves } from "lucide-react";
import { useAudio } from "@/lib/audio/AudioProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { getEngine } from "@/lib/audio/engine";
import { playSfx } from "@/lib/audio/sfx";

export default function AudioController() {
  const { enabled, musicOn, sfxOn, musicVol, sfxVol, unlock, set, setMusicUrl } = useAudio();
  const { lang, activeTheme, daypart } = useApp();
  const [open, setOpen] = useState(false);

  // Crossfade the ambient tone with the time of day.
  useEffect(() => { getEngine().setMood(daypart); }, [daypart]);

  // Prime SFX on the very first user gesture (autoplay-safe, no music yet).
  useEffect(() => {
    const prime = () => getEngine().primeSfx();
    window.addEventListener("pointerdown", prime, { once: true });
    window.addEventListener("keydown", prime, { once: true });
    return () => { window.removeEventListener("pointerdown", prime); window.removeEventListener("keydown", prime); };
  }, []);

  // Seasonal / admin-configured music source per active theme.
  useEffect(() => {
    try {
      const def = localStorage.getItem("nv_audio_default") || "";
      const map = JSON.parse(localStorage.getItem("nv_audio_seasonal") || "{}");
      const url = map[activeTheme.key] || def || "";
      setMusicUrl(url || null);
    } catch { setMusicUrl(null); }
  }, [activeTheme.key, setMusicUrl]);

  const ar = lang === "ar";

  // Enable audio (context + SFX) on the first tap anywhere — no popup needed.
  const ensureAudio = () => { unlock(); };

  return (
    <>
      {/* Floating audio control — always available, no intrusive popup */}
      <div className="fixed bottom-4 z-[85] ltr:left-4 rtl:right-4 sm:bottom-6 sm:ltr:left-6 sm:rtl:right-6">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ ease: [0.22, 1, 0.36, 1] }}
                className="glass absolute bottom-16 w-72 max-w-[calc(100vw-2rem)] rounded-3xl p-5 shadow-cinematic ltr:left-0 rtl:right-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display text-sm font-bold text-gold-gradient"><Waves size={16} /> {ar ? "الصوت الفاخر" : "Luxury Audio"}</span>
                  <button onClick={() => { setOpen(false); playSfx("close"); }} className="grid h-7 w-7 place-items-center rounded-full glass-light"><X size={14} /></button>
                </div>

                <label className="mb-3 flex items-center justify-between rounded-xl bg-white/[0.03] p-3 text-sm text-cream/80">
                  <span className="flex items-center gap-2">{enabled ? <Volume2 size={15} className="text-gold" /> : <VolumeX size={15} />} {ar ? "تشغيل الصوت" : "All sound"}</span>
                  <Switch on={enabled} onChange={(v) => { set({ enabled: v }); playSfx("click"); }} />
                </label>

                <div className="space-y-3">
                  <Row icon={<Music size={15} className="text-gold" />} label={ar ? "الموسيقى" : "Music"} on={musicOn} onToggle={(v) => set({ musicOn: v })} vol={musicVol} onVol={(v) => set({ musicVol: v })} />
                  <Row icon={<Music2 size={15} className="text-gold" />} label={ar ? "المؤثرات" : "Sound FX"} on={sfxOn} onToggle={(v) => { set({ sfxOn: v }); if (v) playSfx("click"); }} vol={sfxVol} onVol={(v) => set({ sfxVol: v })} />
                </div>
                <p className="mt-3 text-[11px] text-cream/35">{ar ? "تُحفظ تفضيلاتك تلقائياً." : "Your preferences are saved automatically."}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => { ensureAudio(); setOpen((o) => !o); playSfx(open ? "close" : "open"); }}
            onMouseEnter={() => playSfx("hover")}
            aria-label={ar ? "إعدادات الصوت" : "Audio settings"}
            className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-ink shadow-gold-glow transition hover:scale-110 sm:h-14 sm:w-14"
          >
            {enabled && musicOn ? (
              <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Music size={22} /></motion.span>
            ) : enabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>
    </>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gold" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ icon, label, on, onToggle, vol, onVol }: { icon: React.ReactNode; label: string; on: boolean; onToggle: (v: boolean) => void; vol: number; onVol: (v: number) => void }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between text-sm text-cream/80">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <Switch on={on} onChange={onToggle} />
      </div>
      <input type="range" min={0} max={1} step={0.05} value={vol} disabled={!on} onChange={(e) => onVol(+e.target.value)} className="w-full accent-gold disabled:opacity-40" />
    </div>
  );
}
