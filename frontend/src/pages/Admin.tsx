import { useState } from "react";

type Prices = Record<string, number>;

interface SearchResult {
  name: string;
}

export default function Admin() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [prices, setPrices] = useState<Prices>({});

  const searchProducts = async () => {
    const res = await fetch(`http://localhost:8000/search-products?q=${query}`);
    const data = await res.json();
    setResults(data.results);
  };

  const loadProduct = async (name: string) => {
    setSelectedProduct(name);
    const res = await fetch(`http://localhost:8000/get-product?name=${name}`);
    const data = await res.json();
    setPrices(data.prices || {});
  };

  const savePrices = async () => {
    await fetch("http://localhost:8000/update-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: selectedProduct,
        prices,
      }),
    });
    alert("Updated!");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border px-3 py-2"
        placeholder="Search product..."
      />
      <button
        onClick={searchProducts}
        className="bg-blue-500 text-white px-3 py-2 ml-2"
      >
        Search
      </button>

      <ul className="mt-4">
        {results.map((r) => (
          <li
            key={r.name}
            onClick={() => loadProduct(r.name)}
            className="cursor-pointer underline"
          >
            {r.name}
          </li>
        ))}
      </ul>

      {selectedProduct && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">{selectedProduct}</h2>

          {["zepto", "blinkit", "amazon"].map((c) => (
            <div key={c} className="mt-2">
              <label>{c}</label>
              <input
                type="number"
                className="border ml-2 px-2"
                value={prices[c] || ""}
                onChange={(e) =>
                  setPrices({ ...prices, [c]: Number(e.target.value) })
                }
              />
            </div>
          ))}

          <button
            onClick={savePrices}
            className="bg-green-600 text-white px-4 py-2 mt-4"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
