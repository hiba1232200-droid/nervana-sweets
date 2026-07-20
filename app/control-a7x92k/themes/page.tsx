"use client";

import { useState } from "react";
import { Palette, Check, Calendar, Sparkles, Pencil } from "lucide-react";
import { useApp, type SeasonalTheme } from "@/lib/stores/AppProvider";
import { PageHead, Card, Btn, Badge, Modal, Field, inputCls, Toggle } from "@/components/admin/ui";

const toLocal = (ms?: number) => { if (!ms) return ""; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

export default function ThemesAdmin() {
  const { themes, themeOverride, activeTheme, setThemeOverride, updateTheme } = useApp();
  const [editing, setEditing] = useState<SeasonalTheme | null>(null);

  const save = () => { if (editing) updateTheme(editing.key, editing); setEditing(null); };

  return (
    <div className="space-y-4">
      <PageHead title="Seasonal Themes" desc="Schedule and activate immersive seasonal experiences." actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-cream/50">Active mode:</span>
          <select value={themeOverride} onChange={(e) => setThemeOverride(e.target.value)} className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm outline-none">
            <option value="auto">Auto (scheduled)</option>
            {themes.map((t) => <option key={t.key} value={t.key}>{t.nameEn}</option>)}
          </select>
        </div>
      } />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${activeTheme.accent}22`, color: activeTheme.accent }}><Sparkles size={20} /></span>
          <div>
            <p className="text-sm text-cream/50">Currently live</p>
            <p className="font-display text-lg font-bold text-cream">{activeTheme.nameEn} <span className="text-cream/40">· {activeTheme.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[activeTheme.accent, activeTheme.accent2, activeTheme.particle].map((c, i) => <span key={i} className="h-7 w-7 rounded-full border border-white/10" style={{ background: c }} />)}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => {
          const live = activeTheme.key === t.key;
          return (
            <Card key={t.key} className={live ? "border-gold/50" : ""}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-display text-lg font-bold text-cream">{t.nameEn}</h3>{live && <Badge tone="gold">Live</Badge>}</div>
                  <p className="text-xs text-cream/40">{t.name}</p>
                </div>
                <div className="flex gap-1">{[t.accent, t.accent2, t.particle].map((c, i) => <span key={i} className="h-6 w-6 rounded-full border border-white/10" style={{ background: c }} />)}</div>
              </div>
              {t.startsAt && t.endsAt ? (
                <p className="flex items-center gap-1.5 text-xs text-cream/50"><Calendar size={12} /> {new Date(t.startsAt).toLocaleDateString()} → {new Date(t.endsAt).toLocaleDateString()}</p>
              ) : <p className="text-xs text-cream/30">No schedule</p>}
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex items-center gap-2 text-xs text-cream/60"><Toggle on={t.enabled} onChange={(v) => updateTheme(t.key, { enabled: v })} /> Enabled</div>
                <div className="flex gap-1">
                  <button onClick={() => setThemeOverride(t.key)} className="rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10">Activate</button>
                  <button onClick={() => setEditing({ ...t })} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold"><Pencil size={15} /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit — ${editing?.nameEn ?? ""}`} wide>
        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (AR)"><input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Name (EN)"><input className={inputCls} value={editing.nameEn} onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} /></Field>
            <Field label="Accent"><input type="color" className={inputCls + " h-10 p-1"} value={editing.accent} onChange={(e) => setEditing({ ...editing, accent: e.target.value })} /></Field>
            <Field label="Accent 2"><input type="color" className={inputCls + " h-10 p-1"} value={editing.accent2} onChange={(e) => setEditing({ ...editing, accent2: e.target.value })} /></Field>
            <Field label="Particle colour"><input type="color" className={inputCls + " h-10 p-1"} value={editing.particle} onChange={(e) => setEditing({ ...editing, particle: e.target.value })} /></Field>
            <Field label="Ornament">
              <select className={inputCls} value={editing.ornament} onChange={(e) => setEditing({ ...editing, ornament: e.target.value as SeasonalTheme["ornament"] })}>
                {["diamond", "crescent", "star", "heart", "snow", "cap"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Tagline (AR)"><input className={inputCls} value={editing.taglineAr || ""} onChange={(e) => setEditing({ ...editing, taglineAr: e.target.value })} /></Field>
            <Field label="Tagline (EN)"><input className={inputCls} value={editing.taglineEn || ""} onChange={(e) => setEditing({ ...editing, taglineEn: e.target.value })} /></Field>
            <Field label="Custom hero image URL"><input className={inputCls} value={editing.heroImage || ""} onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })} /></Field>
            <div />
            <Field label="Schedule start"><input type="datetime-local" className={inputCls} value={toLocal(editing.startsAt)} onChange={(e) => setEditing({ ...editing, startsAt: e.target.value ? new Date(e.target.value).getTime() : undefined })} /></Field>
            <Field label="Schedule end"><input type="datetime-local" className={inputCls} value={toLocal(editing.endsAt)} onChange={(e) => setEditing({ ...editing, endsAt: e.target.value ? new Date(e.target.value).getTime() : undefined })} /></Field>
            <div className="col-span-full flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={save}><Check size={14} /> Save theme</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
