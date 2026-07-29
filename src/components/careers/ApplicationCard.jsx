import { Link } from 'react-router-dom';
import { CheckSquare, MapPin, RefreshCw } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import MiniStageProgress from './MiniStageProgress.jsx';

export default function ApplicationCard({ application }) {
  const {
    applicationId,
    jobTitle,
    location,
    employmentType,
    appliedDaysAgo,
    currentRound,
    activeIndex,
    totalRounds,
    reuploadRequested,
  } = application;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <Link
        to={`/dashboard-careers/applications/${applicationId}`}
        className="flex flex-1 items-start gap-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <CheckSquare className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900">{jobTitle}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
            <span>Nexus</span>
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                {location}
              </span>
            )}
            {employmentType && <span>{employmentType}</span>}
            <span>
              Applied {appliedDaysAgo} {appliedDaysAgo === 1 ? 'day' : 'days'} ago
            </span>
          </p>
          <MiniStageProgress activeIndex={activeIndex} totalSteps={totalRounds} className="mt-3" />
          {reuploadRequested && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
              <RefreshCw className="h-3.5 w-3.5" />
              Resume re-upload requested
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
        <Badge variant="brand" icon={<span className="h-1.5 w-1.5 rounded-full bg-current" />}>
          {currentRound || 'In progress'}
        </Badge>
        <Link
          to={`/dashboard-careers/applications/${applicationId}`}
          className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
