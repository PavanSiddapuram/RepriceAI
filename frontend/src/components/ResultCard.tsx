interface ResultCardProps {
  data: any;
}

export default function ResultCard({ data }: ResultCardProps) {
  if (!data) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="mt-6 lg:mt-0 p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-colors"
          >
            <span className="sr-only">Go back</span>
            <span className="text-base">←</span>
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              AI Recommendation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Optimized price and discount based on your inputs and competitors.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {data.urgency}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Product
          </p>
          <p className="text-sm sm:text-base font-semibold text-slate-900 break-words">
            {data.product}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Recommended Price
          </p>
          <p className="text-xl font-semibold text-slate-900">₹{data.recommended_price}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Discount
          </p>
          <p className="text-lg font-semibold text-slate-900">{data.discount_percent}% off</p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center">
          <p className="text-xs sm:text-sm text-slate-600 leading-snug">
            Urgency level reflects stock, expiry and demand to guide how fast you should sell.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed">
        {data.reasoning}
      </div>
    </div>
  );
}
