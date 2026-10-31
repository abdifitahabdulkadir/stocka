import { useState } from "react";
import { Plus, Search, Eye, X, ChevronDown, Download, Trash2 } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import { useToast } from "../components/ui/Toast";
import { del, patch, post, useApi, withQuery } from "../lib/api";
import { Skeleton, TableSkeleton } from "../components/ui/Skeleton";

interface SupplierOption { id: number; name: string; }
interface ProductOption { id: number; name: string; cost: number; }
interface PO {
  id: number; code: string; supplier_id: number | null; supplier: string | null; status: string;
  expected_date: string | null; note: string; created_at: string; items: number; total: number;
}
interface POLine { id: number; product_id: number; product: string; sku: string; qty: number; unit_cost: number; }
interface NewPOLine { product_id: number | ""; qty: number; cost: number; }
interface NewPO {
  supplier_id: number; status: "Draft" | "Sent"; expected_date: string; note: string;
  items: { product_id: number; qty: number; unit_cost: number }[];
}

const fmtDate = (d: string | null) =>
  d ? new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function CreatePOModal({ suppliers, products, saving, onClose, onSave }: {
  suppliers: SupplierOption[];
  products: ProductOption[];
  saving: boolean;
  onClose: () => void;
  onSave: (po: NewPO) => void;
}) {
  const [supplier, setSupplier] = useState("");
  const [expected, setExpected] = useState("");
  const [lines, setLines] = useState<NewPOLine[]>([{ product_id: "", qty: 1, cost: 0 }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addLine = () => setLines(l => [...l, { product_id: "", qty: 1, cost: 0 }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<NewPOLine>) => setLines(l => l.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const total = lines.reduce((s, l) => s + l.qty * l.cost, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!supplier) e.supplier = "Select a supplier";
    if (!expected) e.expected = "Set expected delivery";
    if (!lines.some(l => l.product_id && l.qty > 0)) e.items = "Add at least one item";
    return e;
  };

  const handleSave = (status: "Draft" | "Sent") => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      supplier_id: Number(supplier), status, expected_date: expected, note: "",
      items: lines.filter(l => l.product_id && l.qty > 0).map(l => ({ product_id: Number(l.product_id), qty: l.qty, unit_cost: l.cost })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Create Purchase Order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Supplier *</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}
                className={`w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white ${errors.supplier ? "border-red-400" : "border-slate-200"}`}>
                <option value="">Select supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.supplier && <p className="text-xs text-red-500 mt-1">{errors.supplier}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Delivery *</label>
              <input type="date" value={expected} onChange={e => setExpected(e.target.value)}
                className={`w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.expected ? "border-red-400" : "border-slate-200"}`} />
              {errors.expected && <p className="text-xs text-red-500 mt-1">{errors.expected}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Line Items *</label>
              <button onClick={addLine} className="text-xs text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1">
                <Plus size={12} /> Add item
              </button>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={line.product_id} onChange={e => {
                    const p = products.find(x => String(x.id) === e.target.value);
                    update(i, { product_id: p ? p.id : "", cost: p ? p.cost : 0 });
                  }}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} value={line.qty} onChange={e => update(i, { qty: Number(e.target.value) })}
                    placeholder="Qty"
                    className="w-16 text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                  <input type="number" min={0} step={0.01} value={line.cost} onChange={e => update(i, { cost: Number(e.target.value) })}
                    placeholder="Cost"
                    className="w-20 text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                  <span className="text-xs font-semibold text-slate-700 w-16 text-right">${(line.qty * line.cost).toFixed(2)}</span>
                  <button onClick={() => removeLine(i)} disabled={lines.length === 1}
                    className="text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-sm font-bold text-orange-700">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-800">Cancel</button>
          <button onClick={() => handleSave("Draft")} disabled={saving} className="px-4 py-2 text-sm border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors disabled:opacity-60">
            Save Draft
          </button>
          <button onClick={() => handleSave("Sent")} disabled={saving} className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-60">
            {saving ? "Saving..." : "Create & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

const statusVariant: Record<string, "success" | "blue" | "purple" | "warning" | "danger"> = {
  Received: "success", Sent: "blue", Draft: "warning", Cancelled: "danger",
};

interface PODetailProps {
  po: PO;
  busy: boolean;
  onClose: () => void;
  onSend: () => void;
  onReceive: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function PODetail({ po, busy, onClose, onSend, onReceive, onCancel, onDelete }: PODetailProps) {
  const detail = useApi<PO & { lines: POLine[] }>(`/api/purchase-orders/${po.id}`);
  const lines = detail.data?.lines ?? [];
  const open = po.status === "Draft" || po.status === "Sent";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900">{po.code}</h2>
              <Badge variant={statusVariant[po.status]}>{po.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{po.supplier ?? "Unknown supplier"} · Ordered {fmtDate(po.created_at)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">EXPECTED DELIVERY</p>
              <p className="text-xs font-semibold text-slate-800">{fmtDate(po.expected_date)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">ORDER TOTAL</p>
              <p className="text-xs font-bold text-orange-700">${po.total.toLocaleString()}</p>
            </div>
          </div>
          {detail.loading && (
            <div className="space-y-3 py-2" role="status" aria-label="Loading">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/5" /><Skeleton className="h-2.5 w-1/4" /></div>
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          )}
          {detail.error && <p className="text-xs text-red-600 py-4 text-center">{detail.error}</p>}
          {!detail.loading && !detail.error && (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500 font-semibold">Product</th>
                  <th className="text-right py-2 text-slate-500 font-semibold">Qty</th>
                  <th className="text-right py-2 text-slate-500 font-semibold">Unit Cost</th>
                  <th className="text-right py-2 text-slate-500 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(item => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{item.product}</td>
                    <td className="py-2.5 text-right text-slate-600">{item.qty}</td>
                    <td className="py-2.5 text-right text-slate-600">${item.unit_cost.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">${(item.qty * item.unit_cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          {po.status !== "Received" && <button onClick={onDelete} disabled={busy} className="mr-auto px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium disabled:opacity-60">Delete</button>}
          {open && <button onClick={onCancel} disabled={busy} className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-60">Cancel Order</button>}
          {po.status === "Sent" && <button onClick={onReceive} disabled={busy} className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60">Mark Received</button>}
          {po.status === "Draft" && <>
            <button onClick={onReceive} disabled={busy} className="px-3 py-1.5 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold disabled:opacity-60">Mark Received</button>
            <button onClick={onSend} disabled={busy} className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-60">Send Order</button>
          </>}
          <button onClick={onClose} className="px-4 py-1.5 text-xs border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

interface PurchaseOrdersProps { onNavigate: (page: string) => void; }

export default function PurchaseOrders({ onNavigate }: PurchaseOrdersProps) {
  const orders = useApi<PO[]>(withQuery("/api/purchase-orders", {}));
  const suppliers = useApi<SupplierOption[]>("/api/suppliers");
  const products = useApi<ProductOption[]>("/api/products");
  const pos = orders.data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<PO | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const PER = 6;

  const statuses = ["All", "Draft", "Sent", "Received", "Cancelled"];
  const filtered = pos.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.code.toLowerCase().includes(search.toLowerCase()) || (o.supplier ?? "").toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice((page - 1) * PER, page * PER);

  /** Runs a mutation, then refreshes the list; keeps the detail modal in sync with the returned order. */
  const run = async (action: () => Promise<PO | { ok: boolean }>, success: string, closeDetail = false) => {
    setBusy(true);
    try {
      const result = await action();
      toast("success", success);
      orders.reload();
      products.reload();
      if (closeDetail) setSelected(null);
      else if ("code" in result) setSelected(result);
      return true;
    } catch (e) {
      toast("error", "Action failed", e instanceof Error ? e.message : undefined);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (po: NewPO) => {
    setBusy(true);
    try {
      const created = await post<PO>("/api/purchase-orders", po);
      toast("success", "Purchase order created", created.code);
      setCreating(false);
      orders.reload();
    } catch (e) {
      toast("error", "Could not create purchase order", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Suppliers", page: "suppliers" }, { label: "Purchase Orders" }]} onNavigate={onNavigate} />

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total POs", value: pos.length, color: "bg-orange-600" },
          { label: "Draft", value: pos.filter(p => p.status === "Draft").length, color: "bg-amber-500" },
          { label: "Sent", value: pos.filter(p => p.status === "Sent").length, color: "bg-amber-600" },
          { label: "Received", value: pos.filter(p => p.status === "Received").length, color: "bg-emerald-600" },
          { label: "Total Value", value: `$${pos.filter(p => p.status !== "Cancelled").reduce((s, p) => s + p.total, 0).toLocaleString()}`, color: "bg-slate-700" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${c.color} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
              <span className="text-white font-bold text-xs">{typeof c.value === "number" ? c.value : "$"}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{c.value}</div>
              <div className="text-[10px] text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="PO number or supplier..."
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
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">
              <Download size={12} /> Export
            </button>
            <button onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
              <Plus size={13} /> New PO
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">PO Number</th>
                <th className="text-left px-4 py-3 font-semibold">Supplier</th>
                <th className="text-left px-4 py-3 font-semibold">Order Date</th>
                <th className="text-left px-4 py-3 font-semibold">Expected</th>
                <th className="text-right px-4 py-3 font-semibold">Units</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.loading && !orders.data && <TableSkeleton rows={6} cols={8} />}
              {orders.error && <tr><td colSpan={8} className="px-5 py-10 text-center text-xs text-red-600">{orders.error}</td></tr>}
              {!orders.loading && !orders.error && paginated.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-xs text-slate-400">{pos.length === 0 ? "No purchase orders yet. Create one with New PO." : "No purchase orders match your filters."}</td></tr>
              )}
              {paginated.map((po, i) => (
                <tr key={po.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{po.code}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">{po.supplier ?? "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate(po.created_at)}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate(po.expected_date)}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-slate-700">{po.items}</td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">${po.total.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={statusVariant[po.status]}>{po.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <button onClick={() => setSelected(po)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER} onChange={setPage} />
      </div>

      {selected && (
        <PODetail po={selected} busy={busy} onClose={() => setSelected(null)}
          onSend={() => run(() => patch<PO>(`/api/purchase-orders/${selected.id}`, { status: "Sent" }), "Purchase order sent")}
          onReceive={() => run(() => post<PO>(`/api/purchase-orders/${selected.id}/receive`), "Stock received", false)}
          onCancel={() => run(() => patch<PO>(`/api/purchase-orders/${selected.id}`, { status: "Cancelled" }), "Purchase order cancelled")}
          onDelete={() => run(() => del(`/api/purchase-orders/${selected.id}`), "Purchase order deleted", true)} />
      )}
      {creating && (
        <CreatePOModal suppliers={suppliers.data ?? []} products={products.data ?? []} saving={busy}
          onClose={() => setCreating(false)} onSave={handleCreate} />
      )}
    </div>
  );
}
