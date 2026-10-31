import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingDown, Package, ArrowUpDown } from "lucide-react";
import { products } from "../data/mockData";

const stockByCategory = [
  { category: "Electronics", stock: 56, capacity: 120 },
  { category: "Clothing", stock: 187, capacity: 250 },
  { category: "Furniture", stock: 12, capacity: 40 },
  { category: "Tools", stock: 34, capacity: 60 },
  { category: "Other", stock: 67, capacity: 100 },
];

const movements = [
  { date: "Jul 27", product: "Laptop Pro 15", type: "IN", qty: 20, ref: "PO-4421", user: "System" },
  { date: "Jul 26", product: "Running Shoes X3", type: "OUT", qty: 8, ref: "ORD-8821", user: "System" },
  { date: "Jul 25", product: "Wireless Headphones", type: "IN", qty: 15, ref: "PO-4418", user: "J. Donovan" },
  { date: "Jul 25", product: "Office Chair Ergonomic", type: "OUT", qty: 2, ref: "ORD-8819", user: "System" },
  { date: "Jul 24", product: "Power Drill 18V", type: "IN", qty: 10, ref: "PO-4415", user: "J. Donovan" },
  { date: "Jul 23", product: "Standing Desk 140cm", type: "OUT", qty: 1, ref: "ORD-8817", user: "System" },
];

export default function Inventory() {
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reorder).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

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
        <p className="text-xs text-slate-500 mb-4">Current stock vs capacity</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stockByCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Bar dataKey="capacity" fill="#fff7ed" radius={[4, 4, 0, 0]} name="Capacity" />
            <Bar dataKey="stock" fill="#ea580c" radius={[4, 4, 0, 0]} name="In Stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Recent Stock Movements</h3>
          <button className="text-xs text-orange-600 font-medium hover:text-orange-700">Export CSV</button>
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
                <th className="text-left px-4 py-3 font-semibold">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-500">{m.date}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-800">{m.product}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${m.type === "IN" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-orange-700 bg-orange-50 border-orange-200"}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">{m.qty}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{m.ref}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{m.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
