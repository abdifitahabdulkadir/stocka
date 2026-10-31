import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Download } from "lucide-react";
import { salesData } from "../data/mockData";

const monthlyComparison = salesData.map(d => ({
  ...d,
  prevRevenue: Math.round(d.revenue * (0.8 + Math.random() * 0.3)),
}));

const topProducts = [
  { name: "Laptop Pro 15", revenue: 58499.55, units: 45, growth: 14.2 },
  { name: "Office Chair Ergonomic", revenue: 38430.00, units: 70, growth: -3.1 },
  { name: "Standing Desk 140cm", revenue: 31160.00, units: 39, growth: 22.8 },
  { name: "Power Drill 18V", revenue: 14739.33, units: 67, growth: 8.5 },
  { name: "Running Shoes X3", revenue: 13234.75, units: 102, growth: 5.9 },
];

const kpis = [
  { label: "Gross Revenue", value: "$373,100" },
  { label: "Avg Order Value", value: "$134.80" },
  { label: "Return Rate", value: "3.8%" },
  { label: "Customer LTV", value: "$2,840" },
];

export default function Reports() {
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
              <th className="text-right px-4 py-3 font-semibold">Growth</th>
              <th className="px-4 py-3 font-semibold w-40">Bar</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => {
              const maxRev = topProducts[0].revenue;
              const pct = (p.revenue / maxRev) * 100;
              return (
                <tr key={p.name} className={`border-t border-slate-50 hover:bg-slate-50/60 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">${p.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-slate-700">{p.units}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-xs font-semibold ${p.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {p.growth >= 0 ? "+" : ""}{p.growth}%
                    </span>
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
