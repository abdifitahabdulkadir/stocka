import { useEffect, useState } from "react";
import { ToastProvider } from "./components/ui/Toast";

import Login from "./pages/Login";
import Register from "./pages/auth/Register";
import { getMe, logout, needsSetup, type User } from "./lib/auth";
import { SESSION_EXPIRED, SETTINGS_SAVED, get } from "./lib/api";
import { UserProvider } from "./lib/UserContext";

// Layout
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

// App pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [setup, setSetup] = useState(false);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    Promise.all([getMe(), needsSetup()]).then(([u, s]) => { setUser(u); setSetup(s); setChecking(false); });
  }, []);

  // Any API call that comes back 401 sends the user back to sign-in.
  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED, expired);
    return () => window.removeEventListener(SESSION_EXPIRED, expired);
  }, []);

  // Unread-notification count and company name for the shell; refreshed on every navigation.
  const [notifCount, setNotifCount] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [shellTick, setShellTick] = useState(0);
  useEffect(() => {
    const refresh = () => setShellTick(t => t + 1);
    window.addEventListener(SETTINGS_SAVED, refresh);
    return () => window.removeEventListener(SETTINGS_SAVED, refresh);
  }, []);
  useEffect(() => {
    if (!user) return;
    get<{ read: boolean }[]>("/api/notifications").then(n => setNotifCount(n.filter(x => !x.read).length)).catch(() => {});
    get<Record<string, string>>("/api/settings").then(s => setCompanyName(s.company ?? "")).catch(() => {});
  }, [user, page, shellTick]);

  const navigate = (p: string) => setPage(p);
  const enter = (u: User) => { setUser(u); setSetup(false); setPage("dashboard"); };
  const signOut = async () => { await logout(); setUser(null); };

  if (checking) return <div className="min-h-screen bg-slate-50" />;

  if (!user) {
    return (
      <ToastProvider>
        {setup ? <Register onRegistered={enter} /> : <Login onLogin={enter} />}
      </ToastProvider>
    );
  }

  // Staff can't open admin-only screens (the API refuses them too).
  const adminOnly = ["user-management", "settings"];
  const activePage = user.role !== "admin" && adminOnly.includes(page) ? "dashboard" : page;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "products": return <Products />;
      case "categories": return <Categories onNavigate={navigate} />;
      case "inventory": return <Inventory />;
      case "stock-in": return <StockIn onNavigate={navigate} />;
      case "stock-out": return <StockOut onNavigate={navigate} />;
      case "pos": return <POS onNavigate={navigate} />;
      case "orders": return <Orders onNavigate={navigate} />;
      case "customers": return <Customers />;
      case "suppliers": return <Suppliers />;
      case "purchase-orders": return <PurchaseOrders onNavigate={navigate} />;
      case "reports": return <Reports />;
      case "user-management": return <UserManagement onNavigate={navigate} />;
      case "notifications": return <Notifications onNavigate={navigate} />;
      case "profile": return <UserProfile onNavigate={navigate} />;
      case "settings": return <Settings />;
      default: return <NotFound onNavigate={navigate} />;
    }
  };

  return (
    <ToastProvider>
      <UserProvider value={{ user, setUser }}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar activePage={activePage} onNavigate={navigate} onLogout={signOut} user={user} notifCount={notifCount} companyName={companyName} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar page={activePage} notifCount={notifCount} user={user} onNavigate={navigate} />
          <main className="flex-1 overflow-hidden">
            {renderPage()}
          </main>
        </div>
      </div>
      </UserProvider>
    </ToastProvider>
  );
}
