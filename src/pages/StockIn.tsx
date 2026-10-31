import { useMemo, useState } from "react";
import { Plus, Search, Trash2, PackagePlus, Check } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import { post, useApi, withQuery } from "../lib/api";
import { TableSkeleton } from "../components/ui/Skeleton";

interface ProductOption { id: number; code: string; name: string; sku: string; cost: number; stock: number; }
interface SupplierOption { id: number; name: string; }
interface Movement { id: number; ref: string; product: string; qty: number; unit_cost: number | null; supplier: string | null; note: string; reason: string; user: string | null; created_at: string; }
interface LineItem { product: ProductOption | null; qty: number; cost: number; }

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

interface StockInProps { onNavigate: (page: string) => void; }

export default function StockIn({ onNavigate }: StockInProps) {
  const [tab, setTab] = useState<"new" | "history">("new");
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ product: null, qty: 1, cost: 0 }]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const products = useApi<ProductOption[]>("/api/products");
  const suppliers = useApi<SupplierOption[]>("/api/suppliers");
  const movements = useApi<Movement[]>(withQuery("/api/stock-movements", { type: "in" }));
  const productOptions = products.data ?? [];
  const supplierOptions = suppliers.data ?? [];

  const history = useMemo(() => {
    const groups = new Map<string, { ref: string; date: string; supplier: string; note: string; items: number; total: number; user: string }>();
    for (const m of movements.data ?? []) {
      const g = groups.get(m.ref) ?? { ref: m.ref, date: m.created_at, supplier: m.supplier ?? "—", note: m.note || m.reason || "—", items: 0, total: 0, user: m.user ?? "System" };
      g.items += 1;
      g.total += m.qty * (m.unit_cost ?? 0);
      groups.set(m.ref, g);
    }
    const q = search.trim().toLowerCase();
    return [...groups.values()].filter(h => !q || h.ref.toLowerCase().includes(q) || h.supplier.toLowerCase().includes(q) || h.note.toLowerCase().includes(q));
  }, [movements.data, search]);

  const addLine = () => setLines(l => [...l, { product: null, qty: 1, cost: 0 }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, patch: Partial<LineItem>) => setLines(l => l.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const total = lines.reduce((s, l) => s + (l.qty * l.cost), 0);
  const canSubmit = supplier && lines.some(l => l.product && l.qty > 0);
  const supplierName = supplierOptions.find(s => String(s.id) === supplier)?.name;

  const handleSubmit = async () => {
    const valid = lines.filter(l => l.product && l.qty > 0);
    setSaving(true);
    try {
      await post("/api/stock-movements", {
        type: "in",
        supplier_id: Number(supplier),
        note,
        lines: valid.map(l => ({ product_id: l.product!.id, qty: l.qty, unit_cost: l.cost, reason: "Stock received" })),
      });
      toast("success", "Stock received", `${valid.length} item(s) added to inventory`);
      setSubmitted(true);
      products.reload();
      movements.reload();
      setTimeout(() => {
        setSubmitted(false);
        setLines([{ product: null, qty: 1, cost: 0 }]);
        setSupplier("");
        setNote("");
      }, 2000);
    } catch (e) {
      toast("error", "Could not receive stock", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Inventory", page: "inventory" }, { label: "Stock In" }]} onNavigate={onNavigate} />

      <div className="flex gap-1 border-b border-slate-200">
        {(["new", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${t === tab ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "new" ? "New Stock Entry" : "Received History"}
          </button>
        ))}
      </div>

      {tab === "new" && (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Entry Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reference No.</label>
                  <input value="" readOnly placeholder="Assigned on save"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-400 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Supplier *</label>
                  <select value={supplier} onChange={e => setSupplier(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                    <option value="">Select supplier...</option>
                    {supplierOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
                  <input type="date" defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Warehouse</label>
                  <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                    <option>Main Warehouse</option>
                    <option>East Storage</option>
                    <option>West Storage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Optional notes..."
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Items</h3>
                <button onClick={addLine} className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold hover:text-orange-700">
                  <Plus size={13} /> Add Item
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold">Product</th>
                    <th className="text-right px-4 py-3 font-semibold">Current Stock</th>
                    <th className="text-right px-4 py-3 font-semibold">Qty to Add</th>
                    <th className="text-right px-4 py-3 font-semibold">Unit Cost</th>
                    <th className="text-right px-4 py-3 font-semibold">Subtotal</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-5 py-3">
                        <select value={line.product?.id || ""} onChange={e => {
                          const p = productOptions.find(x => String(x.id) === e.target.value) || null;
                          updateLine(i, { product: p, cost: p?.cost || 0 });
                        }} className="w-full text-xs border border-slate-200 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                          <option value="">Select product...</option>
                          {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500">{line.product?.stock ?? "—"}</td>
                      <td className="px-4 py-3">
                        <input type="number" min={1} value={line.qty} onChange={e => updateLine(i, { qty: Number(e.target.value) })}
                          className="w-20 text-xs border border-slate-200 rounded-md px-2 py-2 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 ml-auto block" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min={0} step={0.01} value={line.cost} onChange={e => updateLine(i, { cost: Number(e.target.value) })}
                          className="w-24 text-xs border border-slate-200 rounded-md px-2 py-2 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 ml-auto block" />
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">
                        ${(line.qty * line.cost).toFixed(2)}
                      </td>
                      <td className="pr-3">
                        <button onClick={() => removeLine(i)} disabled={lines.length === 1}
                          className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-medium text-slate-800">{lines.filter(l => l.product).length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Total Units</span><span className="font-medium text-slate-800">{lines.reduce((s, l) => s + l.qty, 0)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Supplier</span><span className="font-medium text-slate-800 truncate max-w-[120px]">{supplierName || "—"}</span></div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-slate-800">Total Cost</span>
                <span className="text-sm font-bold text-orange-700">${total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!canSubmit || submitted || saving}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
                submitted ? "bg-emerald-600 text-white" : "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
              }`}>
              {submitted ? <><Check size={15} /> Received!</> : <><PackagePlus size={15} /> {saving ? "Saving..." : "Confirm Stock In"}</>}
            </button>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                {["Entry ID", "Date", "Notes", "Supplier", "Items", "Total Cost", "By", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.loading && !movements.data && <TableSkeleton rows={5} cols={8} />}
              {movements.error && <tr><td colSpan={8} className="px-5 py-8 text-center text-xs text-red-600">{movements.error}</td></tr>}
              {!movements.loading && !movements.error && history.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-xs text-slate-400">No stock received yet.</td></tr>
              )}
              {history.map((h, i) => (
                <tr key={h.ref} className={`border-t border-slate-50 hover:bg-orange-50/20 ${i % 2 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{h.ref}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{fmtDate(h.date)}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-700">{h.note}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-700">{h.supplier}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-700">{h.items}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-900">${h.total.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{h.user}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="success">Completed</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
