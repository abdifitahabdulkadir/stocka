import { useState } from "react";
import { Lock, Save, Eye, EyeOff } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import { updateMe, changePassword } from "../lib/auth";
import { useUser, initials } from "../lib/UserContext";

interface UserProfileProps { onNavigate: (page: string) => void; }

const inputClass = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400";

export default function UserProfile({ onNavigate }: UserProfileProps) {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [tab, setTab] = useState<"profile" | "security">("profile");

  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      setUser(await updateMe(name));
      toast("success", "Profile updated");
    } catch (e) {
      toast("error", "Could not update profile", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setPwError("");
    if (pw.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pw.next !== pw.confirm) { setPwError("New passwords don't match."); return; }
    setPwSaving(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      toast("success", "Password updated");
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Profile" }]} onNavigate={onNavigate} />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">{initials(user)}</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{user.name || user.email}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.role === "admin" ? "danger" : "neutral"}>{user.role === "admin" ? "Admin" : "Staff"}</Badge>
              <Badge variant="success" dot>Active</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(["profile", "security"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${t === tab ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "security" && <Lock size={13} />}
            {t === "profile" ? "Profile Info" : "Security"}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input value={user.email} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={saveProfile} disabled={saving || name === user.name}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white transition-colors">
              <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Change Password</h3>
          {([
            { label: "Current Password", key: "current", placeholder: "••••••••" },
            { label: "New Password", key: "next", placeholder: "Min. 8 characters" },
            { label: "Confirm New Password", key: "confirm", placeholder: "Match new password" },
          ] as const).map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder={placeholder} value={pw[key]}
                  onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          {pwError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</div>}
          <button onClick={savePassword} disabled={pwSaving || !pw.current || !pw.next}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
}
