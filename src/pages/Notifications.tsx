import { useState } from "react";
import { Bell, AlertTriangle, ShoppingCart, Package, Users, Settings, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Badge from "../components/ui/Badge";

const allNotifications = [
  { id: 1, type: "alert", icon: AlertTriangle, color: "text-red-500 bg-red-50", title: "Out of Stock: Office Chair Ergonomic", body: "Product OC-ERG-01 has reached 0 units. Reorder immediately to avoid sales impact.", time: "2 minutes ago", read: false },
  { id: 2, type: "order", icon: ShoppingCart, color: "text-orange-500 bg-orange-50", title: "New order received: ORD-8821", body: "Nova Retail Ltd placed an order worth $3,849.94 — 6 items. Processing started.", time: "18 minutes ago", read: false },
  { id: 3, type: "stock", icon: Package, color: "text-amber-500 bg-amber-50", title: "Low stock: Wireless Headphones", body: "WH-BT-400 has 8 units remaining (reorder point: 15). Consider placing a purchase order.", time: "1 hour ago", read: false },
  { id: 4, type: "stock", icon: Package, color: "text-amber-500 bg-amber-50", title: "Low stock: Mechanical Keyboard", body: "MK-TKL-BLU has only 3 units remaining. Supplier: TechDistrib Global.", time: "2 hours ago", read: true },
  { id: 5, type: "order", icon: ShoppingCart, color: "text-orange-500 bg-orange-50", title: "Order ORD-8820 is now Processing", body: "Meridian Corp's order for 2× Wireless Headphones has moved to Processing.", time: "3 hours ago", read: true },
  { id: 6, type: "user", icon: Users, color: "text-amber-500 bg-amber-50", title: "New user added: Sarah Mitchell", body: "Sarah Mitchell has been granted Manager-level access to stocka.", time: "Yesterday", read: true },
  { id: 7, type: "order", icon: ShoppingCart, color: "text-emerald-500 bg-emerald-50", title: "Order ORD-8818 delivered", body: "Pinnacle Trading's order of 11 items ($8,201.89) has been marked as delivered.", time: "Yesterday", read: true },
  { id: 8, type: "system", icon: Settings, color: "text-slate-500 bg-slate-100", title: "Automated backup completed", body: "Your weekly backup was completed successfully. 4.2 GB stored securely.", time: "2 days ago", read: true },
  { id: 9, type: "user", icon: Users, color: "text-amber-500 bg-amber-50", title: "Login from new device", body: "Your account was accessed from a new browser on macOS. Was this you?", time: "3 days ago", read: true },
  { id: 10, type: "system", icon: Settings, color: "text-slate-500 bg-slate-100", title: "System update available", body: "stocka v2.4.1 is ready to install. Includes performance improvements and bug fixes.", time: "4 days ago", read: true },
];

interface NotificationsProps { onNavigate: (page: string) => void; }

export default function Notifications({ onNavigate }: NotificationsProps) {
  const [notifs, setNotifs] = useState(allNotifications);
  const [filter, setFilter] = useState("all");

  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const deleteNotif = (id: number) => setNotifs(n => n.filter(x => x.id !== id));

  const types = ["all", "alert", "order", "stock", "user", "system"];
  const filtered = notifs.filter(n => filter === "all" || n.type === filter);
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
          const Icon = notif.icon;
          return (
            <div key={notif.id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-all ${notif.read ? "border-slate-100 opacity-80" : "border-orange-200 bg-orange-50/20"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notif.color}`}>
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
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <Bell size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
