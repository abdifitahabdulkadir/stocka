import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Tag, Layers } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";
import { useToast } from "../components/ui/Toast";
import { useApi, post, patch, del } from "../lib/api";

interface Category { id: number; code: string; name: string; description: string; color: string; products: number; icon?: string }

function CategoryModal({ category, saving, onClose, onSave }: {
  category: Partial<Category> | null;
  saving: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const isNew = !category?.id;
  const [form, setForm] = useState<Partial<Category>>(category || { color: "#ea580c" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{isNew ? "Add Category" : "Edit Category"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category Name *</label>
            <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              placeholder="e.g. Electronics" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
              placeholder="Brief description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Icon (emoji)</label>
              <input value={form.icon || ""} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-center text-lg"
                placeholder="💼" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color || "#ea580c"} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                <input value={form.color || "#ea580c"} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-2 focus:outline-none font-mono" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
          <button disabled={saving} onClick={() => form.name && onSave({ name: form.name, description: form.description ?? "", color: form.color || "#ea580c" })}
            className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-sm">
            {saving ? "Saving..." : isNew ? "Add Category" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CategoriesProps { onNavigate: (page: string) => void; }

export default function Categories({ onNavigate }: CategoriesProps) {
  const { data, loading, error, reload } = useApi<Category[]>("/api/categories");
  const categories = data ?? [];
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; cat: Partial<Category> | null }>({ open: false, cat: null });
  const [delId, setDelId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const PER_PAGE = 6;

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = async (body: Record<string, unknown>) => {
    const id = modal.cat?.id;
    setSaving(true);
    try {
      if (id) await patch(`/api/categories/${id}`, body);
      else await post("/api/categories", body);
      toast("success", id ? "Category updated" : "Category added");
      setModal({ open: false, cat: null });
      reload();
    } catch (e) {
      toast("error", "Couldn't save category", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    try {
      await del(`/api/categories/${id}`);
      toast("success", "Category deleted");
      setDelId(null);
      reload();
    } catch (e) {
      toast("error", "Couldn't delete category", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Categories" }]} onNavigate={onNavigate} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search categories..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} categories</span>
        </div>
        <button onClick={() => setModal({ open: true, cat: {} })}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Categories", value: categories.length, icon: Layers, color: "bg-orange-600" },
          { label: "Total Products", value: categories.reduce((s, c) => s + c.products, 0), icon: Tag, color: "bg-amber-600" },
          { label: "Avg Products", value: categories.length ? Math.round(categories.reduce((s, c) => s + c.products, 0) / categories.length) : 0, icon: Tag, color: "bg-emerald-600" },
          { label: "Empty Categories", value: categories.filter(c => c.products === 0).length, icon: Tag, color: "bg-amber-500" },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`${card.color} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{card.value}</div>
                <div className="text-[11px] text-slate-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {paginated.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${cat.color}18` }}>
                  {cat.icon || <Tag size={18} style={{ color: cat.color }} />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{cat.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{cat.code}</div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal({ open: true, cat })}
                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => setDelId(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cat.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-slate-500">{cat.products} products</span>
              </div>
              <button onClick={() => onNavigate("products")}
                className="text-[11px] text-orange-600 font-semibold hover:text-orange-700">View →</button>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className={`col-span-3 text-center py-16 text-sm ${error ? "text-red-500" : "text-slate-400"}`}>
            {loading ? "Loading categories..." : error || "No categories found"}
          </div>
        )}
      </div>

      {filtered.length > PER_PAGE && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}

      {modal.open && <CategoryModal category={modal.cat} saving={saving} onClose={() => setModal({ open: false, cat: null })} onSave={handleSave} />}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-4 border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Delete Category?</h3>
            <p className="text-sm text-slate-500 mb-5">All products will become uncategorised. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 px-4 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
              <button onClick={() => handleDelete(delId)} disabled={saving} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg">{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
