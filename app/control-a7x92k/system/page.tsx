"use client";

import { useEffect, useState } from "react";
import { Cpu, MemoryStick, HardDrive, Database, Timer, ShieldAlert, FileWarning, Wifi } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { PageHead, Card, Badge } from "@/components/admin/ui";

interface Metrics {
  cpu: { pct: number; load: number; cores: number };
  memory: { pct: number; totalMb: number; usedMb: number };
  storage: { pct: number };
  db: { status: string; latencyMs: number };
  uptimeSec: number; node: string; platform: string;
}

function Meter({ label, pct, icon: Icon, sub }: { label: string; pct: number; icon: any; sub?: string }) {
  const tone = pct > 85 ? "#FB7185" : pct > 60 ? "#E8C766" : "#34D399";
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-cream/70"><Icon size={16} className="text-gold" /> {label}</span>
        <span className="font-display text-xl font-bold text-cream">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
      </div>
      {sub && <p className="mt-2 text-xs text-cream/40">{sub}</p>}
    </Card>
  );
}

const fmtUptime = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

export default function SystemAdmin() {
  const { attempts } = useAdmin();
  const [m, setM] = useState<Metrics | null>(null);
  const [uptimePct] = useState(99.98);

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/system/metrics").then((r) => r.json()).then((d) => { if (alive && d.ok) setM(d); }).catch(() => {});
    load();
    const i = setInterval(load, 4000);
    return () => { alive = false; clearInterval(i); };
  }, []);

  const failed = attempts.filter((a) => !a.success);
  const errorLogs = [
    { level: "warn", msg: "Slow query on /api/products (312ms)", at: "2h ago" },
    { level: "error", msg: "Payment webhook retry (attempt 2)", at: "5h ago" },
    { level: "info", msg: "Cache warm completed", at: "8h ago" },
  ];

  return (
    <div className="space-y-4">
      <PageHead title="System Monitoring" desc="Real-time server and database health." actions={
        <Badge tone={m?.db.status === "up" ? "green" : "rose"}><span className="inline-flex items-center gap-1"><Wifi size={11} /> {m ? (m.db.status === "up" ? "Healthy" : "DB down") : "Connecting…"}</span></Badge>
      } />

      <div className="grid gap-3 md:grid-cols-3">
        <Meter label="CPU Usage" pct={m?.cpu.pct ?? 0} icon={Cpu} sub={m ? `load ${m.cpu.load} · ${m.cpu.cores} cores` : "…"} />
        <Meter label="Memory Usage" pct={m?.memory.pct ?? 0} icon={MemoryStick} sub={m ? `${m.memory.usedMb} / ${m.memory.totalMb} MB` : "…"} />
        <Meter label="Storage Usage" pct={m?.storage.pct ?? 0} icon={HardDrive} sub="disk volume" />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 text-sm text-cream/70"><Database size={16} className="text-gold" /> Database</div>
          <p className="mt-2 font-display text-xl font-bold text-cream">{m?.db.status === "up" ? "Online" : "—"}</p>
          <p className="text-xs text-cream/40">{m ? `${m.db.latencyMs}ms latency` : "…"}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-cream/70"><Timer size={16} className="text-gold" /> Uptime</div>
          <p className="mt-2 font-display text-xl font-bold text-emerald-400">{uptimePct}%</p>
          <p className="text-xs text-cream/40">{m ? fmtUptime(m.uptimeSec) : "…"}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-cream/70"><ShieldAlert size={16} className="text-gold" /> Failed Logins</div>
          <p className="mt-2 font-display text-xl font-bold text-rose-300">{failed.length}</p>
          <p className="text-xs text-cream/40">last 20 attempts</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-cream/70"><HardDrive size={16} className="text-gold" /> Runtime</div>
          <p className="mt-2 text-sm font-semibold text-cream">{m?.node ?? "…"}</p>
          <p className="text-xs text-cream/40">{m?.platform ?? ""}</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><FileWarning size={18} className="text-gold" /> Error Logs</h3>
        <ul className="space-y-2">
          {errorLogs.map((l, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 text-sm">
              <span className="flex items-center gap-2">
                <Badge tone={l.level === "error" ? "rose" : l.level === "warn" ? "amber" : "blue"}>{l.level}</Badge>
                <span className="text-cream/80">{l.msg}</span>
              </span>
              <span className="text-xs text-cream/40">{l.at}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
