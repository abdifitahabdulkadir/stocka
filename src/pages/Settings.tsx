import { useEffect, useState } from "react";
import { Bell, Globe, Save } from "lucide-react";
import { useToast } from "../components/ui/Toast";
import { useApi, put, SETTINGS_SAVED } from "../lib/api";

const sections = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
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
  const { data, loading, error, reload } = useApi<Record<string, string>>("/api/settings");
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState("");
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  useEffect(() => {
    if (!data) return;
    setCompany(data.company ?? "");
    setLowStockAlerts(data.lowStockAlerts !== "false");
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await put("/api/settings", { company: company.trim(), lowStockAlerts: String(lowStockAlerts) });
      toast("success", "Settings saved");
      reload();
      window.dispatchEvent(new Event(SETTINGS_SAVED));
    } catch (e) {
      toast("error", "Could not save settings", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-7 text-sm text-slate-400">Loading settings...</div>;
  if (error) return <div className="p-7 text-sm text-red-500">{error}</div>;

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
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Name</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="stocka" maxLength={100}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
                <p className="text-xs text-slate-400 mt-1.5">Shown in the sidebar.</p>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">Notification Preferences</h3>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">Low Stock Alerts</div>
                  <div className="text-xs text-slate-500">Create a notification when a sale or stock-out brings a product to its reorder point</div>
                </div>
                <Toggle checked={lowStockAlerts} onChange={() => setLowStockAlerts(v => !v)} />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white">
              <Save size={14} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
