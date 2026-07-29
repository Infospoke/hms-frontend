import { useEffect, useState } from 'react';
import { UpcomingInterviewCard, CompletedInterviewCard } from '../components/careers/InterviewCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getCandidateInterviewsRequest } from '../lib/api.js';
import { normalizeApiInterview } from '../data/interviews.js';

function SectionHeading({ label, count }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-base font-bold text-slate-900">{label}</h2>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
        {count}
      </span>
    </div>
  );
}

export default function InterviewsPage() {
  const { token } = useAuth();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // React.StrictMode (main.jsx) deliberately mounts every component
    // twice in dev to surface effects that aren't cleanup-safe. Without an
    // AbortController the first run's fetch still went all the way to the
    // server even though its result was discarded — the API was genuinely
    // being called twice per page view. Aborting on cleanup cancels that
    // first in-flight request instead of just ignoring its response.
    const controller = new AbortController();

    setLoading(true);
    setError('');

    getCandidateInterviewsRequest(token, controller.signal)
      .then((result) => {
        setInterviews((result.data || []).map(normalizeApiInterview));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load your interviews. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [token]);

  const upcoming = interviews.filter((interview) => interview.isUpcoming);
  const past = interviews.filter((interview) => !interview.isUpcoming);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Interview hub</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Your interviews</h1>
        <p className="mt-3 max-w-xl text-slate-500">Join, prep, reschedule, and review — all in one place.</p>

        {loading && (
          <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading your interviews…
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && interviews.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
            You don&apos;t have any interviews scheduled yet.
          </div>
        )}

        {!loading && !error && upcoming.length > 0 && (
          <div className="mt-10">
            <SectionHeading label="Upcoming" count={upcoming.length} />
            <div className="mt-4 space-y-5">
              {upcoming.map((interview) => (
                <UpcomingInterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && past.length > 0 && (
          <div className="mt-10">
            <SectionHeading label="Past" count={past.length} />
            <div className="mt-4 space-y-5">
              {past.map((interview) => (
                <CompletedInterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
        )}
      </main>
  );
}
