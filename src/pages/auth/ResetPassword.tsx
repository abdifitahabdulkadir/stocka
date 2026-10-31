import { useState } from "react";
import { Boxes, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";

interface ResetPasswordProps { onNavigate: (page: string) => void; }

export default function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[!@#$%^&*]/.test(password) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-orange-400", "bg-emerald-500"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1000);
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

        {!done ? (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
              <p className="text-sm text-slate-500 mt-1">Must be at least 8 characters and include a symbol.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "New Password", val: password, set: setPassword, placeholder: "New password" },
                { label: "Confirm Password", val: confirm, set: setConfirm, placeholder: "Confirm password" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type={show ? "text" : "password"} value={val} onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              {password && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${strength >= i ? strengthColor[strength] : "bg-slate-200"} transition-colors`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">{strengthLabel[strength]}</p>
                </div>
              )}

              {confirm && password !== confirm && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}

              <button type="submit" disabled={loading || !password || password !== confirm || password.length < 8}
                className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Password reset!</h1>
            <p className="text-sm text-slate-500 mb-6">Your password has been successfully updated.</p>
            <button onClick={() => onNavigate("login")} className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors shadow-sm">
              Sign in with new password
            </button>
          </div>
        )}

        {!done && (
          <button onClick={() => onNavigate("login")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mt-6 transition-colors">
            <ArrowLeft size={13} /> Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
