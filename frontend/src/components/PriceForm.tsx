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
      className="p-6 sm:p-8 bg-white border border-slate-200
                 rounded-3xl shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pricing Input</h2>
        <span className="text-xs sm:text-sm px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Single product
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          name="product"
          placeholder="Product Name"
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

        <input
          name="cost"
          type="number"
          placeholder="Base cost"
          onChange={update}
          className="input"
        />

        <input
          name="stock_left"
          type="number"
          placeholder="Stock Left"
          onChange={update}
          className="input"
        />

        <input
          name="expiry_days"
          type="number"
          placeholder="Expiry (days)"
          onChange={update}
          className="input"
        />

        <input
          name="demand_score"
          type="number"
          placeholder="Demand Score (1-10)"
          onChange={update}
          className="input"
        />

        <select
          name="strategy"
          onChange={update}
          className="input bg-white text-slate-900"
        >
          <option value="balanced" className="text-black">Balanced</option>
          <option value="aggressive" className="text-black">Aggressive</option>
          <option value="conservative" className="text-black">Conservative</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl text-base sm:text-lg font-semibold
                   bg-purple-600 text-white hover:bg-purple-700
                   shadow-sm hover:shadow-md active:scale-[0.99]
                   transition-all mt-4"
      >
        Calculate Price
      </button>
    </form>
  );
}
