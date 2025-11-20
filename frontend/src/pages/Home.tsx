import { useState } from "react";
import PriceForm from "../components/PriceForm";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            RepriceAI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-md">
            Smart, AI-powered pricing suggestions for your grocery products based on cost,
            stock, expiry and demand.
          </p>

          <PriceForm onResult={setResult} onLoading={setLoading} />
          {loading && <Loader />}        
        </div>

        <div className="flex-1 lg:pt-10">
          {!loading && <ResultCard data={result} />}
        </div>
      </div>
    </div>
  );
}


