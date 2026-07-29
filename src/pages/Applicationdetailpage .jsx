import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckSquare, MapPin, Clock, Check, Circle, RefreshCw } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import ResumeUploadModal from '../components/careers/ResumeUploadModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyApplicationsRequest, resumeReuploadRequest } from '../lib/api.js';
import { normalizeApiApplication } from '../data/applications.js';

const STATUS_LABEL = {
  completed: 'Completed',
  'in-progress': 'Scheduled',
  upcoming: 'Upcoming',
};

const STATUS_BADGE_CLASS = {
  completed: 'bg-brand-50 text-brand-600',
  'in-progress': 'bg-brand-50 text-brand-600',
  upcoming: 'bg-slate-100 text-slate-500',
};

export default function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const { token } = useAuth();

  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadSubmitting, setReuploadSubmitting] = useState(false);
  const [reuploadError, setReuploadError] = useState('');

  useEffect(() => {
   
    const controller = new AbortController();

    setLoading(true);
    setError('');

    getMyApplicationsRequest(token, controller.signal)
      .then((result) => {
        setApplications((result.data || []).map(normalizeApiApplication));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load your application. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [token]);

  const application = applications?.find((a) => String(a.applicationId) === String(applicationId));

  const handleResumeSubmit = async ({ file, setAsProfile }) => {
    setReuploadSubmitting(true);
    setReuploadError('');
    try {
      await resumeReuploadRequest(token, {
        applicationId: application.applicationId,
        updateProfileResume: setAsProfile,
        resumeFile: file,
      });
      setApplications((prev) =>
        (prev || []).map((a) =>
          String(a.applicationId) === String(applicationId)
            ? { ...a, reuploadRequested: false, reuploadMessage: null }
            : a,
        ),
      );
      setShowReuploadModal(false);
    } catch (err) {
      setReuploadError(err.message || 'Could not upload your resume. Please try again.');
    } finally {
      setReuploadSubmitting(false);
    }
  };

  const closeReuploadModal = () => {
    if (reuploadSubmitting) return;
    setShowReuploadModal(false);
    setReuploadError('');
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-10">
        <p className="text-sm text-slate-500">Loading your application…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-10">
        <p className="text-sm font-medium text-rose-700">{error}</p>
        <Link
          to="/dashboard-careers/applications"
          className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          &larr; Back to all applications
        </Link>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-10">
        <p className="text-slate-500">We couldn&apos;t find that application.</p>
        <Link
          to="/dashboard-careers/applications"
          className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          &larr; Back to all applications
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <Link
        to="/dashboard-careers/applications"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        All applications
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <CheckSquare className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{application.jobTitle}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
              <span>Nexus</span>
              {application.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  {application.location}
                </span>
              )}
              {application.employmentType && <span>{application.employmentType}</span>}
              <span>
                Applied {application.appliedDaysAgo}{' '}
                {application.appliedDaysAgo === 1 ? 'day' : 'days'} ago
              </span>
            </p>
          </div>
        </div>
        <Badge variant="brand" icon={<span className="h-1.5 w-1.5 rounded-full bg-current" />}>
          {application.currentRound || 'In progress'}
        </Badge>
      </div>

      {application.reuploadRequested && (
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
            <RefreshCw className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-orange-900">
              Your recruiter has requested an updated resume
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-orange-800/80">
              {application.reuploadMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                setReuploadError('');
                setShowReuploadModal(true);
              }}
              className="mt-4 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Upload new resume
            </button>
          </div>
        </div>
      )}

      <div className="mt-10">
        {application.timeline.map((entry, index) => {
          const isLast = index === application.timeline.length - 1;
          const Icon = entry.status === 'completed' ? Check : entry.status === 'in-progress' ? Clock : Circle;

          return (
            <div key={entry.key} className="relative flex gap-5 pb-10 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px -translate-x-1/2 ${
                    entry.status === 'completed' ? 'bg-brand-300' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                  entry.status === 'completed'
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : entry.status === 'in-progress'
                      ? 'border-brand-600 bg-white text-brand-600'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-base font-bold ${entry.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}
                  >
                    {entry.roundName}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[entry.status]}`}
                  >
                    {STATUS_LABEL[entry.status]}
                  </span>
                </div>

                {entry.dateLabel ? (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-sm ${
                      entry.status === 'in-progress' ? 'font-semibold text-brand-600' : 'text-slate-500'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {entry.dateLabel}
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-slate-400">Not yet scheduled.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showReuploadModal && (
        <ResumeUploadModal
          jobTitle={application.jobTitle}
          message={application.reuploadMessage}
          submitting={reuploadSubmitting}
          error={reuploadError}
          onClose={closeReuploadModal}
          onSubmit={handleResumeSubmit}
        />
      )}
    </main>
  );
}
