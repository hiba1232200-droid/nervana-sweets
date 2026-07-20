"use client";

import { useState } from "react";
import { Globe, Palette, Layout, Search as SeoIcon, Database, Wrench, ShieldCheck, Smartphone, History, AlertTriangle, Save } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { SESSION_TIMEOUT } from "@/lib/admin/config";
import { PageHead, Card, Field, inputCls, Toggle, Badge, Btn, Table } from "@/components/admin/ui";

export default function SettingsAdmin() {
  const { settings, setSettings, lang, setLang } = useApp();
  const { loginHistory, attempts } = useAdmin();
  const [site, setSite] = useState({ name: "NERVANA Sweets", tagline: "Fine Oriental Sweets", theme: "gold-dark", layout: "cinematic" });
  const [seo, setSeo] = useState({ title: "NERVANA | Luxury Oriental Sweets", desc: "Luxury oriental sweets delivered in 10–30 minutes.", keywords: "oriental sweets, baklava, kunafa, NERVANA" });

  return (
    <div className="space-y-4">
      <PageHead title="System Settings" desc="Brand, theme, SEO, backups & security." actions={<Btn size="sm"><Save size={14} /> Save all</Btn>} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Palette size={18} className="text-gold" /> Brand & Theme</h3>
          <div className="space-y-3">
            <Field label="Website name"><input className={inputCls} value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} /></Field>
            <Field label="Tagline"><input className={inputCls} value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Logo">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-gold/40 font-display font-bold text-gold">N</span>
                  <Btn size="sm" variant="outline">Upload</Btn>
                </div>
              </Field>
              <Field label="Theme">
                <select className={inputCls} value={site.theme} onChange={(e) => setSite({ ...site, theme: e.target.value })}>
                  <option value="gold-dark">Gold on Black</option>
                  <option value="gold-charcoal">Gold on Charcoal</option>
                </select>
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Layout size={18} className="text-gold" /> Layout & Language</h3>
          <div className="space-y-3">
            <Field label="Homepage layout">
              <select className={inputCls} value={site.layout} onChange={(e) => setSite({ ...site, layout: e.target.value })}>
                <option value="cinematic">Cinematic (3D hero)</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </Field>
            <Field label="Default language">
              <select className={inputCls} value={lang} onChange={(e) => setLang(e.target.value as "ar" | "en")}>
                <option value="ar">العربية (RTL)</option>
                <option value="en">English (LTR)</option>
              </select>
            </Field>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
              <span className="flex items-center gap-2 text-sm text-cream/80"><Wrench size={15} className="text-gold" /> Maintenance mode</span>
              <Toggle on={settings.maintenanceMode} onChange={(v) => setSettings({ maintenanceMode: v })} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><SeoIcon size={18} className="text-gold" /> SEO</h3>
          <div className="space-y-3">
            <Field label="Meta title"><input className={inputCls} value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} /></Field>
            <Field label="Meta description"><textarea rows={2} className={inputCls} value={seo.desc} onChange={(e) => setSeo({ ...seo, desc: e.target.value })} /></Field>
            <Field label="Keywords"><input className={inputCls} value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} /></Field>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Database size={18} className="text-gold" /> Backup</h3>
          <p className="text-sm text-cream/60">Last backup: today, 03:00. Automatic daily backups enabled.</p>
          <div className="mt-3 flex gap-2"><Btn size="sm" variant="outline">Backup now</Btn><Btn size="sm" variant="ghost">Restore</Btn></div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] p-3"><span className="text-sm text-cream/70">Automatic daily backup</span><Toggle on onChange={() => {}} /></div>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream"><ShieldCheck size={18} className="text-gold" /> Security & Access</h3>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/[0.03] p-3"><p className="flex items-center gap-2 text-sm text-cream/70"><Smartphone size={14} className="text-gold" /> Two-Factor Auth</p><Badge tone="green">Enabled</Badge></div>
          <div className="rounded-xl bg-white/[0.03] p-3"><p className="flex items-center gap-2 text-sm text-cream/70"><History size={14} className="text-gold" /> Session timeout</p><span className="text-sm font-semibold text-cream">{SESSION_TIMEOUT / 60000} min inactivity</span></div>
          <div className="rounded-xl bg-white/[0.03] p-3"><p className="flex items-center gap-2 text-sm text-cream/70"><AlertTriangle size={14} className="text-gold" /> Failed attempts</p><span className="text-sm font-semibold text-rose-300">{attempts.filter((a) => !a.success).length}</span></div>
        </div>

        <p className="mb-2 text-xs uppercase tracking-wider text-gold/70">Device Login History</p>
        <Table head={["Device", "Location", "Date", "Result"]}>
          {loginHistory.slice(0, 8).map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-2.5 text-cream/80">{l.device}</td>
              <td className="px-4 py-2.5 text-cream/60">{l.location}</td>
              <td className="px-4 py-2.5 text-cream/40">{new Date(l.date).toLocaleString()}</td>
              <td className="px-4 py-2.5">{l.success ? <Badge tone="green">Success</Badge> : <Badge tone="rose">Failed</Badge>}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
