import { useState } from "react";
import PriceForm from "./components/PriceForm";
import ResultCard from "./components/ResultCard";

const App = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white px-6 py-10">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">
          RepriceAI
        </h1>
        <p className="text-gray-300 mt-2 text-lg">
          AI-powered dynamic pricing for real-world retail.
        </p>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        <PriceForm onResult={setResult} />
        <ResultCard data={result} />
      </main>
    </div>
  );
};

export default App;
