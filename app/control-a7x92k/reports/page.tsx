"use client";

import { FileText, FileSpreadsheet, Printer, TrendingUp } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { PageHead, Card, Table, StatCard, Btn } from "@/components/admin/ui";
import { AreaChart, BarChart } from "@/components/admin/Charts";

export default function ReportsAdmin() {
  const { stats } = useAdmin();
  const { format } = useApp();

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value (USD)"],
      ["Total Revenue", stats.revTotal],
      ["Daily Revenue", stats.revDay],
      ["Weekly Revenue", stats.revWeek],
      ["Monthly Revenue", stats.revMonth],
      ["Yearly Revenue", stats.revYear],
      ["Total Orders", stats.ordersTotal],
      ["Delivered Orders", stats.ordersDelivered],
      ["Cancelled Orders", stats.ordersCancelled],
      ["Avg Order Value", stats.aov],
      ["Conversion Rate %", stats.conversion],
      [],
      ["Month", "Revenue"],
      ...stats.monthly.map((m) => [m.label, m.value]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "nervana-report.csv"; a.click();
  };

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(11, 11, 11); doc.rect(0, 0, W, 80, "F");
    doc.setTextColor(212, 175, 55); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text("NERVANA SWEETS", 40, 42);
    doc.setFontSize(11); doc.setTextColor(230, 210, 150);
    doc.text("Business Report · " + new Date().toLocaleDateString(), 40, 62);
    doc.setTextColor(11, 11, 11); doc.setFontSize(12); let y = 120;
    const rows: [string, string][] = [
      ["Total Revenue", `$${stats.revTotal.toLocaleString()}`],
      ["Monthly Revenue", `$${stats.revMonth.toLocaleString()}`],
      ["Yearly Revenue", `$${stats.revYear.toLocaleString()}`],
      ["Total Orders", String(stats.ordersTotal)],
      ["Delivered Orders", String(stats.ordersDelivered)],
      ["Cancelled Orders", String(stats.ordersCancelled)],
      ["Avg Order Value", `$${stats.aov}`],
      ["Conversion Rate", `${stats.conversion}%`],
    ];
    rows.forEach(([k, v]) => {
      doc.setFont("helvetica", "normal"); doc.text(k, 40, y);
      doc.setFont("helvetica", "bold"); doc.text(v, W - 200, y); y += 26;
      doc.setDrawColor(230); doc.line(40, y - 14, W - 40, y - 14);
    });
    doc.save("NERVANA-Report.pdf");
  };

  const daily = stats.weekly;
  const yearly = stats.monthly;

  return (
    <div className="space-y-4">
      <PageHead title="Reports & Analytics" desc="Sales, revenue, product & customer reports." actions={
        <>
          <Btn variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Print</Btn>
          <Btn variant="outline" size="sm" onClick={exportCsv}><FileSpreadsheet size={14} /> Excel</Btn>
          <Btn size="sm" onClick={exportPdf}><FileText size={14} /> PDF</Btn>
        </>
      } />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Daily Sales" value={format(stats.revDay)} icon={TrendingUp} tone="green" />
        <StatCard label="Weekly Sales" value={format(stats.revWeek)} icon={TrendingUp} tone="green" />
        <StatCard label="Monthly Sales" value={format(stats.revMonth)} icon={TrendingUp} tone="green" />
        <StatCard label="Yearly Sales" value={format(stats.revYear)} icon={TrendingUp} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h3 className="mb-3 font-display text-lg font-bold text-cream">Weekly Sales</h3><BarChart data={daily} /></Card>
        <Card><h3 className="mb-3 font-display text-lg font-bold text-cream">Yearly Revenue</h3><AreaChart data={yearly} /></Card>
      </div>

      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Product Report — Best Sellers</h3>
        <Table head={["#", "Product", "Units Sold", "Revenue"]}>
          {stats.bestSellers.map((b, i) => (
            <tr key={b.id}>
              <td className="px-4 py-2.5 text-cream/50">{i + 1}</td>
              <td className="px-4 py-2.5 text-cream/80">{b.name}</td>
              <td className="px-4 py-2.5 text-cream/70">{b.qty}</td>
              <td className="px-4 py-2.5 font-semibold text-gold">{format(b.revenue)}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Customer Report — Top Spenders</h3>
        <Table head={["Customer", "Orders", "Total Spent"]}>
          {stats.topCustomers.map((c) => (
            <tr key={c.name}>
              <td className="px-4 py-2.5 text-cream/80">{c.name}</td>
              <td className="px-4 py-2.5 text-cream/70">{c.orders}</td>
              <td className="px-4 py-2.5 font-semibold text-gold">{format(c.spending)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
