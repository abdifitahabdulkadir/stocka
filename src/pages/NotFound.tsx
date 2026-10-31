import { Home, ArrowLeft, Search } from "lucide-react";
import { Boxes } from "lucide-react";

interface NotFoundProps { onNavigate: (page: string) => void; }

export default function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <Boxes size={15} className="text-white" />
        </div>
        <span className="font-bold text-slate-900">stocka</span>
      </div>

      <div className="relative mb-8">
        <div className="text-[120px] font-black text-slate-100 leading-none select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center">
            <Search size={36} className="text-slate-400" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors">
          <ArrowLeft size={15} /> Go back
        </button>
        <button onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <Home size={15} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
