import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Clock, Check, Eye } from 'lucide-react';
import ResumePreviewModal from '../components/careers/ResumePreviewModal.jsx';
import FileUpload from '../components/ui/FileUpload.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import { normalizeJobDetail } from '../data/jobs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getJobDetailsByIdRequest, getCandidateDetailsRequest, applyJobRequest } from '../lib/api.js';

/** Read-only field: styled to look like the other inputs but never editable. */
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      <div
        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600"
        aria-readonly="true"
      >
        {value || '—'}
      </div>
    </div>
  );
}

/** "candidate-documents/CID-2026-0004_resume.pdf" -> "CID-2026-0004_resume.pdf" */
function filenameFromPath(path) {
  if (!path) return '';
  const parts = String(path).split('/');
  return parts[parts.length - 1];
}

/** Maps GET /hms/candidate/details/:candidateId into the shape this page renders. */
function normalizeCandidateDetail(raw) {
  return {
    candidateId: raw.candidateId,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    resumeFileName: filenameFromPath(raw.resume),
    additionalFileName: filenameFromPath(raw.additionalFile),
  };
}

export default function ApplicationFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();

  // The job detail page already fetched this job — reuse it via route
  // state instead of calling get-job-details again. Only falls back to a
  // fresh fetch if the page was opened directly (no state), e.g. a
  // bookmarked/refreshed apply URL.
  const [job, setJob] = useState(location.state?.job ?? null);
  const [jobLoading, setJobLoading] = useState(!location.state?.job);
  const [jobError, setJobError] = useState('');

  useEffect(() => {
    if (location.state?.job) return;
    const controller = new AbortController();
    setJobLoading(true);
    setJobError('');

    getJobDetailsByIdRequest(token, jobId, controller.signal)
      .then((result) => {
        setJob(normalizeJobDetail(result.data || {}, jobId));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setJobError(err.message || 'Could not load this role. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setJobLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, jobId]);

  // The candidate's own profile — real name/email/phone/resume-on-file,
  // fetched by the candidateId decoded from the login token (never
  // hardcoded, never a mock).
  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [candidateError, setCandidateError] = useState('');

  useEffect(() => {
    if (!user?.candidateId) return;
    const controller = new AbortController();
    setCandidateLoading(true);
    setCandidateError('');

    getCandidateDetailsRequest(token, user.candidateId, controller.signal)
      .then((result) => {
        setCandidate(normalizeCandidateDetail(result.data || {}));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setCandidateError(err.message || 'Could not load your profile. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCandidateLoading(false);
      });

    return () => controller.abort();
  }, [token, user?.candidateId]);

  const hasResumeOnFile = Boolean(candidate?.resumeFileName);

  const [resumeChoice, setResumeChoice] = useState('on-file'); // 'on-file' | 'new'
  const [newResume, setNewResume] = useState(null);
  const [consent, setConsent] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // If the candidate has no resume on file at all, there's nothing to
  // default to — push them straight to the upload option.
  useEffect(() => {
    if (!candidateLoading && !hasResumeOnFile) setResumeChoice('new');
  }, [candidateLoading, hasResumeOnFile]);

  const [savedAt, setSavedAt] = useState(Date.now());
  // Re-touch the "saved" timestamp whenever a choice on the form changes,
  // simulating the autosave shown in the design ("Saved just now").
  useEffect(() => {
    setSavedAt(Date.now());
  }, [resumeChoice, newResume, consent]);

  const [savedLabel, setSavedLabel] = useState('Saved just now');
  useEffect(() => {
    const tick = () => {
      const seconds = Math.round((Date.now() - savedAt) / 1000);
      if (seconds < 5) setSavedLabel('Saved just now');
      else if (seconds < 60) setSavedLabel(`Saved ${seconds}s ago`);
      else setSavedLabel(`Saved ${Math.round(seconds / 60)}m ago`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [savedAt]);

  const canApply = useMemo(() => {
    if (!consent || candidateLoading || !candidate) return false;
    if (resumeChoice === 'new' && !newResume) return false;
    if (resumeChoice === 'on-file' && !hasResumeOnFile) return false;
    return true;
  }, [consent, candidateLoading, candidate, resumeChoice, newResume, hasResumeOnFile]);

  const handleBackToRole = () => navigate(`/dashboard-careers/${jobId}`);

  const handleApply = async () => {
    if (!canApply || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await applyJobRequest(token, {
        candidateId: candidate.candidateId,
        jobId,
        // "old" resume on file needs no file part at all — the backend
        // already has it keyed by candidateId; only a freshly uploaded
        // resume gets attached here.
        resumeFile: resumeChoice === 'new' ? newResume : undefined,
      });
      navigate('/dashboard-careers/applications');
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (jobLoading || candidateLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    );
  }

  if (jobError || !job) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-lg font-bold text-slate-900">
          {jobError ? 'Something went wrong.' : "We couldn't find that role."}
        </p>
        <p className="mt-2 text-sm text-slate-500">{jobError}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard-careers')}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <span aria-hidden="true">‹</span>
          Back to all roles
        </button>
      </main>
    );
  }

  if (candidateError || !candidate) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-lg font-bold text-slate-900">Something went wrong.</p>
        <p className="mt-2 text-sm text-slate-500">
          {candidateError || 'Could not load your profile. Please try again.'}
        </p>
        <button
          type="button"
          onClick={handleBackToRole}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <span aria-hidden="true">‹</span>
          Back to role
        </button>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <button
          type="button"
          onClick={handleBackToRole}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <span aria-hidden="true">‹</span>
          Back to role
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{job.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {[job.department, job.location, job.employmentType].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600">
              <Clock className="h-3.5 w-3.5" />
              About 1 minute
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              {savedLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900">Your details</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Pulled from your Nexus account — no need to retype anything.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="First name" value={candidate.firstName} />
              <ReadOnlyField label="Last name" value={candidate.lastName} />
              <ReadOnlyField label="Email" value={candidate.email} />
              <ReadOnlyField label="Phone" value={candidate.phoneNumber} />
            </div>
          </section>

          <hr className="my-8 border-slate-100" />

          <section>
            <h2 className="text-xl font-bold text-slate-900">Resume</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Use the resume already on file, or upload a new one for this role.
            </p>

            <div className="mt-5 space-y-3">
              <label
                htmlFor="resume-on-file"
                className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition ${
                  !hasResumeOnFile
                    ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60'
                    : resumeChoice === 'on-file'
                      ? 'cursor-pointer border-brand-500 bg-brand-50/60'
                      : 'cursor-pointer border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      id="resume-on-file"
                      type="radio"
                      name="resume-choice"
                      checked={resumeChoice === 'on-file'}
                      disabled={!hasResumeOnFile}
                      onChange={() => setResumeChoice('on-file')}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-brand-600 checked:bg-brand-600 transition disabled:cursor-not-allowed"
                    />
                    <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      {hasResumeOnFile ? candidate.resumeFileName : 'No resume on file'}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {hasResumeOnFile ? 'Already on file' : 'Upload a resume below to apply'}
                    </span>
                  </span>
                </span>

                {hasResumeOnFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPreview(true);
                    }}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                )}
              </label>

              <label
                htmlFor="resume-new"
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-5 py-4 transition ${
                  resumeChoice === 'new'
                    ? 'border-brand-500 bg-brand-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <input
                    id="resume-new"
                    type="radio"
                    name="resume-choice"
                    checked={resumeChoice === 'new'}
                    onChange={() => setResumeChoice('new')}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-brand-600 checked:bg-brand-600 transition"
                  />
                  <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Upload a new resume</span>
                  <span className="block text-xs text-slate-500">PDF, DOCX or TXT · up to 10 MB</span>
                </span>
              </label>

              {resumeChoice === 'new' && (
                <div className="pl-1 pt-1">
                  <FileUpload
                    label={null}
                    accept=".pdf,.doc,.docx,.txt"
                    hint="PDF, DOCX or TXT (Max. 10MB)"
                    file={newResume}
                    onFileChange={setNewResume}
                  />
                </div>
              )}
            </div>
          </section>

          <hr className="my-8 border-slate-100" />

          <section>
            <h2 className="text-xl font-bold text-slate-900">Privacy</h2>
            <p className="mt-1.5 text-sm text-slate-500">One thing to confirm before you apply.</p>

            <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 px-5 py-4">
              <Checkbox
                id="privacy-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                label={
                  <span>
                    <span className="font-semibold text-slate-800">
                      I consent to Nexus processing my application data <span className="text-rose-500">*</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Used only to evaluate your application. Retained for 12 months, then deleted.
                    </span>
                  </span>
                }
              />
            </div>
          </section>

          {submitError && (
            <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {submitError}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleApply}
              disabled={!canApply || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? 'Submitting…' : 'Apply now'}
              {!submitting && <Check className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </main>

      {showPreview && hasResumeOnFile && (
        <ResumePreviewModal resume={{ name: candidate.resumeFileName }} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}
