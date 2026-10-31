import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Shield, UserCheck } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import { useApi, post, patch, del } from "../lib/api";
import { useUser, initials } from "../lib/UserContext";
import { TableSkeleton } from "../components/ui/Skeleton";

const roles = ["admin", "staff"] as const;
const roleLabel = (r: string) => r.charAt(0).toUpperCase() + r.slice(1);

const rolePermissions: Record<string, string[]> = {
  admin: ["Full system access", "Manage users", "All reports", "System settings"],
  staff: ["View products", "Process sales", "Stock in/out", "Basic reports"],
};

const avatarColors = ["bg-orange-600", "bg-amber-600", "bg-emerald-600", "bg-amber-500", "bg-slate-500", "bg-slate-600"];

interface ManagedUser {
  id: number;
  code: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  status: "active" | "inactive";
  department: string;
  last_login_at: string | null;
}

const formatLogin = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";

interface FormState { name: string; email: string; role: string; department: string; status: string; password: string }

function UserModal({ user, onClose, onSaved }: { user: Partial<ManagedUser> | null; onClose: () => void; onSaved: (isNew: boolean) => void }) {
  const isNew = !user?.id;
  const [form, setForm] = useState<FormState>({
    name: user?.name || "", email: user?.email || "", role: user?.role || "staff",
    department: user?.department || "", status: user?.status || "active", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (!form.email || (isNew && !form.password)) { setError(isNew ? "Email and a starting password are required." : "Email is required."); return; }
    setSaving(true);
    try {
      if (isNew) {
        await post("/api/users", { name: form.name, email: form.email, role: form.role, department: form.department, password: form.password });
      } else {
        await patch(`/api/users/${user!.id}`, {
          name: form.name, role: form.role, status: form.status, department: form.department,
          ...(form.password ? { password: form.password } : {}),
        });
      }
      onSaved(isNew);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  };

  const input = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{isNew ? "Add User" : "Edit User"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={input} placeholder="Jane Smith" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input type="email" value={form.email} disabled={!isNew} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={`${input} disabled:bg-slate-50 disabled:text-slate-500`} placeholder="jane@company.com" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{isNew ? "Starting Password *" : "Reset Password"}</label>
              <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={input}
                placeholder={isNew ? "Min. 8 characters — share it with them" : "Leave blank to keep the current password"} autoComplete="off" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                {roles.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={input} placeholder="e.g. Operations" />
            </div>
            {!isNew && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive (cannot sign in)</option>
                </select>
              </div>
            )}
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-700 mb-1.5">{roleLabel(form.role)} Permissions</p>
            <ul className="space-y-1">
              {(rolePermissions[form.role] || []).map(p => (
                <li key={p} className="flex items-center gap-2 text-xs text-orange-600"><UserCheck size={11} /> {p}</li>
              ))}
            </ul>
          </div>
          {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-800">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-sm">
            {saving ? "Saving..." : isNew ? "Create User" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface UserManagementProps { onNavigate: (page: string) => void; }

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const { user: me } = useUser();
  const { data, loading, error, reload } = useApi<ManagedUser[]>("/api/users");
  const users = data ?? [];
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; user: Partial<ManagedUser> | null }>({ open: false, user: null });
  const [delUser, setDelUser] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const { toast } = useToast();

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSaved = (isNew: boolean) => {
    setModal({ open: false, user: null });
    reload();
    toast("success", isNew ? "User created" : "User updated");
  };

  const handleDelete = async () => {
    if (!delUser) return;
    setDeleting(true);
    try {
      await del(`/api/users/${delUser.id}`);
      toast("success", "User removed");
      reload();
    } catch (e) {
      toast("error", "Could not remove user", e instanceof Error ? e.message : undefined);
    } finally {
      setDeleting(false);
      setDelUser(null);
    }
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
              <Plus size={15} /> Add User
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
                {loading && !data && <TableSkeleton rows={5} cols={6} />}
                {error && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-red-500">{error}</td></tr>}
                {!loading && !error && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No users found.</td></tr>}
                {filtered.map((u, i) => (
                  <tr key={u.id} className={`border-t border-slate-50 hover:bg-orange-50/20 transition-colors ${i % 2 ? "bg-slate-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials(u)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{u.name || u.email}{u.id === me.id && <span className="ml-1.5 text-[10px] font-medium text-slate-400">(you)</span>}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-slate-400" />
                        <Badge variant={u.role === "admin" ? "danger" : "neutral"}>{roleLabel(u.role)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{u.department || "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{formatLogin(u.last_login_at)}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.status === "active" ? "success" : "neutral"} dot>{roleLabel(u.status)}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setModal({ open: true, user: u })}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => setDelUser(u)} disabled={u.id === me.id}
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
                    <div className="font-semibold text-slate-900 text-sm">{roleLabel(role)}</div>
                    <div className="text-xs text-slate-400">{users.filter(u => u.role === role).length} users</div>
                  </div>
                </div>
                <Badge variant={role === "admin" ? "danger" : "neutral"}>{roleLabel(role)}</Badge>
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

      {modal.open && <UserModal user={modal.user} onClose={() => setModal({ open: false, user: null })} onSaved={handleSaved} />}

      {delUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-4 border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="font-semibold text-slate-900 mb-1">Remove User?</h3>
            <p className="text-sm text-slate-500 mb-5">{delUser?.email} will lose access immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelUser(null)} className="flex-1 px-4 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg">{deleting ? "Removing..." : "Remove"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
