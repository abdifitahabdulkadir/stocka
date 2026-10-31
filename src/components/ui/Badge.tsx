type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "blue" | "purple";

const styles: Record<BadgeVariant, string> = {
  success: "text-emerald-700 bg-emerald-50 border-emerald-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  danger: "text-red-700 bg-red-50 border-red-200",
  info: "text-sky-700 bg-sky-50 border-sky-200",
  neutral: "text-slate-600 bg-slate-100 border-slate-200",
  blue: "text-orange-700 bg-orange-50 border-orange-200",
  purple: "text-amber-700 bg-amber-50 border-amber-200",
};

interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string; dot?: boolean; }

export default function Badge({ variant = "neutral", children, className = "", dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded border ${styles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === "success" ? "bg-emerald-500" : variant === "danger" ? "bg-red-500" : variant === "warning" ? "bg-amber-500" : "bg-orange-500"}`} />}
      {children}
    </span>
  );
}
