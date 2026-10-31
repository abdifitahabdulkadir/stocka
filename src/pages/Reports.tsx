import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Download } from "lucide-react";
import { useApi } from "../lib/api";

interface ReportsData {
  kpis: { revenue: number; orders: number; avg_order: number; cancelled: number; customers: number; stock_value: number };
  salesByMonth: { month: string; key: string; revenue: number; orders: number; returns: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
}

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function Reports() {
  const { data, loading, error } = useApi<ReportsData>("/api/reports");

  if (loading && !data) return <div className="p-7 text-sm text-slate-400">Loading reports...</div>;
  if (error || !data) return <div className="p-7 text-sm text-red-600">{error || "Could not load reports."}</div>;

  const { kpis: k, salesByMonth, topProducts } = data;
  const totalOrders = k.orders + k.cancelled;
  const kpis = [
    { label: "Gross Revenue", value: money(k.revenue) },
    { label: "Avg Order Value", value: `$${k.avg_order.toFixed(2)}` },
    { label: "Return Rate", value: `${totalOrders ? ((k.cancelled / totalOrders) * 100).toFixed(1) : "0.0"}%` },
    { label: "Revenue / Customer", value: k.customers ? money(k.revenue / k.customers) : "$0" },
  ];
  // Previous period = the month before each bar
  const monthlyComparison = salesByMonth.map((d, i) => ({ ...d, prevRevenue: i > 0 ? salesByMonth[i - 1].revenue : 0 }));
  const salesData = salesByMonth;
  const totalTopRevenue = topProducts.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="p-7 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["This Month", "Last Quarter", "YTD", "Custom"].map((t, i) => (
            <button key={t}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${i === 0 ? "bg-orange-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors">
          <Download size={14} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="text-xs text-slate-500 mb-2">{k.label}</div>
            <div className="text-2xl font-bold text-slate-900">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Revenue Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">Current vs previous period</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyComparison} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`$${Number(v).toLocaleString()}`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="prevRevenue" fill="#fff7ed" radius={[3, 3, 0, 0]} name="Previous" />
              <Bar dataKey="revenue" fill="#ea580c" radius={[3, 3, 0, 0]} name="Current" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Orders Trend</h3>
          <p className="text-xs text-slate-500 mb-4">Orders vs returns over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="orders" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
              <Line type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" name="Returns" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Top Performing Products</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold">Product</th>
              <th className="text-right px-4 py-3 font-semibold">Revenue</th>
              <th className="text-right px-4 py-3 font-semibold">Units Sold</th>
              <th className="text-right px-4 py-3 font-semibold">Share</th>
              <th className="px-4 py-3 font-semibold w-40">Bar</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">No sales yet.</td></tr>
            )}
            {topProducts.map((p, i) => {
              const maxRev = topProducts[0].revenue;
              const pct = maxRev ? (p.revenue / maxRev) * 100 : 0;
              const share = totalTopRevenue ? (p.revenue / totalTopRevenue) * 100 : 0;
              return (
                <tr key={p.name} className={`border-t border-slate-50 hover:bg-slate-50/60 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">{money(p.revenue)}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-slate-700">{p.units}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-xs font-semibold text-slate-600">{share.toFixed(1)}%</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
