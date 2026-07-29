import { useEffect, useMemo, useState } from 'react';
import HiringStepper from '../components/careers/HiringStepper.jsx';
import JobSearchCard from '../components/careers/JobSearchCard.jsx';
import JobFilterBar from '../components/careers/JobFilterBar.jsx';
import JobCard from '../components/careers/JobCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import { normalizeJobSummary, matchesLevelFilter } from '../data/jobs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getJobsList } from '../lib/api.js';

export default function CareersPage() {
  const { token } = useAuth();
  const [category, setCategory] = useState('all'); // 'all' | 'On-site' | 'Hybrid' | 'Remote' (modeType)
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('Anywhere');
  const [level, setLevel] = useState('All levels');
  const [savedIds, setSavedIds] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getJobsList(token, {}, controller.signal)
      .then((result) => {
        setJobs((result?.data || []).map(normalizeJobSummary));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load open roles. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token]);

  const toggleSave = (id) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Built from the actual job list rather than a fixed enum — the API has
  // no location catalog, just whatever string each job record carries.
  const locationOptions = useMemo(() => {
    const seen = new Map();
    for (const job of jobs) {
      const key = job.location.toLowerCase();
      if (key && !seen.has(key)) seen.set(key, job.location);
    }
    return ['Anywhere', ...seen.values()];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesCategory = category === 'all' || job.modeType === category;
      const matchesKeyword = job.title.toLowerCase().includes(keyword.toLowerCase());
      const matchesLocation = location === 'Anywhere' || job.location === location;
      const matchesLevel = matchesLevelFilter(job, level);
      return matchesCategory && matchesKeyword && matchesLocation && matchesLevel;
    });
  }, [jobs, category, keyword, location, level]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 pb-20 pt-10 shadow-card sm:px-10">
          <Badge
            variant="default"
            className="bg-white/15 text-white"
            icon={<span className="h-1.5 w-1.5 rounded-full bg-white" />}
          >
            We're hiring &middot; <strong>{jobs.length}</strong> open roles
          </Badge>

          <h1 className="mt-6 max-w-xl text-6xl font-extrabold leading-tight text-white">
            Build what&apos;s next at Nexus.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Cloud infrastructure that scales with your ambition. We hire curious builders and give
            them room to run.
          </p>

          <div className="mt-8 border-t border-white/20 pt-8">
            <p className="mb-6 text-xs font-bold uppercase tracking-wider text-white/60">
              Our hiring process &mdash; start to finish
            </p>
            <HiringStepper activeIds={['hired','applied']} />
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        {/* Search card floats up over the hero/body boundary */}
        <div className="relative z-10 -mt-10">
          <JobSearchCard
            keyword={keyword}
            onKeywordChange={setKeyword}
            location={location}
            onLocationChange={setLocation}
            locationOptions={locationOptions}
            level={level}
            onLevelChange={setLevel}
          />
        </div>

        <div className="mt-6">
          <JobFilterBar category={category} onCategoryChange={setCategory} />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Open roles</h2>
          <span className="text-sm text-slate-500">{filteredJobs.length} roles</span>
        </div>

        {loading && (
          <p className="mt-10 text-center text-sm text-slate-500">Loading open roles…</p>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} saved={savedIds.includes(job.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-500">
            No roles match your filters right now &mdash; try clearing a filter or check back soon.
          </p>
        )}
      </main>
    </>
  );
}
