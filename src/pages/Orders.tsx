import { useState } from "react";
import { Search, Eye, X, ChevronDown, Download } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";

const allOrders = [
  { id: "ORD-8821", customer: "Nova Retail Ltd", email: "nova@novaretail.co", date: "Jul 24, 2026", items: [{ name: "Laptop Pro 15", qty: 2, price: 1299.99 }, { name: "USB-C Hub 7-in-1", qty: 4, price: 59.99 }], payment: "Bank Transfer", status: "Delivered" },
  { id: "ORD-8820", customer: "Meridian Corp", email: "orders@meridiancorp.com", date: "Jul 24, 2026", items: [{ name: "Wireless Headphones", qty: 2, price: 189.99 }], payment: "Credit Card", status: "Processing" },
  { id: "ORD-8819", customer: "Blake & Associates", email: "blake@bkassoc.net", date: "Jul 23, 2026", items: [{ name: "Running Shoes X3", qty: 4, price: 129.95 }, { name: "Yoga Mat Premium", qty: 2, price: 79.99 }], payment: "Credit Card", status: "Shipped" },
  { id: "ORD-8818", customer: "Pinnacle Trading", email: "trade@pinnacletrd.com", date: "Jul 23, 2026", items: [{ name: "Standing Desk 140cm", qty: 5, price: 799.00 }, { name: "Office Chair Ergonomic", qty: 5, price: 549.00 }, { name: "Mechanical Keyboard", qty: 5, price: 149.99 }], payment: "Bank Transfer", status: "Delivered" },
  { id: "ORD-8817", customer: "Crestline Group", email: "crest@crestlinegroup.io", date: "Jul 22, 2026", items: [{ name: "Office Chair Ergonomic", qty: 1, price: 549.00 }], payment: "Credit Card", status: "Cancelled" },
  { id: "ORD-8816", customer: "Vertex Solutions", email: "purchasing@vertexsol.com", date: "Jul 22, 2026", items: [{ name: "Monitor 27\" 4K", qty: 2, price: 649.00 }, { name: "Mechanical Keyboard", qty: 2, price: 149.99 }], payment: "Bank Transfer", status: "Delivered" },
  { id: "ORD-8815", customer: "Meridian Corp", email: "orders@meridiancorp.com", date: "Jul 21, 2026", items: [{ name: "Laptop Pro 15", qty: 3, price: 1299.99 }, { name: "Wireless Headphones", qty: 5, price: 189.99 }], payment: "Credit Card", status: "Delivered" },
  { id: "ORD-8814", customer: "Nova Retail Ltd", email: "nova@novaretail.co", date: "Jul 21, 2026", items: [{ name: "Running Shoes X3", qty: 2, price: 129.95 }], payment: "Mobile Pay", status: "Processing" },
  { id: "ORD-8813", customer: "Pinnacle Trading", email: "trade@pinnacletrd.com", date: "Jul 20, 2026", items: [{ name: "Power Drill 18V", qty: 3, price: 219.99 }, { name: "Standing Desk 140cm", qty: 6, price: 799.00 }], payment: "Bank Transfer", status: "Shipped" },
  { id: "ORD-8812", customer: "Blake & Associates", email: "blake@bkassoc.net", date: "Jul 19, 2026", items: [{ name: "Yoga Mat Premium", qty: 5, price: 79.99 }], payment: "Credit Card", status: "Delivered" },
];

const statusVariant: Record<string, "success" | "blue" | "purple" | "danger" | "neutral"> = {
  Delivered: "success", Processing: "blue", Shipped: "purple", Cancelled: "danger",
};

type Order = typeof allOrders[0];

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const subtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * 0.08;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900">{order.id}</h2>
              <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{order.date} · {order.payment}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">Customer</p>
            <p className="text-sm font-semibold text-slate-900">{order.customer}</p>
            <p className="text-xs text-slate-500">{order.email}</p>
          </div>

          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-slate-500 font-semibold">Item</th>
                <th className="text-right py-2 text-slate-500 font-semibold">Qty</th>
                <th className="text-right py-2 text-slate-500 font-semibold">Price</th>
                <th className="text-right py-2 text-slate-500 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium text-slate-800">{item.name}</td>
                  <td className="py-2.5 text-right text-slate-600">{item.qty}</td>
                  <td className="py-2.5 text-right text-slate-600">${item.price.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-900">${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-slate-500"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
              <span>Total</span><span className="text-orange-700">${(subtotal + tax).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            {order.status === "Processing" && (
              <button className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">Mark Shipped</button>
            )}
            {order.status !== "Cancelled" && order.status !== "Delivered" && (
              <button className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50">Cancel</button>
            )}
          </div>
          <button onClick={onClose} className="px-4 py-1.5 text-xs border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

interface OrdersProps { onNavigate: (page: string) => void; }

export default function Orders({ onNavigate }: OrdersProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const PER = 7;

  const statuses = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filtered = allOrders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((page - 1) * PER, page * PER);
  const totalRevenue = filtered.reduce((s, o) => {
    const sub = o.items.reduce((ss, i) => ss + i.qty * i.price, 0);
    return s + sub * 1.08;
  }, 0);

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Orders" }]} onNavigate={onNavigate} />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: allOrders.length, color: "bg-orange-600" },
          { label: "Processing", value: allOrders.filter(o => o.status === "Processing").length, color: "bg-amber-600" },
          { label: "Shipped", value: allOrders.filter(o => o.status === "Shipped").length, color: "bg-amber-500" },
          { label: "Delivered", value: allOrders.filter(o => o.status === "Delivered").length, color: "bg-emerald-600" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${card.color} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
              <span className="text-white font-bold text-sm">{card.value}</span>
            </div>
            <div className="text-xs text-slate-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Order ID or customer..."
                className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-3 pr-7 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none appearance-none cursor-pointer">
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{filtered.length} orders · ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
              <Download size={12} /> Export
            </button>
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
                <th className="text-left px-4 py-3 font-semibold">Payment</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => {
                const subtotal = o.items.reduce((s, x) => s + x.qty * x.price, 0);
                const total = subtotal * 1.08;
                return (
                  <tr key={o.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 ? "bg-slate-50/30" : ""}`}>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{o.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-slate-800">{o.customer}</div>
                      <div className="text-[10px] text-slate-400">{o.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{o.date}</td>
                    <td className="px-4 py-3.5 text-right text-xs text-slate-700">{o.items.length}</td>
                    <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">${total.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{o.payment}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center">
                        <button onClick={() => setSelected(o)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER} onChange={setPage} />
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
