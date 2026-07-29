import { TrendingUp } from 'lucide-react';

export default function ScorecardSummary({ items, note }) {
  return (
    <div className="mt-5 rounded-xl bg-slate-50 p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <TrendingUp className="h-4 w-4 text-brand-600" />
        Scorecard summary
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <span className="w-32 shrink-0 text-sm text-slate-600 sm:w-36">{item.label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <span
                className="block h-full rounded-full bg-brand-600"
                style={{ width: `${item.score}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right text-sm font-bold text-slate-800">{item.score}</span>
          </div>
        ))}
      </div>

      {note && <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">{note}</p>}
    </div>
  );
}
