import { useState, useRef } from "react";
import { Boxes, CheckCircle2, RefreshCw } from "lucide-react";

interface VerifyEmailProps { onNavigate: (page: string) => void; }

export default function VerifyEmail({ onNavigate }: VerifyEmailProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(c => c) && next.join("").length === 6) {
      setTimeout(() => setVerified(true), 400);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleResend = () => {
    setResent(true);
    setCode(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Boxes size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-900">stocka</span>
        </div>

        {!verified ? (
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Boxes size={28} className="text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h1>
            <p className="text-sm text-slate-500 mb-7">
              We sent a 6-digit code to <strong className="text-slate-700">maryan@stocka.io</strong>.<br />
              Enter it below to verify your account.
            </p>

            <div className="flex gap-2.5 justify-center mb-6">
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el; }}
                  value={c}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1}
                  className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Didn't receive it?{" "}
              <button onClick={handleResend} className="text-orange-600 font-medium hover:text-orange-700 inline-flex items-center gap-1">
                <RefreshCw size={11} /> {resent ? "Sent!" : "Resend code"}
              </button>
            </p>

            <div className="mt-4">
              <button onClick={() => onNavigate("login")} className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                Use a different email
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Email verified!</h1>
            <p className="text-sm text-slate-500 mb-7">Your account is ready. Let's get you into the dashboard.</p>
            <button onClick={() => onNavigate("login")}
              className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors shadow-sm">
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
