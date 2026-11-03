import { useState } from "react";
import { Eye, EyeOff, Boxes, Lock, Mail } from "lucide-react";
import { login, type User } from "@/lib/auth";

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      onLogin(await login(email, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900 p-6">
      {/* Decorative background: illustration, grid lines and a soft vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/login-bg.svg)" }} />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(148 163 184 / 0.10) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.10) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md bg-slate-100 shadow-2xl shadow-black/50 p-8 sm:p-12">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500" />
        <div className="flex flex-col items-center mb-8 pt-1">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-600/30 mb-5">
            <Boxes size={26} className="text-white" />
          </div>
          <span className="text-slate-900 font-bold text-2xl tracking-tight">Stocka</span>
          <p className="text-sm text-slate-500 mt-1.5">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-sm border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/15 focus:border-orange-500 bg-white transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5">
              <label className="text-xs font-semibold text-slate-600">Password</label>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-3 text-sm border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/15 focus:border-orange-500 bg-white transition-all"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 text-sm font-semibold bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 text-white transition-all shadow-md shadow-orange-600/30 hover:shadow-lg active:scale-[0.99] mt-2 cursor-pointer">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-7 pt-5 border-t border-slate-300">Need an account? Ask your administrator.</p>
      </div>
    </div>
  );
}
