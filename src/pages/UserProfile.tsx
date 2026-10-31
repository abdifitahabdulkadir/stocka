import { useState } from "react";
import { Camera, Lock, Shield, Activity, Save, Eye, EyeOff } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";

const activity = [
  { action: "Logged in", time: "Jul 28, 2026 09:14", device: "Chrome · macOS" },
  { action: "Updated product: Laptop Pro 15", time: "Jul 27, 2026 16:30", device: "Chrome · macOS" },
  { action: "Created PO-4421", time: "Jul 26, 2026 11:00", device: "Chrome · macOS" },
  { action: "Exported sales report", time: "Jul 24, 2026 14:22", device: "Safari · iPhone" },
  { action: "Updated settings", time: "Jul 23, 2026 10:15", device: "Chrome · macOS" },
];

interface UserProfileProps { onNavigate: (page: string) => void; }

export default function UserProfile({ onNavigate }: UserProfileProps) {
  const [tab, setTab] = useState<"profile" | "security" | "activity">("profile");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "Maryan Abdulaziz", email: "maryan@stocka.io",
    phone: "+252 61 555 0198", department: "Executive",
    bio: "System administrator and inventory manager for stocka.",
  });
  const { toast } = useToast();

  const handleSave = () => {
    setSaved(true);
    toast("success", "Profile updated");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Profile" }]} onNavigate={onNavigate} />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">MA</div>
            <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-orange-600 shadow-sm transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">Maryan Abdulaziz</h2>
            <p className="text-sm text-slate-500">maryan@stocka.io</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="danger">Admin</Badge>
              <Badge variant="success" dot>Active</Badge>
              <span className="text-xs text-slate-400">Member since Jan 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(["profile", "security", "activity"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${t === tab ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "security" ? <Lock size={13} /> : t === "activity" ? <Activity size={13} /> : null}
            {t === "profile" ? "Profile Info" : t === "security" ? "Security" : "Activity Log"}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name", key: "name", type: "text" },
              { label: "Email Address", key: "email", type: "email" },
              { label: "Phone Number", key: "phone", type: "tel" },
              { label: "Department", key: "department", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <input type={type} value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${saved ? "bg-emerald-600 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"}`}>
              <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Change Password</h3>
            {[
              { label: "Current Password", placeholder: "••••••••" },
              { label: "New Password", placeholder: "Min. 8 characters" },
              { label: "Confirm New Password", placeholder: "Match new password" },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder={placeholder}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
            <button className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors">Update Password</button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-800">Two-Factor Authentication</h3>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">Your account is protected with 2FA via authenticator app.</p>
            <button className="px-4 py-2 text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">Manage 2FA</button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Active Sessions</h3>
            {[
              { device: "Chrome on macOS Sonoma", location: "San Francisco, CA", time: "Active now", current: true },
              { device: "Safari on iPhone 15", location: "San Francisco, CA", time: "2 hours ago", current: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{s.device}</div>
                  <div className="text-[10px] text-slate-400">{s.location} · {s.time}</div>
                </div>
                {s.current ? <Badge variant="success" dot>Current</Badge> : (
                  <button className="text-xs text-red-600 font-semibold hover:text-red-700">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                  <Activity size={13} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-800">{a.action}</div>
                  <div className="text-[10px] text-slate-400">{a.device}</div>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
