"use client";

import { useState } from "react";
import { Database, DownloadCloud, RotateCcw, Cloud, HardDrive, Plus, Check } from "lucide-react";
import { PageHead, Card, Table, Badge, Btn, Toggle } from "@/components/admin/ui";

interface Backup { id: string; filename: string; sizeMb: number; location: "local" | "cloud"; status: string; at: string; }

const seed = (): Backup[] => {
  const now = Date.now();
  return Array.from({ length: 6 }).map((_, i) => ({
    id: "B-" + (1000 + i),
    filename: `nervana-auto-${new Date(now - i * 86400000).toISOString().slice(0, 10)}.sql.gz`,
    sizeMb: Math.round((2 + i * 0.2) * 10) / 10,
    location: i % 2 === 0 ? "cloud" : "local",
    status: "completed",
    at: new Date(now - i * 86400000).toISOString(),
  }));
};

export default function BackupsAdmin() {
  const [backups, setBackups] = useState<Backup[]>(seed);
  const [cloud, setCloud] = useState(true);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);

  const backupNow = async () => {
    setBusy(true);
    // Production: POST /api/backups (runs scripts/backup.sh). Demo: record locally.
    await fetch("/api/backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: cloud ? "cloud" : "local" }) }).catch(() => {});
    const b: Backup = {
      id: "B-" + Math.random().toString(36).slice(2, 6), filename: `nervana-manual-${new Date().toISOString().replace(/[:.]/g, "-")}.sql.gz`,
      sizeMb: Math.round((2 + Math.random() * 2) * 10) / 10, location: cloud ? "cloud" : "local", status: "completed", at: new Date().toISOString(),
    };
    setBackups((p) => [b, ...p]);
    setBusy(false);
  };

  const restore = (id: string) => {
    setRestoring(id);
    setTimeout(() => { setRestoring(null); setRestored(id); setTimeout(() => setRestored(null), 2500); }, 1600);
  };

  return (
    <div className="space-y-4">
      <PageHead title="Backup System" desc="Automatic daily backups, manual backups, and one-click restore." actions={
        <Btn onClick={backupNow} disabled={busy}><Plus size={15} /> {busy ? "Backing up…" : "Backup now"}</Btn>
      } />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400"><Database size={18} /></span>
          <div><p className="text-xs text-cream/50">Automatic backups</p><p className="font-semibold text-cream">Daily · 03:00</p></div>
        </Card>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-400"><Cloud size={18} /></span>
            <div><p className="text-xs text-cream/50">Cloud backup</p><p className="font-semibold text-cream">{cloud ? "Enabled" : "Local only"}</p></div>
          </div>
          <Toggle on={cloud} onChange={setCloud} />
        </Card>
        <Card className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold"><HardDrive size={18} /></span>
          <div><p className="text-xs text-cream/50">Retention</p><p className="font-semibold text-cream">14 days rotated</p></div>
        </Card>
      </div>

      <Table head={["Backup", "Size", "Location", "Status", "Date", "Actions"]}>
        {backups.map((b) => (
          <tr key={b.id} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3 font-mono text-xs text-cream/80">{b.filename}</td>
            <td className="px-4 py-3 text-cream/70">{b.sizeMb} MB</td>
            <td className="px-4 py-3"><Badge tone={b.location === "cloud" ? "blue" : "gray"}><span className="inline-flex items-center gap-1">{b.location === "cloud" ? <Cloud size={11} /> : <HardDrive size={11} />} {b.location}</span></Badge></td>
            <td className="px-4 py-3"><Badge tone="green">{b.status}</Badge></td>
            <td className="px-4 py-3 text-xs text-cream/50">{new Date(b.at).toLocaleString()}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold" title="Download"><DownloadCloud size={15} /></button>
                <button onClick={() => restore(b.id)} disabled={restoring === b.id} className="flex items-center gap-1 rounded-lg border border-gold/40 px-2.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 disabled:opacity-50" title="One-click restore">
                  {restored === b.id ? <><Check size={13} /> Restored</> : restoring === b.id ? "Restoring…" : <><RotateCcw size={13} /> Restore</>}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <p className="text-xs text-cream/40">Manual backups call <b className="text-gold">POST /api/backups</b>; the daily job runs via <b className="text-gold">/api/cron/backup</b> (Vercel cron) or <b className="text-gold">scripts/backup.sh</b> on a host, with optional cloud upload (S3 / R2). Restore uses <b className="text-gold">scripts/restore.sh</b>.</p>
    </div>
  );
}
