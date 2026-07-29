import { MapPin, Video } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import InterviewTypeBadge from './InterviewTypeBadge.jsx';

function DateBlock({ month, day, muted }) {
  return (
    <div
      className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-xl py-3 ${
        muted ? 'bg-slate-100 text-slate-500' : 'bg-brand-50 text-brand-700'
      }`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wide">{month}</span>
      <span className="text-2xl font-extrabold leading-none">{day}</span>
    </div>
  );
}

function InterviewMeta({ interview }) {
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-slate-500">
      <span>{interview.jobTitle}</span>
      {interview.dateLabel && <span>· {interview.dateLabel}</span>}
      {interview.timeRange && <span>· {interview.timeRange}</span>}
      {interview.durationLabel && <span>· {interview.durationLabel}</span>}
    </p>
  );
}

export function UpcomingInterviewCard({ interview }) {
  return (
    <div className="relative">
      <span className="absolute -left-px top-4 bottom-4 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
      <div className="rounded-2xl border border-slate-100 bg-white p-6 pl-8 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row">
          <DateBlock month={interview.dateMonth} day={interview.dateDay} />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-slate-900">{interview.interviewType}</h3>
              <InterviewTypeBadge type={interview.typeCategory} label={interview.interviewType} />
            </div>
            <InterviewMeta interview={interview} />
            {interview.recruiterName && (
              <p className="mt-1 text-sm text-slate-500">With {interview.recruiterName}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {interview.isOnline ? (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5"
                >
                  <Video className="h-4 w-4" />
                  Join call
                </a>
              ) : interview.venueDetails ? (
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  {interview.venueDetails}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompletedInterviewCard({ interview }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row">
        <DateBlock month={interview.dateMonth} day={interview.dateDay} muted />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-bold text-slate-900">{interview.interviewType}</h3>
            <Badge variant="default" icon={<span className="h-1.5 w-1.5 rounded-full bg-current" />}>
              Past
            </Badge>
          </div>
          <InterviewMeta interview={interview} />
          {interview.recruiterName && (
            <p className="mt-1 text-sm text-slate-500">With {interview.recruiterName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
