import { ChevronLeft, Share2, Bookmark, Briefcase, MapPin } from 'lucide-react';

/** job: normalizeJobDetail() output. */
export default function JobDetailHero({ job, onBack, onApply, saved, onToggleSave }) {
  const { title, department, businessUnit, location, workMode, employmentType, jobCode } = job;

  return (
    <div className="border-b border-slate-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          All roles
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
              <Briefcase className="h-6 w-6 text-brand-600" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                {(department || businessUnit) && (
                  <span className="font-semibold text-slate-700">{department || businessUnit}</span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    {location}
                  </span>
                )}
                {workMode && <span>{workMode}</span>}
                {employmentType && <span>{employmentType}</span>}
                {jobCode && <span className="text-slate-400">{jobCode}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:gap-3">
            {/* <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button> */}
            <button
              type="button"
              onClick={onToggleSave}
              className={`flex items-center gap-1.5 text-sm font-semibold transition ${
                saved ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600' : ''}`} />
              Save
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5"
            >
              Apply now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
