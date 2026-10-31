import { useState } from "react";
import { Search, Plus, Edit2, Trash2, X, Mail, Phone, Building2, MapPin } from "lucide-react";
import { customers as initialCustomers } from "../data/mockData";
import { useToast } from "../components/ui/Toast";

type Customer = typeof initialCustomers[0];

const statusStyle: Record<string, string> = {
  Active: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Inactive: "text-slate-500 bg-slate-100 border-slate-200",
};

interface CustomerFormData {
  name: string; email: string; phone: string; city: string; status: "Active" | "Inactive";
}

function CustomerFormModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (c: Customer) => void;
}) {
  const isEdit = !!customer;
  const [form, setForm] = useState<CustomerFormData>({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    city: customer?.city ?? "",
    status: (customer?.status as "Active" | "Inactive") ?? "Active",
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validate = () => {
    const e: Partial<CustomerFormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      id: customer?.id ?? `CUS-${Math.floor(Math.random() * 900 + 100)}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      orders: customer?.orders ?? 0,
      spent: customer?.spent ?? 0,
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{isEdit ? "Edit Customer" : "Add New Customer"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company / Full Name *</label>
            <div className="relative">
              <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Nova Retail Ltd"
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="contact@company.com"
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 ${errors.email ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="San Francisco"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(["Active", "Inactive"] as const).map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-colors ${form.status === s ? s === "Active" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-400 bg-slate-100 text-slate-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-800">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow-sm">
            {isEdit ? "Save Changes" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null | "new">(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (c: Customer) => {
    setCustomers(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]);
    setEditing(null);
    toast("success", editing === "new" ? "Customer added" : "Customer updated", c.name);
  };

  const handleDelete = (id: string) => {
    const name = customers.find(c => c.id === id)?.name;
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
    toast("success", "Customer deleted", name);
  };

  return (
    <div className="p-7 h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} customers</span>
        </div>
        <button onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">City</th>
                <th className="text-right px-4 py-3 font-semibold">Orders</th>
                <th className="text-right px-4 py-3 font-semibold">Spent</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-t border-slate-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-800 text-xs">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{c.email}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{c.city}</td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-800">{c.orders}</td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-slate-900">${c.spent.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusStyle[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setEditing(c)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <CustomerFormModal
          customer={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Delete Customer?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
