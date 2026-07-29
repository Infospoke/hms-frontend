import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import JobDetailHero from '../components/careers/JobDetailHero.jsx';
import Checklist from '../components/careers/Checklist.jsx';
import ApplyCard from '../components/careers/ApplyCard.jsx';
import RecruiterCard from '../components/careers/RecruiterCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import { normalizeJobDetail } from '../data/jobs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getJobDetailsByIdRequest } from '../lib/api.js';

function formatDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [saved, setSaved] = useState(false);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getJobDetailsByIdRequest(token, jobId, controller.signal)
      .then((result) => {
        setJob(normalizeJobDetail(result.data || {}, jobId));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load this role. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token, jobId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-sm text-slate-500">Loading this role…</p>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-lg font-bold text-slate-900">
          {error ? 'Something went wrong.' : "We couldn't find that role."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {error || 'It may have been closed, or the link is out of date.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard-careers')}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all roles
        </button>
      </main>
    );
  }

  const roleDetails = [
    ['Business unit', job.businessUnit],
    ['Department', job.department],
    ['Country', job.country],
    ['Openings', job.openings],
    ['Target start date', formatDate(job.targetStartDate)],
    ['Education', job.educationRequirements],
    ['Experience required', job.experienceRequirements ? `${job.experienceRequirements} yrs` : null],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <>
      <JobDetailHero
        job={job}
        onBack={() => navigate('/dashboard-careers')}
        onApply={() => navigate(`/dashboard-careers/${job.jobId}/apply`, { state: { job } })}
        saved={saved}
        onToggleSave={() => setSaved((v) => !v)}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1fr_360px] lg:px-10">
        <div className="space-y-10">
          {job.summary && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">About the role</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{job.summary}</p>
            </section>
          )}

          {job.keyResponsibilities.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">What you&apos;ll do</h2>
              <div className="mt-4">
                <Checklist items={job.keyResponsibilities} />
              </div>
            </section>
          )}

          {(job.basicQualifications.length > 0 || job.preferredQualifications.length > 0) && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">What we&apos;re looking for</h2>
              {job.basicQualifications.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Basic qualifications
                  </p>
                  <Checklist items={job.basicQualifications} />
                </div>
              )}
              {job.preferredQualifications.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Preferred qualifications
                  </p>
                  <Checklist items={job.preferredQualifications} />
                </div>
              )}
            </section>
          )}

          {(job.skillsMustHave.length > 0 || job.niceToHaveSkills.length > 0) && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">Skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skillsMustHave.map((skill) => (
                  <Badge key={skill} variant="brand">
                    {skill}
                  </Badge>
                ))}
                {job.niceToHaveSkills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </section>
          )}

          {(job.certificationsRequired.length > 0 || job.languagesRequired.length > 0 || roleDetails.length > 0) && (
            <section>
              <h2 className="text-xl font-bold text-slate-900">Role details</h2>
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
                {roleDetails.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-sm">
                    <span className="shrink-0 text-slate-500">{label}</span>
                    <span className="max-w-[65%] text-right font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
              {job.languagesRequired.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Languages required
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.languagesRequired.map((lang) => (
                      <Badge key={lang}>{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {job.certificationsRequired.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Certifications
                  </p>
                  <Checklist items={job.certificationsRequired} />
                </div>
              )}
              {job.additionalNotes && (
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{job.additionalNotes}</p>
              )}
            </section>
          )}

        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ApplyCard
            job={job}
            onApply={() => navigate(`/dashboard-careers/${job.jobId}/apply`, { state: { job } })}
            onSave={() => setSaved((v) => !v)}
          />
          <RecruiterCard recruiters={job.recruiters} />
        </aside>
      </main>
    </>
  );
}
