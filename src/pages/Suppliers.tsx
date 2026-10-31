import { useState } from "react";
import { Search, Plus, Globe, ChevronDown, X, Mail, Clock } from "lucide-react";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import { useApi, post } from "../lib/api";

interface Supplier {
  id: number; code: string; name: string; contact: string; email: string; phone: string; country: string;
  lead_days: number; status: "Preferred" | "Active" | "Suspended"; products: number;
}

const leadLabel = (days: number) => `${days} day${days === 1 ? "" : "s"}`;

const statusVariant: Record<string, "blue" | "success" | "danger"> = {
  Preferred: "blue", Active: "success", Suspended: "danger",
};

function SupplierDetailModal({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">{supplier.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{supplier.code}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            ["Contact Person", supplier.contact],
            ["Email", supplier.email],
            ["Country", supplier.country],
            ["Products Supplied", supplier.products],
            ["Lead Time", leadLabel(supplier.lead_days)],
            ["Status", supplier.status],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-semibold text-slate-800">{String(value)}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">Close</button>
          <button className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors">Create PO</button>
        </div>
      </div>
    </div>
  );
}

interface SupplierFormData {
  name: string; contact: string; email: string; country: string; lead: string; status: "Preferred" | "Active" | "Suspended";
}

function CreateSupplierModal({ onClose, onSave }: { onClose: () => void; onSave: (s: Omit<SupplierFormData, "lead"> & { lead_days: number }) => Promise<void> }) {
  const [form, setForm] = useState<SupplierFormData>({
    name: "", contact: "", email: "", country: "", lead: "7", status: "Active",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

  const validate = () => {
    const e: Partial<SupplierFormData> = {};
    if (!form.name.trim()) e.name = "Company name is required";
    if (!form.contact.trim()) e.contact = "Contact name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.country.trim()) e.country = "Country is required";
    if (form.lead.trim() && !/^\d+$/.test(form.lead.trim())) e.lead = "Enter a number of days";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave({
        name: form.name, contact: form.contact, email: form.email,
        country: form.country, lead_days: form.lead.trim() ? Number(form.lead) : 7, status: form.status,
      });
    } finally { setSaving(false); }
  };

  const Field = ({ label, k, type = "text", placeholder, icon: Icon }: { label: string; k: keyof SupplierFormData; type?: string; placeholder: string; icon?: React.ElementType }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        <input type={type} value={form[k] as string} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 ${errors[k] ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
      </div>
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Add New Supplier</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Company Name *" k="name" placeholder="e.g. TechDistrib Global" icon={Globe} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Person *" k="contact" placeholder="Alan Park" />
            <Field label="Email *" k="email" type="email" placeholder="contact@supplier.com" icon={Mail} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country *" k="country" placeholder="USA" icon={Globe} />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lead Time (days)</label>
              <div className="relative">
                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input inputMode="numeric" value={form.lead} onChange={e => setForm(f => ({ ...f, lead: e.target.value }))}
                  placeholder="7"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 ${errors.lead ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
              </div>
              {errors.lead && <p className="text-xs text-red-500 mt-1">{errors.lead}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(["Active", "Preferred", "Suspended"] as const).map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-colors ${form.status === s
                    ? s === "Preferred" ? "border-orange-500 bg-orange-50 text-orange-700"
                    : s === "Active" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-sm">
            {saving ? "Saving..." : "Add Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const { data, loading, error, reload } = useApi<Supplier[]>("/api/suppliers");
  const suppliers = data ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const statuses = ["All", "Preferred", "Active", "Suspended"];
  const filtered = suppliers.filter(s =>
    (statusFilter === "All" || s.status === statusFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (s: Omit<SupplierFormData, "lead"> & { lead_days: number }) => {
    try {
      await post("/api/suppliers", s);
      setCreating(false);
      reload();
      toast("success", "Supplier added", s.name);
    } catch (err) {
      toast("error", "Could not add supplier", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <div className="p-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search suppliers..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-3 pr-7 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none appearance-none cursor-pointer">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold">Supplier</th>
              <th className="text-left px-4 py-3 font-semibold">Contact</th>
              <th className="text-left px-4 py-3 font-semibold">Country</th>
              <th className="text-right px-4 py-3 font-semibold">Products</th>
              <th className="text-left px-4 py-3 font-semibold">Lead Time</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-center px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-800 text-xs">{s.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{s.code}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs font-medium text-slate-700">{s.contact}</div>
                  <div className="text-[10px] text-slate-400">{s.email}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Globe size={11} className="text-slate-400" />{s.country}
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-xs font-semibold text-slate-900">{s.products}</td>
                <td className="px-4 py-4 text-xs text-slate-600">{leadLabel(s.lead_days)}</td>
                <td className="px-4 py-4">
                  <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center gap-1.5">
                    <button onClick={() => setSelected(s)}
                      className="px-3 py-1.5 text-xs text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-md font-medium transition-colors">
                      View
                    </button>
                    <button className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-md font-medium transition-colors">
                      PO
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                {loading ? "Loading suppliers..." : error ? <span className="text-red-500">{error}</span> : "No suppliers found"}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <SupplierDetailModal supplier={selected} onClose={() => setSelected(null)} />}
      {creating && <CreateSupplierModal onClose={() => setCreating(false)} onSave={handleCreate} />}
    </div>
  );
}
