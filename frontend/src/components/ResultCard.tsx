interface Props {
  data: any;
}

export default function ResultCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="mt-6 lg:mt-0 p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 text-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold leading-tight">{data.product}</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">AI-driven pricing recommendation</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {data.urgency}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Recommended Price</p>
          <p className="text-2xl font-semibold">₹{data.recommended_price}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Discount</p>
          <p className="text-lg font-semibold">{data.discount_percent}% off</p>
        </div>
      </div>

      <div className="text-xs sm:text-sm text-slate-600 pt-4 border-t border-slate-200 leading-relaxed">
        {data.reasoning}
      </div>
    </div>
  );
}
