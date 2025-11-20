import { useState } from "react";
import PriceForm from "./components/PriceForm";
import ResultCard from "./components/ResultCard";

const App = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-10">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 sm:px-8 py-6 sm:py-7 shadow-lg text-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              RepriceAI
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 mt-2 max-w-2xl">
              Smart, AI-powered pricing suggestions for your grocery products based on cost,
              stock, expiry and demand.
            </p>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
          <PriceForm onResult={setResult} />
          <ResultCard data={result} />
        </main>
      </div>
    </div>
  );
};

export default App;
