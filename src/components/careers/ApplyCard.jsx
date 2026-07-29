import { Users } from 'lucide-react';

/**
 * job: normalizeJobDetail() output. There's no salary field in the API, so
 * the headline is the experience requirement (real data) instead of a
 * fabricated comp figure. Every line here comes from the API response —
 * nothing fabricated/decorative.
 */
export default function ApplyCard({ job, onApply, onSave }) {
  const { experienceLabel, openings, applicantCount } = job;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
      <p className="text-2xl font-extrabold text-slate-900">{experienceLabel}</p>
      {typeof openings === 'number' && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          {openings} opening{openings === 1 ? '' : 's'}
          {/* {typeof applicantCount === 'number' ? ` · ${applicantCount} applied so far` : ''} */}
        </p>
      )}
      <button
        type="button"
        onClick={onApply}
        className="mt-5 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5"
      >
        Apply now
      </button>
      <button
        type="button"
        onClick={onSave}
        className="mt-3 w-full text-center text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        Save for later
      </button>
    </div>
  );
}
