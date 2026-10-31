import { useState } from "react";
import { Bell, AlertTriangle, Package, Settings, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import { useApi, post, patch, del } from "../lib/api";
import { ListSkeleton } from "../components/ui/Skeleton";

interface ServerNotification { id: number; type: string; title: string; body: string; read: boolean; created_at: string }

// Server types: "low_stock" (raised when a sale or stock-out leaves a product at/below its reorder level) and "info".
function categorise(n: ServerNotification) {
  if (n.type === "low_stock") return /out of stock/i.test(n.title) ? "alert" : "stock";
  return "system";
}

const looks = {
  alert: { icon: AlertTriangle, color: "text-red-500 bg-red-50" },
  stock: { icon: Package, color: "text-amber-500 bg-amber-50" },
  system: { icon: Settings, color: "text-slate-500 bg-slate-100" },
} as const;

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

interface NotificationsProps { onNavigate: (page: string) => void; }

export default function Notifications({ onNavigate }: NotificationsProps) {
  const { data, loading, error, reload, setData } = useApi<ServerNotification[]>("/api/notifications");
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const notifs = (data ?? []).map(n => ({ ...n, category: categorise(n) }));

  const run = async (action: () => Promise<unknown>) => {
    try { await action(); reload(); }
    catch (e) { toast("error", "Something went wrong", e instanceof Error ? e.message : undefined); }
  };
  const markRead = (id: number) => { setData(d => d && d.map(x => x.id === id ? { ...x, read: true } : x)); run(() => patch(`/api/notifications/${id}`, { read: true })); };
  const markAllRead = () => { setData(d => d && d.map(x => ({ ...x, read: true }))); run(() => post("/api/notifications/read-all")); };
  const deleteNotif = (id: number) => { setData(d => d && d.filter(x => x.id !== id)); run(() => del(`/api/notifications/${id}`)); };

  const types = ["all", "alert", "stock", "system"];
  const filtered = notifs.filter(n => filter === "all" || n.category === filter);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <Breadcrumb items={[{ label: "Notifications" }]} onNavigate={onNavigate} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-slate-600" />
          <h2 className="font-semibold text-slate-800">Notifications</h2>
          {unread > 0 && <Badge variant="danger">{unread} new</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} disabled={unread === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg font-medium disabled:opacity-40 transition-colors">
            <CheckCheck size={12} /> Mark all read
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={13} className="text-slate-400" />
        <div className="flex gap-1">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${t === filter ? "bg-orange-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(notif => {
          const { icon: Icon, color } = looks[notif.category as keyof typeof looks];
          return (
            <div key={notif.id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-all ${notif.read ? "border-slate-100 opacity-80" : "border-orange-200 bg-orange-50/20"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${notif.read ? "text-slate-700" : "text-slate-900"}`}>{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-orange-600 shrink-0 mt-1.5" />}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">{timeAgo(notif.created_at)}</span>
                  <div className="flex gap-1">
                    {!notif.read && (
                      <button onClick={() => markRead(notif.id)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] text-orange-600 hover:bg-orange-50 rounded-md font-semibold transition-colors">
                        <Check size={10} /> Mark read
                      </button>
                    )}
                    <button onClick={() => deleteNotif(notif.id)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {loading && !data && <ListSkeleton rows={5} />}
        {error && <p className="text-center text-sm text-red-500 py-10">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <Bell size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">Low-stock alerts will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
