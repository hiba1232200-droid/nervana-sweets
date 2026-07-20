"use client";

import { useMemo, useState } from "react";
import {
  Coins, Check, RefreshCw, Clock, Zap, AlertTriangle, Send, TrendingUp,
  TrendingDown, Wifi, WifiOff, RotateCcw, MessageSquare,
} from "lucide-react";
import { useApp, type DisplayMode } from "@/lib/stores/AppProvider";
import { parseRate } from "@/lib/exchange/parse";
import { PageHead, Card, Field, inputCls, Badge, Btn, Table, Toggle, StatCard } from "@/components/admin/ui";
import { AreaChart } from "@/components/admin/Charts";

const CHANNEL = "@SaymouaaExchange";

export default function CurrencyAdmin() {
  const {
    sypRate, rateUpdatedAt, rateSource, rateHistory, exchangeAuto, syncIntervalSec,
    connectionOk, lastRateError, setSypRate, updateRate, restoreRate,
    setExchangeAuto, setSyncIntervalSec, displayMode, setDisplayMode, format,
  } = useApp();
  const [manual, setManual] = useState(sypRate);
  const [paste, setPaste] = useState("سعر الدولار مقابل الليرة السورية\nشراء: 14980\nمبيع: 15020");
  const [parseMsg, setParseMsg] = useState("");
  const [syncing, setSyncing] = useState(false);

  const asc = useMemo(() => [...rateHistory].sort((a, b) => a.at - b.at), [rateHistory]);
  const high = useMemo(() => (asc.length ? Math.max(...asc.map((p) => p.rate)) : sypRate), [asc, sypRate]);
  const low = useMemo(() => (asc.length ? Math.min(...asc.map((p) => p.rate)) : sypRate), [asc, sypRate]);

  const toSeries = (n: number) => asc.slice(-n).map((p) => ({ label: new Date(p.at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: p.rate }));
  const daily = toSeries(24);
  const weekly = toSeries(7);
  const monthly = toSeries(30);
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("monthly");
  const series = range === "daily" ? daily : range === "weekly" ? weekly : monthly;

  const modes: { id: DisplayMode; label: string }[] = [
    { id: "USD", label: "USD only" }, { id: "SYP", label: "SYP only" }, { id: "both", label: "Both" },
  ];

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/currency");
      const j = await res.json();
      if (j?.data?.rate) updateRate(Math.round(j.data.rate), "auto");
    } catch { /* keep last */ }
    setSyncing(false);
  };

  const applyChannelMessage = () => {
    const parsed = parseRate(paste, 1000, 1000000);
    if (!parsed) { setParseMsg("❌ No valid rate found in the message."); return; }
    updateRate(parsed.rate, "telegram");
    setParseMsg(`✓ Detected ${parsed.rate.toLocaleString()} SYP (${parsed.basis}) — applied site-wide.`);
  };

  return (
    <div className="space-y-4">
      <PageHead
        title="Exchange Rate Automation"
        desc="Live USD → SYP sync from the Telegram channel — prices update site-wide."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={connectionOk ? "green" : "rose"}>
              <span className="inline-flex items-center gap-1">{connectionOk ? <Wifi size={11} /> : <WifiOff size={11} />} {connectionOk ? "Connected" : "Disconnected"}</span>
            </Badge>
            <Btn variant="outline" size="sm" onClick={syncNow} disabled={syncing}><RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> Sync now</Btn>
          </div>
        }
      />

      {!connectionOk && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertTriangle size={16} /> {lastRateError || "Telegram rate-channel connection failed."} The last saved rate is still in effect. You can override it manually below.
        </div>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Current Rate" value={`${sypRate.toLocaleString()}`} icon={Coins} sub={`source: ${rateSource}`} />
        <StatCard label="Highest Recorded" value={high.toLocaleString()} icon={TrendingUp} tone="rose" />
        <StatCard label="Lowest Recorded" value={low.toLocaleString()} icon={TrendingDown} tone="green" />
        <StatCard label="Last Update" value={rateUpdatedAt ? new Date(rateUpdatedAt).toLocaleTimeString() : "—"} icon={Clock} tone="blue" sub={rateUpdatedAt ? new Date(rateUpdatedAt).toLocaleDateString() : ""} />
      </div>

      {/* Chart */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-cream">Exchange-Rate History</h3>
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${range === r ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>{r}</button>
            ))}
          </div>
        </div>
        <AreaChart data={series} />
      </Card>

      {/* Automation + channel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Zap size={18} className="text-gold" /> Automatic Synchronization</h3>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3">
            <span className="text-sm text-cream/80">Enable auto-sync from Telegram channel</span>
            <Toggle on={exchangeAuto} onChange={setExchangeAuto} />
          </div>
          <div className="mt-3">
            <span className="mb-2 block text-xs text-cream/60">Sync interval</span>
            <div className="flex gap-2">
              {[30, 60, 300].map((s) => (
                <button key={s} onClick={() => setSyncIntervalSec(s)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${syncIntervalSec === s ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.03] p-3 text-sm">
            <MessageSquare size={15} className="text-gold" />
            <span className="text-cream/70">Channel:</span>
            <a href="https://t.me/SaymouaaExchange" target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">{CHANNEL}</a>
          </div>
          <p className="mt-2 text-xs text-cream/40">Add the bot as an admin of the channel; new rate posts are detected in real time via the webhook and applied automatically.</p>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Send size={18} className="text-gold" /> Simulate Channel Message</h3>
          <textarea rows={4} value={paste} onChange={(e) => setPaste(e.target.value)} className={inputCls} dir="rtl" />
          <div className="mt-2 flex items-center gap-2">
            <Btn onClick={applyChannelMessage}><Check size={14} /> Parse &amp; apply</Btn>
            {parseMsg && <span className="text-xs text-cream/60">{parseMsg}</span>}
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <h4 className="mb-2 text-sm font-semibold text-cream">Manual override</h4>
            <div className="flex items-end gap-2">
              <Field label="1 USD = ? SYP"><input type="number" className={inputCls + " w-40"} value={manual} onChange={(e) => setManual(+e.target.value)} /></Field>
              <Btn variant="outline" onClick={() => setSypRate(Math.max(1, manual))}>Apply</Btn>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <h4 className="mb-2 text-sm font-semibold text-cream">Display mode</h4>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button key={m.id} onClick={() => setDisplayMode(m.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${displayMode === m.id ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>{m.label}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-cream/40">Live preview · $20 item = <b className="text-gold">{format(20)}</b></p>
          </div>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Exchange-Rate Logs</h3>
        <Table head={["Date & Time", "Rate (SYP)", "Source", "Restore"]}>
          {[...rateHistory].sort((a, b) => b.at - a.at).slice(0, 40).map((p) => (
            <tr key={p.at} className="hover:bg-white/[0.02]">
              <td className="px-4 py-2.5 text-cream/70">{new Date(p.at).toLocaleString()}</td>
              <td className="px-4 py-2.5 font-semibold text-gold">{p.rate.toLocaleString()}</td>
              <td className="px-4 py-2.5"><Badge tone={p.source === "telegram" ? "gold" : p.source === "manual" ? "blue" : p.source === "restore" ? "amber" : "gray"}>{p.source}</Badge></td>
              <td className="px-4 py-2.5">
                <button onClick={() => restoreRate(p.at)} className="flex items-center gap-1 rounded-lg border border-gold/40 px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold/10"><RotateCcw size={12} /> Restore</button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
