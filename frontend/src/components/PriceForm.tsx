import { useEffect, useState } from "react";

export default function PriceForm({ onResult, onLoading = () => {} }: any) {
  const env = (import.meta as any).env || {};
  const API_BASE =
    env.VITE_API_BASE_URL || env.VITE_API_URL || "http://127.0.0.1:8000";
  const [form, setForm] = useState({
    product: "",
    cost: "",
    stock_left: "",
    expiry_days: "",
    demand_score: "",
    strategy: "balanced",
  });

  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        setProducts(data.results || []);
      } catch (e) {
        console.error("Failed to load products list", e);
      }
    };

    fetchProducts();
  }, [API_BASE]);

  const update = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    onLoading(true);

    const payload = {
      ...form,
      cost: Number(form.cost),
      stock_left: Number(form.stock_left),
      expiry_days: Number(form.expiry_days),
      demand_score: Number(form.demand_score),
    };

    try {
      const res = await fetch(`${API_BASE}/recommend-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Backend error", errBody || res.statusText);
        onResult(null);
        return;
      }

      const json = await res.json();
      onResult(json.data);
    } catch (error) {
      console.error("Network or server error", error);
      onResult(null);
    } finally {
      onLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-7 bg-white/95 border border-slate-200
                 rounded-3xl shadow-md space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Pricing Input</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter product details and strategy to get an AI-powered recommendation.
          </p>
        </div>
        <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
          Single product
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Product</label>
          <input
            name="product"
            placeholder="Product name (e.g. Grapes 1kg)"
            onChange={update}
            className="input"
            list="product-options"
          />

          {products.length > 0 && (
            <datalist id="product-options">
              {products.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Base cost</label>
            <input
              name="cost"
              type="number"
              placeholder="Enter cost price"
              onChange={update}
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Stock left</label>
            <input
              name="stock_left"
              type="number"
              placeholder="Units left"
              onChange={update}
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Expiry (days)</label>
            <input
              name="expiry_days"
              type="number"
              placeholder="Days until expiry"
              onChange={update}
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Demand score (1-10)</label>
            <input
              name="demand_score"
              type="number"
              placeholder="1 = low, 10 = very high"
              onChange={update}
              className="input"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Strategy</label>
          <select
            name="strategy"
            onChange={update}
            className="input bg-white text-slate-900"
          >
            <option value="balanced" className="text-black">Balanced – mix of margin & volume</option>
            <option value="aggressive" className="text-black">Aggressive – push for fast sales</option>
            <option value="conservative" className="text-black">Conservative – protect margin</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl text-base sm:text-lg font-semibold
                   bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                   text-white shadow-md hover:shadow-lg
                   hover:brightness-110 active:scale-[0.98]
                   transition-all mt-4"
      >
        Calculate Price
      </button>
    </form>
  );
}
