import { useState } from "react";
import type { User } from "../lib/auth";
import { initials } from "../lib/UserContext";
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart, Users,
  Truck, BarChart3, Settings, LogOut, ChevronRight, Boxes,
  Tag, PackagePlus, PackageMinus, ClipboardList, ShoppingBag,
  UserCog, Bell, ChevronDown, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catalog",
    items: [
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: Tag },
    ],
  },
  {
    title: "Inventory",
    items: [
      { id: "inventory", label: "Stock Levels", icon: Warehouse },
      { id: "stock-in", label: "Stock In", icon: PackagePlus },
      { id: "stock-out", label: "Stock Out", icon: PackageMinus },
    ],
  },
  {
    title: "Commerce",
    items: [
      { id: "pos", label: "Point of Sale", icon: ShoppingCart },
      { id: "orders", label: "Orders", icon: ClipboardList },
      { id: "customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Procurement",
    items: [
      { id: "suppliers", label: "Suppliers", icon: Truck },
      { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingBag },
    ],
  },
  {
    title: "Insights",
    items: [{ id: "reports", label: "Reports", icon: BarChart3 }],
  },
  {
    title: "Admin",
    items: [
      { id: "user-management", label: "Users", icon: UserCog },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: User;
  notifCount: number;
  companyName: string;
}

// Screens only admins can open (the API enforces this too).
const adminOnly = ["user-management", "settings"];

export default function Sidebar({ activePage, onNavigate, onLogout, user, notifCount, companyName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setClosedGroups(c => c.includes(title) ? c.filter(x => x !== title) : [...c, title]);
  };

  return (
    <aside
      className={`flex flex-col min-h-screen bg-slate-900 text-slate-300 shrink-0 border-r border-white/5 transition-all duration-200 ${collapsed ? "w-[76px]" : "w-64"}`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-white/10 shrink-0 ${collapsed ? "justify-center py-5 px-2 flex-col gap-3" : "gap-3 px-5 py-5"}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-600/20 shrink-0">
              <Boxes size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-base leading-tight tracking-tight truncate">{companyName || "stocka"}</div>
              <div className="text-slate-400 text-xs truncate">{user.name || user.email}</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700">
            <Boxes size={20} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`text-slate-500 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navGroups.map(group => ({
          ...group,
          items: group.items
            .filter(i => user.role === "admin" || !adminOnly.includes(i.id))
            .map(i => i.id === "notifications" ? { ...i, badge: notifCount } : i),
        })).map(group => {
          const isGroupClosed = closedGroups.includes(group.title);
          return (
            <div key={group.title}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full px-3 pt-3 pb-1.5 group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 group-hover:text-slate-300 transition-colors">
                    {group.title}
                  </span>
                  <ChevronDown size={12} className={`text-slate-500 transition-transform ${isGroupClosed ? "-rotate-90" : ""}`} />
                </button>
              )}

              {(!isGroupClosed || collapsed) && group.items.map(({ id, label, icon: Icon, badge }) => {
                const active = activePage === id;
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    title={collapsed ? label : undefined}
                    className={`flex items-center w-full relative rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer group mb-0.5 ${
                      collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                    } ${active ? "bg-white/10 text-white ring-1 ring-inset ring-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-orange-500" />}
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-orange-400 shrink-0" : "text-slate-400 group-hover:text-white shrink-0"} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-[13.5px] truncate">{label}</span>
                        {badge ? (
                          <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                            {badge}
                          </span>
                        ) : active ? (
                          <ChevronRight size={14} className="text-orange-400 shrink-0" />
                        ) : null}
                      </>
                    )}
                    {collapsed && badge ? (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/10 space-y-1 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          onClick={() => onNavigate("profile")}
          title={collapsed ? "Profile" : undefined}
          className={`flex items-center w-full rounded-xl transition-colors cursor-pointer group ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          } ${activePage === "profile" ? "bg-white/10 text-white ring-1 ring-inset ring-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials(user)}</div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-white truncate">{user.name || user.email}</div>
              <div className="text-xs text-slate-400 truncate capitalize">{user.role}</div>
            </div>
          )}
        </button>
        <button
          onClick={onLogout}
          title={collapsed ? "Log out" : undefined}
          className={`flex items-center w-full rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-[13.5px] font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
