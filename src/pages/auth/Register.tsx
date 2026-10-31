import { useState } from "react";
import { Boxes, Eye, EyeOff, User, Mail, Lock, Building2 } from "lucide-react";

interface RegisterProps { onNavigate: (page: string) => void; }

export default function Register({ onNavigate }: RegisterProps) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "", agree: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onNavigate("verify-email"); }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[380px] bg-slate-900 p-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
            <Boxes size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">stocka</span>
        </div>
        <div>
          <h2 className="text-white text-2xl font-bold leading-snug mb-3">Start managing inventory smarter</h2>
          <p className="text-slate-400 text-sm leading-relaxed">Join thousands of businesses tracking stock, managing suppliers, and growing revenue with stocka.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[["12,000+", "Businesses"], ["$2.4B+", "GMV tracked"], ["99.9%", "Uptime"], ["24/7", "Support"]].map(([v, l]) => (
              <div key={l} className="bg-slate-800/60 rounded-xl p-4">
                <div className="text-white font-bold text-xl">{v}</div>
                <div className="text-slate-500 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-slate-600 text-xs">© 2026 stocka</div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">Free 14-day trial · No credit card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full Name", key: "name", type: "text", icon: User, placeholder: "Maryan Abdulaziz" },
              { label: "Work Email", key: "email", type: "email", icon: Mail, placeholder: "james@company.com" },
              { label: "Company Name", key: "company", type: "text", icon: Building2, placeholder: "Acme Corp" },
            ].map(({ label, key, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type={type} value={form[key as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type={show ? "text" : "password"} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${form.password.length >= i * 3 ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-orange-400" : "bg-emerald-500" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.agree} onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 accent-orange-600" />
              <span className="text-xs text-slate-500">I agree to the <span className="text-orange-600 font-medium">Terms of Service</span> and <span className="text-orange-600 font-medium">Privacy Policy</span></span>
            </label>

            <button type="submit" disabled={loading || !form.agree}
              className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{" "}
            <button onClick={() => onNavigate("login")} className="text-orange-600 font-semibold hover:text-orange-700">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
