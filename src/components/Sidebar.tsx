import { useState } from "react";
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
      { id: "notifications", label: "Notifications", icon: Bell, badge: 3 },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setClosedGroups(c => c.includes(title) ? c.filter(x => x !== title) : [...c, title]);
  };

  return (
    <aside
      className={`flex flex-col min-h-screen bg-slate-900 text-slate-300 shrink-0 transition-all duration-200 ${collapsed ? "w-[60px]" : "w-60"}`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-slate-700/60 shrink-0 ${collapsed ? "justify-center py-5 px-2" : "gap-3 px-5 py-5"}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600 shrink-0">
              <Boxes size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm leading-tight">stocka</div>
              <div className="text-slate-500 text-xs">Inventory Pro</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600">
            <Boxes size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`text-slate-600 hover:text-slate-400 transition-colors shrink-0 ${collapsed ? "mt-0" : ""}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navGroups.map(group => {
          const isGroupClosed = closedGroups.includes(group.title);
          return (
            <div key={group.title}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full px-2 py-1.5 mb-0.5 group"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 group-hover:text-slate-500 transition-colors">
                    {group.title}
                  </span>
                  <ChevronDown size={10} className={`text-slate-600 transition-transform ${isGroupClosed ? "-rotate-90" : ""}`} />
                </button>
              )}

              {(!isGroupClosed || collapsed) && group.items.map(({ id, label, icon: Icon, badge }) => {
                const active = activePage === id;
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    title={collapsed ? label : undefined}
                    className={`flex items-center w-full rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group mb-0.5 ${
                      collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                    } ${active ? "bg-orange-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}
                  >
                    <Icon size={15} className={active ? "text-white shrink-0" : "text-slate-500 group-hover:text-slate-300 shrink-0"} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-xs truncate">{label}</span>
                        {badge ? (
                          <span className="bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                            {badge}
                          </span>
                        ) : active ? (
                          <ChevronRight size={11} className="text-orange-200 shrink-0" />
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
      <div className={`border-t border-slate-700/60 space-y-1 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          onClick={() => onNavigate("profile")}
          title={collapsed ? "Profile" : undefined}
          className={`flex items-center w-full rounded-lg transition-colors cursor-pointer group ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
          } ${activePage === "profile" ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"}`}
        >
          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">MA</div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-semibold text-slate-200 truncate">Maryan Abdulaziz</div>
              <div className="text-[10px] text-slate-500 truncate">Admin</div>
            </div>
          )}
        </button>
        <button
          onClick={onLogout}
          title={collapsed ? "Log out" : undefined}
          className={`flex items-center w-full rounded-lg text-sm text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors cursor-pointer ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
          }`}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && <span className="text-xs">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
