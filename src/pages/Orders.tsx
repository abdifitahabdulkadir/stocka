import { useState } from "react";
import { useApi, patch } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { Search, Eye, X, ChevronDown, Download } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";

interface Order {
  id: number; code: string; customer: string | null; customer_id: number | null;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled"; source: "order" | "pos";
  total: number; items: number; created_at: string;
}
interface OrderLine { id: number; product_id: number | null; name: string; qty: number; unit_price: number; }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const statusVariant: Record<string, "success" | "blue" | "purple" | "danger" | "neutral"> = {
  Delivered: "success", Processing: "blue", Shipped: "purple", Cancelled: "danger",
};

function OrderDetailModal({ order, onClose, onChanged }: { order: Order; onClose: () => void; onChanged: () => void }) {
  const { data, loading, error } = useApi<Order & { lines: OrderLine[] }>(`/api/orders/${order.id}`);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const lines = data?.lines ?? [];
  const status = data?.status ?? order.status;

  const setStatus = async (next: Order["status"]) => {
    setSaving(true);
    try {
      await patch(`/api/orders/${order.id}`, { status: next });
      toast("success", next === "Cancelled" ? "Order cancelled" : `Order marked ${next.toLowerCase()}`, next === "Cancelled" ? "Items returned to stock" : order.code);
      onChanged();
      onClose();
    } catch (err) {
      toast("error", "Could not update order", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900">{order.code}</h2>
              <Badge variant={statusVariant[status]}>{status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{fmtDate(order.created_at)} · {order.source === "pos" ? "POS sale" : "Order"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">Customer</p>
            <p className="text-sm font-semibold text-slate-900">{order.customer ?? "Walk-in customer"}</p>
          </div>

          {loading && <p className="text-xs text-slate-400 py-6 text-center">Loading items...</p>}
          {error && <p className="text-xs text-red-500 py-6 text-center">{error}</p>}
          {data && (
            <>
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
                  {lines.map(item => (
                    <tr key={item.id} className="border-b border-slate-50">
                      <td className="py-2.5 font-medium text-slate-800">{item.name}</td>
                      <td className="py-2.5 text-right text-slate-600">{item.qty}</td>
                      <td className="py-2.5 text-right text-slate-600">${item.unit_price.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">${(item.qty * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total</span><span className="text-orange-700">${data.total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            {status === "Processing" && (
              <button disabled={saving} onClick={() => setStatus("Shipped")} className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-60">Mark Shipped</button>
            )}
            {status === "Shipped" && (
              <button disabled={saving} onClick={() => setStatus("Delivered")} className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60">Mark Delivered</button>
            )}
            {status !== "Cancelled" && status !== "Delivered" && (
              <button disabled={saving} onClick={() => setStatus("Cancelled")} className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-60">Cancel</button>
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
  const { data, loading, error, reload } = useApi<Order[]>("/api/orders");
  const allOrders = data ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const PER = 7;

  const statuses = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filtered = allOrders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.code.toLowerCase().includes(search.toLowerCase()) || (o.customer ?? "walk-in customer").toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((page - 1) * PER, page * PER);
  const totalRevenue = filtered.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

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
                <th className="text-left px-4 py-3 font-semibold">Channel</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => {
                return (
                  <tr key={o.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 ? "bg-slate-50/30" : ""}`}>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{o.code}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-slate-800">{o.customer ?? "Walk-in customer"}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3.5 text-right text-xs text-slate-700">{o.items}</td>
                    <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{o.source === "pos" ? "POS" : "Order"}</td>
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
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                  {loading ? "Loading orders..." : error ? <span className="text-red-500">{error}</span> : "No orders found"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER} onChange={setPage} />
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </div>
  );
}
