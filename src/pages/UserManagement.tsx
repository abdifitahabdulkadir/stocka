import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Shield, UserCheck } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";

const roles = ["Admin", "Staff"];

const rolePermissions: Record<string, string[]> = {
  Admin: ["Full system access", "Manage users", "All reports", "System settings"],
  Staff: ["View products", "Process sales", "Stock in/out", "Basic reports"],
};


const initialUsers = [
  { id: "USR-001", name: "Maryan Abdulaziz", email: "maryan@stocka.io", role: "Admin", department: "Executive", lastLogin: "Jul 28, 2026 09:14", status: "Active", avatar: "MA" },
  { id: "USR-002", name: "Sarah Mitchell", email: "s.mitchell@stocka.io", role: "Staff", department: "Operations", lastLogin: "Jul 27, 2026 16:42", status: "Active", avatar: "SM" },
  { id: "USR-003", name: "Carlos Rivera", email: "c.rivera@stocka.io", role: "Staff", department: "Warehouse", lastLogin: "Jul 26, 2026 11:05", status: "Active", avatar: "CR" },
  { id: "USR-004", name: "Emily Chen", email: "e.chen@stocka.io", role: "Staff", department: "Sales", lastLogin: "Jul 25, 2026 14:30", status: "Active", avatar: "EC" },
  { id: "USR-005", name: "Marcus Webb", email: "m.webb@stocka.io", role: "Staff", department: "Finance", lastLogin: "Jul 20, 2026 09:00", status: "Inactive", avatar: "MW" },
  { id: "USR-006", name: "Priya Sharma", email: "p.sharma@stocka.io", role: "Staff", department: "Purchasing", lastLogin: "Jul 27, 2026 10:15", status: "Active", avatar: "PS" },
];

const avatarColors = ["bg-orange-600", "bg-amber-600", "bg-emerald-600", "bg-amber-500", "bg-slate-500", "bg-slate-600"];

type User = typeof initialUsers[0];

function UserModal({ user, onClose, onSave }: { user: Partial<User> | null; onClose: () => void; onSave: (u: User) => void }) {
  const isNew = !user?.id;
  const [form, setForm] = useState<Partial<User>>(user || { role: "Staff", status: "Active" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{isNew ? "Invite User" : "Edit User"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
              <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="Jane Smith" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="jane@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <select value={form.role || "Staff"} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
              <input value={form.department || ""} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                placeholder="e.g. Operations" />
            </div>
          </div>
          {form.role && (
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-700 mb-1.5">{form.role} Permissions</p>
              <ul className="space-y-1">
                {(rolePermissions[form.role] || []).map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-orange-600">
                    <UserCheck size={11} /> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-800">Cancel</button>
          <button onClick={() => form.name && form.email && onSave({
            id: form.id || `USR-${Date.now().toString().slice(-3)}`,
            name: form.name!, email: form.email!, role: form.role || "Staff",
            department: form.department || "General", lastLogin: "Never",
            status: "Active", avatar: form.name!.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          })}
            className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow-sm">
            {isNew ? "Send Invite" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface UserManagementProps { onNavigate: (page: string) => void; }

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; user: Partial<User> | null }>({ open: false, user: null });
  const [delId, setDelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const { toast } = useToast();

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (u: User) => {
    setUsers(prev => prev.some(x => x.id === u.id) ? prev.map(x => x.id === u.id ? u : x) : [u, ...prev]);
    setModal({ open: false, user: null });
    toast("success", modal.user?.id ? "User updated" : "Invite sent");
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "User Management" }]} onNavigate={onNavigate} />

      <div className="flex gap-1 border-b border-slate-200">
        {(["users", "roles"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${t === activeTab ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "users" ? "Users & Access" : "Roles & Permissions"}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <span className="text-xs text-slate-500">{filtered.length} users</span>
            </div>
            <button onClick={() => setModal({ open: true, user: {} })}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              <Plus size={15} /> Invite User
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Department</th>
                  <th className="text-left px-4 py-3 font-semibold">Last Login</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-center px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className={`border-t border-slate-50 hover:bg-orange-50/20 transition-colors ${i % 2 ? "bg-slate-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {u.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-slate-400" />
                        <Badge variant={u.role === "Admin" ? "danger" : "neutral"}>{u.role}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{u.department}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{u.lastLogin}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.status === "Active" ? "success" : "neutral"} dot>{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setModal({ open: true, user: u })}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => u.id !== "USR-001" && setDelId(u.id)} disabled={u.id === "USR-001"}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-2 gap-4">
          {roles.map((role, i) => (
            <div key={role} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${["bg-red-100", "bg-slate-100"][i]}`}>
                    <Shield size={16} className={["text-red-600", "text-slate-600"][i]} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{role}</div>
                    <div className="text-xs text-slate-400">{users.filter(u => u.role === role).length} users</div>
                  </div>
                </div>
                <Badge variant={role === "Admin" ? "danger" : "neutral"}>{role}</Badge>
              </div>
              <ul className="space-y-1.5">
                {rolePermissions[role].map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {modal.open && <UserModal user={modal.user} onClose={() => setModal({ open: false, user: null })} onSave={handleSave} />}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-4 border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="font-semibold text-slate-900 mb-1">Remove User?</h3>
            <p className="text-sm text-slate-500 mb-5">The user will lose access immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 px-4 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
              <button onClick={() => { setUsers(u => u.filter(x => x.id !== delId)); setDelId(null); toast("success", "User removed"); }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
