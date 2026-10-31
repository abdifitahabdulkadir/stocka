import { useState } from "react";
import { Boxes, Mail, ArrowLeft } from "lucide-react";

interface ForgotPasswordProps { onNavigate: (page: string) => void; }

export default function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Boxes size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-900">stocka</span>
        </div>

        {!sent ? (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
              <p className="text-sm text-slate-500 mt-1">No worries — we'll send reset instructions to your email.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={!email || loading}
                className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h1>
            <p className="text-sm text-slate-500 mb-6">We sent a reset link to <strong className="text-slate-700">{email}</strong>. It expires in 30 minutes.</p>
            <button onClick={() => onNavigate("reset-password")}
              className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors shadow-sm mb-3">
              Open Reset Page (Demo)
            </button>
            <p className="text-xs text-slate-500">Didn't receive it? <button className="text-orange-600 font-medium" onClick={() => setSent(false)}>Try again</button></p>
          </div>
        )}

        <button onClick={() => onNavigate("login")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mt-6 transition-colors">
          <ArrowLeft size={13} /> Back to sign in
        </button>
      </div>
    </div>
  );
}
