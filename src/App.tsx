import { useState } from "react";
import { ToastProvider } from "./components/ui/Toast";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

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

type AuthPage = "login" | "register" | "forgot-password" | "reset-password" | "verify-email";

const authPages: AuthPage[] = ["login", "register", "forgot-password", "reset-password", "verify-email"];

export default function App() {
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  const navigate = (p: string) => {
    if (authPages.includes(p as AuthPage)) setAuthPage(p as AuthPage);
    else setPage(p);
  };

  const authNavigate = (p: string) => {
    if (authPages.includes(p as AuthPage)) setAuthPage(p as AuthPage);
    else { setLoggedIn(true); setPage("dashboard"); }
  };

  if (!loggedIn) {
    if (authPage === "register") return <ToastProvider><Register onNavigate={authNavigate} /></ToastProvider>;
    if (authPage === "forgot-password") return <ToastProvider><ForgotPassword onNavigate={authNavigate} /></ToastProvider>;
    if (authPage === "reset-password") return <ToastProvider><ResetPassword onNavigate={authNavigate} /></ToastProvider>;
    if (authPage === "verify-email") return <ToastProvider><VerifyEmail onNavigate={authNavigate} /></ToastProvider>;

    return (
      <ToastProvider>
        <Login onLogin={() => setLoggedIn(true)} />
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          <button onClick={() => setAuthPage("register")} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Register →</button>
          <button onClick={() => setAuthPage("forgot-password")} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Forgot Password →</button>
        </div>
      </ToastProvider>
    );
  }

  const renderPage = () => {
    switch (page) {
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
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar activePage={page} onNavigate={navigate} onLogout={() => setLoggedIn(false)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar page={page} notifCount={3} onNavigate={navigate} />
          <main className="flex-1 overflow-hidden">
            {renderPage()}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
