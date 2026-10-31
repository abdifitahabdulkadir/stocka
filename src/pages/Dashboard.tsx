import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useApi } from "../lib/api";
import { ChartCardSkeleton, DonutCardSkeleton, StatCardsSkeleton, TableCardSkeleton } from "../components/ui/Skeleton";

interface DashboardData {
  totals: {
    products: number; stock_value: number; low_stock: number; out_of_stock: number; customers: number; open_orders: number;
    revenue_month: number; revenue_prev_month: number; orders_month: number;
  };
  salesByMonth: { month: string; revenue: number; orders: number; returns: number }[];
  categoryData: { name: string; color: string; value: number }[];
  recentOrders: { id: number; code: string; customer: string | null; date: string; status: string; total: number; items: number }[];
  inventoryAlerts: { id: number; product: string; sku: string; stock: number; reorder: number; supplier: string | null }[];
}

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const statusColors: Record<string, string> = {
  Delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Processing: "text-orange-700 bg-orange-50 border-orange-200",
  Shipped: "text-amber-700 bg-amber-50 border-amber-200",
  Cancelled: "text-red-700 bg-red-50 border-red-200",
};

export default function Dashboard() {
  const { data, loading, error } = useApi<DashboardData>("/api/dashboard");
  if (!data) {
    if (!loading) return <div className="p-7 text-sm text-red-500">{error || "No data"}</div>;
    return (
      <div className="p-7 space-y-6 overflow-y-auto h-full">
        <StatCardsSkeleton />
        <div className="grid grid-cols-3 gap-5">
          <ChartCardSkeleton className="col-span-2" />
          <DonutCardSkeleton />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <TableCardSkeleton className="col-span-2" cols={5} />
          <TableCardSkeleton cols={3} />
        </div>
      </div>
    );
  }
  const { totals, salesByMonth: salesData, categoryData, recentOrders, inventoryAlerts } = data;
  const categoryTotal = categoryData.reduce((sum, c) => sum + c.value, 0) || 1;
  const pct = (v: number) => Math.round((v / categoryTotal) * 100);
  const statCards = [
    { label: "Revenue This Month", value: money(totals.revenue_month), icon: DollarSign, color: "bg-orange-600" },
    { label: "Orders This Month", value: totals.orders_month.toLocaleString(), icon: ShoppingCart, color: "bg-amber-600" },
    { label: "Products", value: totals.products.toLocaleString(), icon: Package, color: "bg-emerald-600" },
    { label: "Customers", value: totals.customers.toLocaleString(), icon: Users, color: "bg-amber-500" },
  ];

  return (
    <div className="p-7 space-y-6 overflow-y-auto h-full">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
                <div className={`${card.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <Icon size={15} className="text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Revenue Overview</h3>
              <p className="text-xs text-slate-500">Monthly revenue and order volume</p>
            </div>
            <span className="text-xs text-slate-500">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Products by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Share of catalogue</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`${v} products`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{pct(c.value)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Recent Orders</h3>
                      </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs">
                  <th className="text-left px-5 py-3 font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order.id} className={`border-t border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{order.code}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium text-xs">{order.customer ?? "Walk-in"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(order.date)}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-semibold text-xs">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-xs">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <AlertTriangle size={14} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Stock Alerts</h3>
            <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{inventoryAlerts.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {inventoryAlerts.length === 0 && <div className="px-5 py-8 text-center text-xs text-slate-400">Nothing needs reordering</div>}
            {inventoryAlerts.map((alert) => (
              <div key={alert.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800">{alert.product}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${alert.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                    {alert.stock === 0 ? "Out" : `${alert.stock} left`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">{alert.sku}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Supplier: {alert.supplier ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
