import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, ChevronDown, Eye } from "lucide-react";
import { useApi } from "../lib/api";
import { TableSkeleton } from "../components/ui/Skeleton";

interface Order {
  id: number; code: string; customer: string | null; status: string; total: number; items: number; created_at: string;
}
interface MonthPoint { month: string; revenue: number; orders: number; }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const statusStyle: Record<string, string> = {
  Delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Processing: "text-orange-700 bg-orange-50 border-orange-200",
  Shipped: "text-amber-700 bg-amber-50 border-amber-200",
  Cancelled: "text-red-700 bg-red-50 border-red-200",
};

export default function Sales() {
  const { data: ordersData, loading, error } = useApi<Order[]>("/api/orders");
  const { data: reports } = useApi<{ salesByMonth: MonthPoint[] }>("/api/reports");
  const allOrders = ordersData ?? [];
  const salesData = reports?.salesByMonth ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses = ["All", "Delivered", "Processing", "Shipped", "Cancelled"];
  const filtered = allOrders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.code.toLowerCase().includes(search.toLowerCase()) || (o.customer ?? "walk-in customer").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-7 space-y-6 overflow-y-auto h-full">
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Monthly Revenue</h3>
          <p className="text-xs text-slate-500 mb-4">Last 7 months · excludes cancelled orders</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} fill="url(#sg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Orders Volume</h3>
          <p className="text-xs text-slate-500 mb-4">Orders placed per month</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} fill="url(#og)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-800">Orders</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="pl-3 pr-7 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none appearance-none cursor-pointer">
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-right px-4 py-3 font-semibold">Items</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{o.code}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-slate-800">{o.customer ?? "Walk-in customer"}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate(o.created_at)}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-slate-700">{o.items}</td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusStyle[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <button onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && !ordersData && <TableSkeleton rows={6} cols={7} />}
              {filtered.length === 0 && !(loading && !ordersData) && (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                  {error ? <span className="text-red-500">{error}</span> : "No orders found"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="font-semibold text-slate-900">{selectedOrder.code}</h2>
                <p className="text-xs text-slate-500">{fmtDate(selectedOrder.created_at)}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${statusStyle[selectedOrder.status]}`}>
                {selectedOrder.status}
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Customer</span><span className="font-semibold text-slate-900">{selectedOrder.customer ?? "Walk-in customer"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Items</span><span className="font-semibold text-slate-900">{selectedOrder.items}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Order Total</span><span className="font-bold text-orange-700 text-base">${selectedOrder.total.toFixed(2)}</span></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
