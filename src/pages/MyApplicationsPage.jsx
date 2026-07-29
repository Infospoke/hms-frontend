import { useEffect, useState } from 'react';
import ApplicationCard from '../components/careers/ApplicationCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyApplicationsRequest } from '../lib/api.js';
import { normalizeApiApplication } from '../data/applications.js';

export default function MyApplicationsPage() {
  const { token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(err.message || 'Could not load your applications. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [token]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Your journey</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">My applications</h1>
        <p className="mt-3 max-w-xl text-slate-500">
          Every stage change lands here &mdash; and in your inbox and texts, in plain language.
        </p>

        <div className="mt-8 space-y-5">
          {loading && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading your applications…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              You haven&apos;t applied to any roles yet.
            </div>
          )}

          {!loading &&
            !error &&
            applications.map((application) => (
              <ApplicationCard key={application.applicationId} application={application} />
            ))}
        </div>
      </main>
  );
}
