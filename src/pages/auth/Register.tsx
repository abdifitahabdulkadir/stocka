import { useState } from "react";
import { Boxes, Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { register, type User } from "@/lib/auth";

interface RegisterProps { onRegistered: (user: User) => void; }

/** First-run screen: shown only while the database has no users. Creates the administrator account. */
export default function Register({ onRegistered }: RegisterProps) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      onRegistered(await register(email, password, name));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-slate-900">Set up stocka</h1>
            <p className="text-sm text-slate-500 mt-1">Create the administrator account. You can add everyone else from User Management.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your Name</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Maryan Abdulaziz"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm">
              {loading ? "Creating admin..." : "Create Admin Account"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
