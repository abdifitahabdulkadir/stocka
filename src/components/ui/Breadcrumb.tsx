import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: { label: string; page?: string }[];
  onNavigate?: (page: string) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 mb-4">
      <button onClick={() => onNavigate?.("dashboard")} className="flex items-center gap-1 hover:text-orange-600 transition-colors">
        <Home size={11} />
      </button>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={11} className="text-slate-300" />
          {item.page && i < items.length - 1 ? (
            <button onClick={() => onNavigate?.(item.page!)} className="hover:text-orange-600 transition-colors">{item.label}</button>
          ) : (
            <span className={i === items.length - 1 ? "text-slate-800 font-medium" : ""}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
