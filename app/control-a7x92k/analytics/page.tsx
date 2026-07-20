"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Users, Repeat, Timer, TrendingUp, MousePointerClick } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { PageHead, Card, StatCard } from "@/components/admin/ui";
import { AreaChart, BarChart } from "@/components/admin/Charts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsAdmin() {
  const { stats, orders } = useAdmin();
  const { format } = useApp();
  const [live, setLive] = useState(63);

  // Live visitor counter (simulated real-time fluctuation).
  useEffect(() => {
    const i = setInterval(() => setLive((v) => Math.max(20, v + Math.round((Math.random() - 0.5) * 8))), 3000);
    return () => clearInterval(i);
  }, []);

  // Heatmap: order density by day-of-week × hour (from seeded orders).
  const heat = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    orders.forEach((o) => { const d = new Date(o.date); grid[d.getDay()][d.getHours()]++; });
    const max = Math.max(1, ...grid.flat());
    return { grid, max };
  }, [orders]);

  // Best hours & days
  const byHour = useMemo(() => {
    const h = Array.from({ length: 24 }, () => 0);
    orders.forEach((o) => (h[new Date(o.date).getHours()] += o.total));
    return h.map((v, i) => ({ label: `${i}`, value: Math.round(v) }));
  }, [orders]);
  const byDay = useMemo(() => {
    const d = Array.from({ length: 7 }, () => 0);
    orders.forEach((o) => (d[new Date(o.date).getDay()] += o.total));
    return d.map((v, i) => ({ label: DAYS[i], value: Math.round(v) }));
  }, [orders]);

  // Sales prediction: linear projection of the monthly trend (+1 month).
  const prediction = useMemo(() => {
    const m = stats.monthly;
    if (m.length < 2) return 0;
    const last3 = m.slice(-3).map((x) => x.value);
    const avgGrowth = (last3[2] - last3[0]) / 2;
    return Math.max(0, Math.round(last3[2] + avgGrowth));
  }, [stats.monthly]);

  const funnel = [
    { label: "Visitors", value: stats.visitors },
    { label: "Product views", value: Math.round(stats.visitors * 0.62) },
    { label: "Added to cart", value: Math.round(stats.visitors * 0.21) },
    { label: "Checkout", value: Math.round(stats.visitors * 0.09) },
    { label: "Purchased", value: stats.ordersTotal },
  ];
  const funnelMax = funnel[0].value;

  return (
    <div className="space-y-4">
      <PageHead title="Advanced Analytics" desc="Behaviour, prediction and conversion intelligence." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Live Visitors" value={live} icon={Activity} tone="green" sub="right now" />
        <StatCard label="Returning Customers" value={`${Math.round((stats.topCustomers.length / Math.max(1, stats.topCustomers.length + 4)) * 100)}%`} icon={Repeat} tone="blue" />
        <StatCard label="Customer Retention" value="68%" icon={Users} tone="gold" sub="90-day" />
        <StatCard label="Avg. Session" value="4m 12s" icon={Timer} />
        <StatCard label="Predicted Sales" value={format(prediction)} icon={TrendingUp} tone="green" sub="next month" />
        <StatCard label="Conversion" value={`${stats.conversion}%`} icon={MousePointerClick} tone="amber" />
      </div>

      {/* Heatmap */}
      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Activity Heatmap — day × hour</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="mb-1 flex gap-[3px] ps-10">
              {Array.from({ length: 24 }).map((_, h) => (
                <span key={h} className="w-4 text-center text-[8px] text-cream/30">{h % 3 === 0 ? h : ""}</span>
              ))}
            </div>
            {heat.grid.map((row, d) => (
              <div key={d} className="mb-[3px] flex items-center gap-[3px]">
                <span className="w-9 text-[10px] text-cream/40">{DAYS[d]}</span>
                {row.map((v, h) => {
                  const intensity = v / heat.max;
                  return <span key={h} className="h-4 w-4 rounded-sm" title={`${DAYS[d]} ${h}:00 — ${v}`} style={{ background: intensity ? `rgba(212,175,55,${0.15 + intensity * 0.85})` : "rgba(255,255,255,0.04)" }} />;
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display text-lg font-bold text-cream">Best Selling Hours</h3><BarChart data={byHour.filter((_, i) => i % 2 === 0)} /></Card>
        <Card><h3 className="mb-3 font-display text-lg font-bold text-cream">Best Selling Days</h3><BarChart data={byDay} /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display text-lg font-bold text-cream">Sales Trend & Prediction</h3><AreaChart data={[...stats.monthly, { label: "Next", value: prediction }]} /></Card>
        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-cream">Conversion Funnel</h3>
          <div className="space-y-2">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex justify-between text-xs text-cream/60"><span>{f.label}</span><span className="text-cream">{f.value.toLocaleString()}</span></div>
                <div className="h-6 overflow-hidden rounded-lg bg-white/5">
                  <div className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-gold-dark to-gold pe-2 text-[10px] font-bold text-ink" style={{ width: `${Math.max(6, (f.value / funnelMax) * 100)}%` }}>
                    {Math.round((f.value / funnelMax) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><MousePointerClick size={18} className="text-gold" /> Most Clicked Products</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stats.mostViewed.map((m, i) => (
            <div key={m.name} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 text-sm">
              <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-gold/15 text-xs text-gold">{i + 1}</span>{m.name}</span>
              <span className="font-semibold text-gold">{m.views.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
