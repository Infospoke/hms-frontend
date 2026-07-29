import { Mail } from 'lucide-react';

/** recruiters: normalizeJobDetail().recruiters — [{ name, email, initials, assignedAt }]. */
export default function RecruiterCard({ recruiters }) {
  if (!recruiters || recruiters.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {recruiters.length > 1 ? 'Meet your recruiters' : 'Meet your recruiter'}
      </p>

      <div className="mt-4 space-y-4">
        {recruiters.map((recruiter) => (
          <div key={recruiter.email || recruiter.name}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                {recruiter.initials || '?'}
              </span>
              <div>
                <p className="font-bold text-slate-900">{recruiter.name}</p>
                {recruiter.email && <p className="text-sm text-slate-500">{recruiter.email}</p>}
              </div>
            </div>

            {recruiter.email && (
              <a
                href={`mailto:${recruiter.email}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-brand-600 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                <Mail className="h-4 w-4" />
                Contact {recruiter.name?.split(' ')[0] || 'recruiter'}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
