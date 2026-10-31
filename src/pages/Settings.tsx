import { useState } from "react";
import { Bell, Shield, Database, Globe, Palette, Save } from "lucide-react";

const sections = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Backup", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-orange-600" : "bg-slate-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({
    lowStock: true, newOrder: true, newCustomer: false, reports: true, security: true
  });
  const [general, setGeneral] = useState({
    company: "stocka", timezone: "America/New_York", currency: "USD", language: "English"
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-7 h-full overflow-y-auto">
      <div className="flex gap-6 max-w-5xl">
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === id ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-100"
                }`}>
                <Icon size={15} className={activeSection === id ? "text-orange-600" : "text-slate-400"} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 space-y-5">
          {activeSection === "general" && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">General Settings</h3>
              {[
                { label: "Company Name", key: "company", type: "text" },
                { label: "Timezone", key: "timezone", type: "text" },
                { label: "Default Currency", key: "currency", type: "text" },
                { label: "Language", key: "language", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                  <input type={type}
                    value={general[key as keyof typeof general]}
                    onChange={e => setGeneral(g => ({ ...g, [key]: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Low Stock Threshold</label>
                <input type="number" defaultValue={10}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">Notification Preferences</h3>
              {[
                { key: "lowStock", label: "Low Stock Alerts", desc: "Notify when product stock falls below reorder point" },
                { key: "newOrder", label: "New Order Notifications", desc: "Receive alerts for every incoming order" },
                { key: "newCustomer", label: "New Customer Registration", desc: "Get notified when a new customer registers" },
                { key: "reports", label: "Weekly Reports", desc: "Receive automated weekly performance summaries" },
                { key: "security", label: "Security Alerts", desc: "Alerts for unusual login activity or access attempts" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <Toggle checked={notifs[key as keyof typeof notifs]}
                    onChange={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))} />
                </div>
              ))}
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">Security Settings</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-medium">Two-Factor Authentication is enabled for your account.</p>
              </div>
            </div>
          )}

          {activeSection === "data" && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">Data & Backup</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Last Backup", value: "Jul 27, 2026 — 03:00 AM", color: "bg-emerald-50 border-emerald-200" },
                  { label: "Backup Frequency", value: "Daily (Auto)", color: "bg-orange-50 border-orange-200" },
                  { label: "Storage Used", value: "4.2 GB / 20 GB", color: "bg-slate-50 border-slate-200" },
                  { label: "Records", value: "1,248 products · 6 customers", color: "bg-slate-50 border-slate-200" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-lg border p-4 ${color}`}>
                    <div className="text-xs text-slate-500 mb-1">{label}</div>
                    <div className="text-sm font-semibold text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button className="px-4 py-2 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors">
                  Export All Data
                </button>
                <button className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors">
                  Run Backup Now
                </button>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">Appearance</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Light", "Dark", "System"].map((t, i) => (
                    <button key={t} className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-colors ${i === 0 ? "border-orange-600 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className={`w-10 h-7 rounded-md ${t === "Dark" ? "bg-slate-800" : t === "System" ? "bg-gradient-to-r from-white to-slate-800 border border-slate-200" : "bg-white border border-slate-200"}`} />
                      <span className={`text-xs font-medium ${i === 0 ? "text-orange-700" : "text-slate-600"}`}>{t}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Sidebar Color</label>
                <div className="flex gap-2">
                  {["#0f172a", "#1e3a8a", "#312e81", "#1f2937", "#064e3b"].map(c => (
                    <button key={c} className={`w-8 h-8 rounded-lg border-2 ${c === "#0f172a" ? "border-orange-500" : "border-transparent"} hover:scale-110 transition-transform`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${
                saved ? "bg-emerald-600 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}>
              <Save size={14} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
