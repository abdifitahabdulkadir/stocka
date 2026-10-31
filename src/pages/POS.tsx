import { useState } from "react";
import { Search, Plus, Minus, Printer, CreditCard, Banknote, Smartphone, X, Check, Tag, Receipt } from "lucide-react";
import { useToast } from "../components/ui/Toast";
import { useApi, post } from "../lib/api";

interface Product { id: number; name: string; sku: string; price: number; category: string | null; stock: number; }
interface CustomerOption { id: number; name: string; status: string; }
interface CartItem { product: Product; qty: number; }
interface ReceiptData {
  code: string; customer: string; payMethod: string; items: CartItem[];
  subtotal: number; discountAmt: number; taxAmt: number; total: number;
}

const categoryColors: Record<string, string> = {
  Electronics: "bg-orange-100 text-orange-700",
  Clothing: "bg-amber-100 text-amber-700",
  Furniture: "bg-emerald-100 text-emerald-700",
  Tools: "bg-amber-100 text-amber-700",
};

interface POSProps { onNavigate: (page: string) => void; }

export default function POS({ onNavigate: _onNavigate }: POSProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "mobile">("card");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [charging, setCharging] = useState(false);
  const { toast } = useToast();
  const { data: productData, loading, error, reload } = useApi<Product[]>("/api/products");
  const { data: customerData } = useApi<CustomerOption[]>("/api/customers");
  const catalog = productData ?? [];
  const customers = (customerData ?? []).filter(c => c.status === "Active");

  const categories = ["All", ...Array.from(new Set(catalog.map(p => p.category ?? "Uncategorised")))];

  const filtered = catalog.filter(p =>
    (categoryFilter === "All" || (p.category ?? "Uncategorised") === categoryFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    setCart(c => {
      const ex = c.find(x => x.product.id === product.id);
      if (ex) return c.map(x => x.product.id === product.id ? { ...x, qty: Math.min(product.stock, x.qty + 1) } : x);
      return [...c, { product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(c => c
      .map(x => x.product.id === id ? { ...x, qty: Math.max(0, Math.min(x.product.stock, x.qty + delta)) } : x)
      .filter(x => x.qty > 0));
  };

  const removeItem = (id: number) => setCart(c => c.filter(x => x.product.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discountAmt = discountType === "%" ? subtotal * (discount / 100) : Math.min(discount, subtotal);
  const taxRate = 0.08;
  const taxAmt = (subtotal - discountAmt) * taxRate;
  const total = subtotal - discountAmt + taxAmt;

  const handleCharge = async () => {
    if (!cart.length || charging) return;
    setCharging(true);
    try {
      // The server prices the items, records the sale and takes the stock out in one step.
      const order = await post<{ code: string }>("/api/orders", {
        source: "pos",
        status: "Delivered",
        customer_id: customerId === "" ? undefined : customerId,
        items: cart.map(i => ({ product_id: i.product.id, qty: i.qty })),
      });
      setReceipt({
        code: order.code,
        customer: customers.find(c => c.id === customerId)?.name ?? "Walk-in Customer",
        payMethod,
        items: cart,
        subtotal, discountAmt, taxAmt, total,
      });
      setCart([]);
      setDiscount(0);
      setCustomerId("");
      toast("success", "Sale completed", `${order.code} · $${total.toFixed(2)}`);
      reload();
    } catch (err) {
      toast("error", "Could not complete sale", err instanceof Error ? err.message : undefined);
      reload(); // stock may have changed since the page loaded
    } finally {
      setCharging(false);
    }
  };

  const handleNewSale = () => setReceipt(null);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Product grid */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products or scan barcode..."
              className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
          </div>
          <div className="flex gap-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${c === categoryFilter ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-12 text-sm text-slate-400">
                {loading ? "Loading products..." : error ? <span className="text-red-500">{error}</span> : "No products found"}
              </div>
            )}
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-left hover:border-orange-300 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category ?? ""] || "bg-slate-100 text-slate-600"}`}>
                    {p.category ?? "Uncategorised"}
                  </span>
                  {p.stock <= 5 && p.stock > 0 && <span className="text-[10px] text-amber-600 font-semibold">{p.stock} left</span>}
                  {p.stock === 0 && <span className="text-[10px] text-red-600 font-semibold">Out</span>}
                </div>
                <div className="text-xs font-semibold text-slate-800 mb-1 line-clamp-2">{p.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mb-2">{p.sku}</div>
                <div className="text-sm font-bold text-orange-700">${p.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 flex flex-col bg-white">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={15} className="text-orange-600" />
            <span className="font-semibold text-slate-800 text-sm">Current Order</span>
          </div>
          <span className="text-xs font-mono text-slate-400">New sale</span>
        </div>

        <div className="px-4 py-3 border-b border-slate-100">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">CUSTOMER</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt size={28} className="text-slate-300 mb-3" />
              <p className="text-xs text-slate-400">Tap products to add them</p>
            </div>
          )}
          {cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{item.product.name}</div>
                <div className="text-[10px] text-slate-400">${item.product.price.toFixed(2)} ea</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => updateQty(item.product.id, -1)}
                  className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <Minus size={10} />
                </button>
                <span className="text-xs font-bold text-slate-800 w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.product.id, 1)}
                  className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <Plus size={10} />
                </button>
              </div>
              <div className="text-xs font-bold text-slate-900 w-16 text-right shrink-0">
                ${(item.product.price * item.qty).toFixed(2)}
              </div>
              <button onClick={() => removeItem(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Discount */}
        <div className="px-4 py-3 border-t border-slate-100">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">DISCOUNT</label>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(["%", "$"] as const).map(t => (
                <button key={t} onClick={() => setDiscountType(t)}
                  className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${t === discountType ? "bg-orange-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                  {t}
                </button>
              ))}
            </div>
            <input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
          </div>
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-slate-100 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between text-xs text-emerald-600">
              <span className="flex items-center gap-1"><Tag size={10} /> Discount</span>
              <span>-${discountAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tax (8%)</span><span>${taxAmt.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span><span className="text-orange-700 text-base">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="px-4 py-3 border-t border-slate-100">
          <label className="block text-[10px] font-semibold text-slate-500 mb-2">PAYMENT METHOD</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { id: "card", Icon: CreditCard, label: "Card" },
              { id: "cash", Icon: Banknote, label: "Cash" },
              { id: "mobile", Icon: Smartphone, label: "Mobile" },
            ] as const).map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setPayMethod(id)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border-2 text-[10px] font-semibold transition-colors ${payMethod === id ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <button onClick={handleCharge} disabled={!cart.length || charging}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
            {charging ? "Processing..." : `Charge $${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-80 border border-slate-100 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-5 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check size={22} className="text-white" />
              </div>
              <p className="text-white font-bold">Payment Successful</p>
              <p className="text-emerald-100 text-xs mt-0.5">{receipt.payMethod.toUpperCase()}</p>
            </div>
            <div className="p-5">
              <div className="border border-dashed border-slate-200 rounded-xl p-4 mb-4 font-mono text-xs">
                <div className="text-center font-bold text-slate-800 mb-3">stocka POS</div>
                <div className="flex justify-between mb-1 text-slate-500"><span>Order</span><span>{receipt.code}</span></div>
                <div className="flex justify-between mb-3 text-slate-500"><span>Customer</span><span>{receipt.customer}</span></div>
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1">
                  {receipt.items.map(i => (
                    <div key={i.product.id} className="flex justify-between text-slate-700">
                      <span className="truncate max-w-[140px]">{i.product.name} ×{i.qty}</span>
                      <span>${(i.product.price * i.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-slate-200 mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${receipt.subtotal.toFixed(2)}</span></div>
                  {receipt.discountAmt > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-${receipt.discountAmt.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-slate-500"><span>Tax 8%</span><span>${receipt.taxAmt.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1"><span>TOTAL</span><span>${receipt.total.toFixed(2)}</span></div>
                </div>
                <div className="text-center text-slate-400 mt-3">— Thank you! —</div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 rounded-lg font-medium">
                  <Printer size={13} /> Print
                </button>
                <button onClick={handleNewSale} className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
