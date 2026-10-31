import { useState } from "react";
import { Search, Plus, Edit2, Trash2, X, ChevronDown } from "lucide-react";
import { useApi, post, patch, del } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { TableSkeleton } from "../components/ui/Skeleton";

const statusStyle: Record<string, string> = {
  "In Stock": "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Low Stock": "text-amber-700 bg-amber-50 border-amber-200",
  "Out of Stock": "text-red-700 bg-red-50 border-red-200",
};

interface Product {
  id: number; code: string; name: string; category: string | null; category_id: number | null; sku: string;
  price: number; cost: number; stock: number; reorder: number; status: string;
}
interface Category { id: number; name: string }

function ProductModal({ product, categories, saving, onClose, onSave }: {
  product: Partial<Product> | null;
  categories: Category[];
  saving: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>(product || {});

  const handleSave = () => {
    if (!form.name || !form.sku) return;
    onSave({
      name: form.name, sku: form.sku, category_id: form.category_id || null,
      price: Number(form.price) || 0, stock: Number(form.stock) || 0, reorder: Number(form.reorder) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{isNew ? "Add New Product" : "Edit Product"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
              <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="e.g. Laptop Pro 15" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">SKU *</label>
              <input value={form.sku || ""} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 font-mono"
                placeholder="LP-15-2024" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select value={form.category_id ?? ""} onChange={e => setForm(f => ({ ...f, category_id: e.target.value ? Number(e.target.value) : null }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-white">
                <option value="">Uncategorised</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price ($)</label>
              <input type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Qty</label>
              <input type="number" value={form.stock ?? ""} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reorder Point</label>
              <input type="number" value={form.reorder ?? ""} onChange={e => setForm(f => ({ ...f, reorder: Number(e.target.value) }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="10" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-sm">
            {saving ? "Saving..." : isNew ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { data, loading, error, reload } = useApi<Product[]>("/api/products");
  const { data: categoryList } = useApi<Category[]>("/api/categories");
  const products = data ?? [];
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; product: Partial<Product> | null }>({ open: false, product: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = ["All", ...(categoryList ?? []).map(c => c.name)];

  const filtered = products.filter(p =>
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async (body: Record<string, unknown>) => {
    const id = modal.product?.id;
    setSaving(true);
    try {
      if (id) await patch(`/api/products/${id}`, body);
      else await post("/api/products", body);
      toast("success", id ? "Product updated" : "Product added");
      setModal({ open: false, product: null });
      reload();
    } catch (e) {
      toast("error", "Couldn't save product", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    try {
      await del(`/api/products/${id}`);
      toast("success", "Product deleted");
      setDeleteId(null);
      reload();
    } catch (e) {
      toast("error", "Couldn't delete product", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-7 h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
          </div>
          <div className="relative">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 appearance-none cursor-pointer">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} products</span>
        </div>
        <button onClick={() => setModal({ open: true, product: {} })}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">Product</th>
                <th className="text-left px-4 py-3 font-semibold">SKU</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Price</th>
                <th className="text-right px-4 py-3 font-semibold">Stock</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-800 text-xs">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{p.category ?? "—"}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900 text-xs">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-right text-xs">
                    <span className={`font-bold ${p.stock === 0 ? "text-red-600" : p.stock <= p.reorder ? "text-amber-600" : "text-slate-800"}`}>
                      {p.stock}
                    </span>
                    <span className="text-slate-400 ml-1">/ {p.reorder}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusStyle[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setModal({ open: true, product: p })}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && !data && <TableSkeleton rows={7} cols={7} />}
              {(error || (filtered.length === 0 && !(loading && !data))) && (
                <tr>
                  <td colSpan={7} className={`text-center py-12 text-sm ${error ? "text-red-500" : "text-slate-400"}`}>
                    {error || "No products found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <ProductModal product={modal.product} categories={categoryList ?? []} saving={saving} onClose={() => setModal({ open: false, product: null })} onSave={handleSave} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
