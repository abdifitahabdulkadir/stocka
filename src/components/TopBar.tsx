import { Bell, ChevronDown } from "lucide-react";
import type { User } from "../lib/auth";
import { initials } from "../lib/UserContext";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back" },
  products: { title: "Products", subtitle: "Manage your product catalog" },
  categories: { title: "Categories", subtitle: "Organize products into groups" },
  inventory: { title: "Inventory", subtitle: "Track stock levels and movements" },
  "stock-in": { title: "Stock In", subtitle: "Record incoming stock from suppliers" },
  "stock-out": { title: "Stock Out", subtitle: "Record outgoing or adjusted stock" },
  pos: { title: "Point of Sale", subtitle: "Process sales transactions" },
  orders: { title: "Orders", subtitle: "Manage customer orders" },
  customers: { title: "Customers", subtitle: "Manage customer accounts" },
  suppliers: { title: "Suppliers", subtitle: "Vendor management" },
  "purchase-orders": { title: "Purchase Orders", subtitle: "Track supplier purchase orders" },
  reports: { title: "Reports", subtitle: "Analytics and business insights" },
  "user-management": { title: "User Management", subtitle: "Manage team access and roles" },
  notifications: { title: "Notifications", subtitle: "System alerts and updates" },
  settings: { title: "Settings", subtitle: "System configuration" },
  profile: { title: "My Profile", subtitle: "Account settings and preferences" },
};

interface TopBarProps {
  page: string;
  notifCount?: number;
  user: User;
  onNavigate: (page: string) => void;
}

export default function TopBar({ page, notifCount = 0, user, onNavigate }: TopBarProps) {
  const base = pageTitles[page] || { title: page, subtitle: "" };
  const info = page === "dashboard" && user.name ? { ...base, subtitle: `Welcome back, ${user.name.split(" ")[0]}` } : base;
  return (
    <header className="flex items-center justify-between px-7 py-4 bg-white border-b border-slate-100 shrink-0">
      <div>
        <h1 className="text-slate-900 font-semibold text-lg leading-tight">{info.title}</h1>
        <p className="text-slate-500 text-xs">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("notifications")} className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell size={16} className="text-slate-500" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{notifCount}</span>
          )}
        </button>
        <button onClick={() => onNavigate("profile")} className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer group hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">{initials(user)}</div>
          <span className="text-sm text-slate-700 font-medium">{user.name ? user.name.split(" ")[0] : user.email}</span>
          <ChevronDown size={13} className="text-slate-400 group-hover:text-slate-600" />
        </button>
      </div>
    </header>
  );
}
