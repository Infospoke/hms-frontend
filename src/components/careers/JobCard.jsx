import { Link } from 'react-router-dom';
import { Bookmark, Briefcase, MapPin, Users } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function JobCard({ job, saved = false, onToggleSave }) {
  const { title, jobCode, location, modeType, level, remote, experienceLabel, skills, totalApplications } = job;

  return (
    <Link
      to={`/dashboard-careers/${job.id}`}
      className="group flex w-full flex-col rounded-2xl border-2 border-slate-100 bg-white p-6 text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-brand-600 hover:shadow-xl hover:shadow-brand-600/10"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 transition-transform duration-200 group-hover:scale-105">
            <Briefcase className="h-5 w-5 text-brand-600" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {jobCode && <p className="text-sm text-slate-500">{jobCode}</p>}
          </div>
        </div>

        <span
          role="button"
          aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave?.(job.id);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors duration-200 group-hover:border-brand-200 group-hover:text-brand-500 hover:!border-brand-600 hover:!text-brand-600"
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge icon={<MapPin className="h-3 w-3" />}>
          {location} · {modeType}
        </Badge>
        <Badge>{level}</Badge>
        {remote && <Badge variant="brand">Remote</Badge>}
      </div>

      {skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="font-bold text-slate-900">{experienceLabel}</span>
        {/* <span className="flex items-center gap-1 text-slate-400">
          <Users className="h-3.5 w-3.5" />
          {totalApplications} applicant{totalApplications === 1 ? '' : 's'}
        </span> */}
      </div>
    </Link>
  );
}
