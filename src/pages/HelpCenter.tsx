import { useState } from "react";
import { Search, ChevronDown, ChevronRight, MessageCircle, Book, Video, LifeBuoy, ExternalLink } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";

const faqs = [
  { q: "How do I add a new product?", a: "Navigate to Products → click 'Add Product' in the top right. Fill in the product name, SKU, category, price, and initial stock. Click 'Add Product' to save. The product will appear in your catalog immediately." },
  { q: "How do I record a stock receipt (Stock In)?", a: "Go to Inventory → Stock In. Select the supplier and products received, enter quantities and unit costs, then click 'Confirm Stock In'. The system automatically updates your inventory levels." },
  { q: "How do I process a sale at POS?", a: "Navigate to Sales → POS. Click products to add them to the cart. Apply discounts if needed, select a payment method, and click 'Charge'. A receipt will be generated automatically." },
  { q: "How do I create a purchase order?", a: "Go to Purchase Orders → click 'New PO'. Select the supplier, add the products and quantities you need to order, set an expected delivery date, and submit. You can track the PO status in the Purchase Orders list." },
  { q: "How do I export reports?", a: "Navigate to Reports → select your date range and report type. Click 'Export Report' to download as PDF or Excel. Charts can also be saved individually." },
  { q: "How do I invite a team member?", a: "Go to Settings → User Management. Click 'Invite User', fill in their email and assign a role. They'll receive an invitation email with instructions to set up their account." },
  { q: "What do the stock status indicators mean?", a: "In Stock: quantity is above the reorder point. Low Stock: quantity is at or below the reorder point. Out of Stock: quantity is 0. Set reorder points per product in the product settings." },
  { q: "How does dark mode work?", a: "Go to Settings → Appearance. Under Theme, select 'Dark'. Changes apply immediately. You can also select 'System' to follow your operating system's preference." },
];

const guides = [
  { title: "Getting Started Guide", desc: "Complete walkthrough for new users", icon: Book, time: "10 min" },
  { title: "Inventory Management", desc: "Stock In, Stock Out, and transfers", icon: Book, time: "8 min" },
  { title: "POS & Sales Processing", desc: "Ringing up sales and handling returns", icon: Video, time: "6 min" },
  { title: "Reports & Analytics", desc: "Understanding your business data", icon: Book, time: "12 min" },
];

interface HelpCenterProps { onNavigate: (page: string) => void; }

export default function HelpCenter({ onNavigate }: HelpCenterProps) {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-7 h-full overflow-y-auto space-y-6">
      <Breadcrumb items={[{ label: "Help Center" }]} onNavigate={onNavigate} />

      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">How can we help you?</h1>
        <p className="text-orange-100 text-sm mb-6">Browse our guides or search for specific topics</p>
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Documentation", icon: Book, color: "bg-orange-600", desc: "Detailed guides" },
          { label: "Video Tutorials", icon: Video, color: "bg-amber-600", desc: "Watch & learn" },
          { label: "Live Chat", icon: MessageCircle, color: "bg-emerald-600", desc: "Talk to support" },
          { label: "Help Desk", icon: LifeBuoy, color: "bg-amber-500", desc: "Submit a ticket" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <button key={c.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-orange-200 transition-all text-center group">
              <div className={`${c.color} w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{c.label}</div>
                <div className="text-xs text-slate-500">{c.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredFaqs.map((faq, i) => (
              <div key={i}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/60 transition-colors">
                  <span className="text-sm font-medium text-slate-800">{faq.q}</span>
                  {openFaq === i ? <ChevronDown size={15} className="text-slate-500 shrink-0" /> : <ChevronRight size={15} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No results for "{search}"</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Popular Guides</h3>
            <div className="space-y-3">
              {guides.map(g => {
                const Icon = g.icon;
                return (
                  <div key={g.title} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                      <Icon size={14} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-orange-700 transition-colors truncate">{g.title}</div>
                      <div className="text-[10px] text-slate-400">{g.desc} · {g.time} read</div>
                    </div>
                    <ExternalLink size={11} className="text-slate-300 group-hover:text-orange-500 shrink-0 transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={15} className="text-orange-600" />
              <h3 className="text-sm font-semibold text-orange-800">Need direct help?</h3>
            </div>
            <p className="text-xs text-orange-700 mb-4">Our support team is available Monday–Friday, 8am–6pm EST.</p>
            <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors">
              Start Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
