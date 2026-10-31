import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; type: ToastType; title: string; message?: string; }

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const styles = {
  success: "border-emerald-200 bg-white text-emerald-700",
  error: "border-red-200 bg-white text-red-700",
  warning: "border-amber-200 bg-white text-amber-700",
  info: "border-orange-200 bg-white text-orange-700",
};
const iconColors = {
  success: "text-emerald-500", error: "text-red-500", warning: "text-amber-500", info: "text-orange-500"
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const Icon = icons[toast.type];
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full animate-in slide-in-from-right-5 ${styles[toast.type]}`}
      style={{ animation: "slideInRight 0.2s ease" }}>
      <Icon size={16} className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{toast.title}</div>
        {toast.message && <div className="text-xs text-slate-500 mt-0.5">{toast.message}</div>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-600 shrink-0 transition-colors">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++counter.current;
    setToasts(t => [...t, { id, type, title, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
}
