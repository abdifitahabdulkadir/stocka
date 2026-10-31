import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingDown, Package, ArrowUpDown } from "lucide-react";
import { useApi } from "../lib/api";
import { ChartCardSkeleton, StatCardsSkeleton, TableCardSkeleton } from "../components/ui/Skeleton";

interface InventoryData {
  totals: { products: number; units: number; stock_value: number; low_stock: number; out_of_stock: number };
  stockByCategory: { category: string; stock: number; products: number }[];
  movements: { id: number; ref: string; type: "in" | "out"; product: string; qty: number; reason: string; created_at: string }[];
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function Inventory() {
  const { data, loading, error } = useApi<InventoryData>("/api/inventory");
  if (!data) {
    if (!loading) return <div className="p-7 text-sm text-red-500">{error || "No data"}</div>;
    return (
      <div className="p-7 space-y-6 overflow-y-auto h-full">
        <StatCardsSkeleton />
        <ChartCardSkeleton height={180} />
        <TableCardSkeleton cols={6} />
      </div>
    );
  }
  const { totals, stockByCategory, movements } = data;
  const totalProducts = totals.products;
  const outOfStock = totals.out_of_stock;
  const lowStock = totals.low_stock;
  const totalValue = totals.stock_value;

  return (
    <div className="p-7 space-y-6 overflow-y-auto h-full">
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Total SKUs", value: totalProducts, icon: Package, color: "bg-orange-600" },
          { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "bg-red-500" },
          { label: "Low Stock", value: lowStock, icon: TrendingDown, color: "bg-amber-500" },
          { label: "Inventory Value", value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: ArrowUpDown, color: "bg-emerald-600" },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`${card.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{card.value}</div>
                <div className="text-xs text-slate-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Stock by Category</h3>
        <p className="text-xs text-slate-500 mb-4">Units on hand and number of products</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stockByCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Bar dataKey="products" fill="#fed7aa" radius={[4, 4, 0, 0]} name="Products" />
            <Bar dataKey="stock" fill="#ea580c" radius={[4, 4, 0, 0]} name="Units in stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Recent Stock Movements</h3>
                  </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-right px-4 py-3 font-semibold">Qty</th>
                <th className="text-left px-4 py-3 font-semibold">Reference</th>
                <th className="text-left px-4 py-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-500">{fmtDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-800">{m.product}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${m.type === "in" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-orange-700 bg-orange-50 border-orange-200"}`}>
                      {m.type === "in" ? "IN" : "OUT"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">{m.qty}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{m.ref}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{m.reason || "—"}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-xs">No stock movements yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
