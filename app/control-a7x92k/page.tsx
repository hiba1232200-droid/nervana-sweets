"use client";

import {
  DollarSign, TrendingUp, Calendar, CalendarDays, CalendarRange, ShoppingCart,
  Clock, CheckCircle2, XCircle, Package, PackageX, AlertTriangle, Users, UserCheck,
  Wifi, Eye, Percent, Receipt, Crown, Flame,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { StatCard, Card, PageHead } from "@/components/admin/ui";
import { AreaChart, BarChart, Donut } from "@/components/admin/Charts";

export default function AdminOverview() {
  const { stats } = useAdmin();
  const { format } = useApp();

  return (
    <div className="space-y-6">
      <PageHead title="Dashboard Overview" desc="Real-time performance of your storefront." />

      {/* Revenue */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Revenue" value={format(stats.revTotal)} icon={DollarSign} sub="All time" />
        <StatCard label="Daily Revenue" value={format(stats.revDay)} icon={TrendingUp} tone="green" sub="Last 24h" />
        <StatCard label="Weekly Revenue" value={format(stats.revWeek)} icon={Calendar} tone="green" sub="Last 7 days" />
        <StatCard label="Monthly Revenue" value={format(stats.revMonth)} icon={CalendarDays} tone="green" sub="Last 30 days" />
        <StatCard label="Yearly Revenue" value={format(stats.revYear)} icon={CalendarRange} tone="green" sub="Last 12 months" />
      </div>

      {/* Orders */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Orders" value={stats.ordersTotal} icon={ShoppingCart} />
        <StatCard label="Today's Orders" value={stats.ordersToday} icon={Clock} tone="blue" />
        <StatCard label="Active Orders" value={stats.ordersActive} icon={Package} tone="amber" />
        <StatCard label="Delivered" value={stats.ordersDelivered} icon={CheckCircle2} tone="green" />
        <StatCard label="Cancelled" value={stats.ordersCancelled} icon={XCircle} tone="rose" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-cream">Revenue — Last 12 Months</h3>
            <span className="text-xs text-cream/40">USD</span>
          </div>
          <AreaChart data={stats.monthly} />
        </Card>
        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-cream">Order Status</h3>
          <Donut
            segments={[
              { label: "Active", value: stats.ordersActive, color: "#D4AF37" },
              { label: "Delivered", value: stats.ordersDelivered, color: "#34D399" },
              { label: "Cancelled", value: stats.ordersCancelled, color: "#FB7185" },
            ]}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-cream">Sales — Last 7 Days</h3>
          <span className="text-xs text-cream/40">USD</span>
        </div>
        <BarChart data={stats.weekly} />
      </Card>

      {/* Products + users KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Products" value={stats.productsTotal} icon={Package} />
        <StatCard label="Out of Stock" value={stats.outOfStock} icon={PackageX} tone="rose" />
        <StatCard label="Low Stock" value={stats.lowStock} icon={AlertTriangle} tone="amber" />
        <StatCard label="Registered Users" value={stats.usersTotal.toLocaleString()} icon={Users} />
        <StatCard label="Active Users" value={stats.usersActive.toLocaleString()} icon={UserCheck} tone="green" />
        <StatCard label="Online Now" value={stats.usersOnline} icon={Wifi} tone="blue" />
        <StatCard label="Visitors" value={stats.visitors.toLocaleString()} icon={Eye} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Conversion Rate" value={`${stats.conversion}%`} icon={Percent} tone="green" />
        <StatCard label="Avg. Order Value" value={format(stats.aov)} icon={Receipt} />
        <StatCard label="Best Seller" value={stats.bestSellers[0]?.name.split(" ").slice(0, 2).join(" ") || "—"} icon={Flame} tone="amber" />
        <StatCard label="Top Customer" value={stats.topCustomers[0]?.name || "—"} icon={Crown} />
      </div>

      {/* Lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Flame size={18} className="text-gold" /> Best Selling</h3>
          <ul className="space-y-2">
            {stats.bestSellers.map((b, i) => (
              <li key={b.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 text-sm">
                <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-gold/15 text-xs text-gold">{i + 1}</span>{b.name}</span>
                <span className="font-semibold text-gold">{b.qty} sold</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Crown size={18} className="text-gold" /> Top Customers</h3>
          <ul className="space-y-2">
            {stats.topCustomers.map((c) => (
              <li key={c.name} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 text-sm">
                <span>{c.name}</span>
                <span className="font-semibold text-gold">{format(c.spending)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Eye size={18} className="text-gold" /> Most Viewed</h3>
          <ul className="space-y-2">
            {stats.mostViewed.map((m) => (
              <li key={m.name} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 text-sm">
                <span>{m.name}</span>
                <span className="font-semibold text-cream/70">{m.views.toLocaleString()} views</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
