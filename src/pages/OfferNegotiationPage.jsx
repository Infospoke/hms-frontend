import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  Check,
  Upload,
  FileText,
  X
} from 'lucide-react';

import NegotiationItemRow from '../components/careers/NegotiationItemRow.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getOfferDetailsByApplicantIdRequest,
  negotiateOfferRequest
} from '../lib/api.js';

import {
  normalizeOfferDetail,
  buildNegotiationItems,
  formatCurrency
} from '../data/offers.js';

const EMPTY_VALUE = {
  requested: '',
  reason: ''
};

/** Strips currency formatting ("$180,000" -> 180000) */
function parseAmount(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '');
  const n = Number(cleaned);

  return Number.isFinite(n) ? n : 0;
}

export default function OfferNegotiationPage() {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const offerId = location.state?.offerId ?? null;
  const jobId = location.state?.jobId ?? null;

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [values, setValues] = useState({});

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [justification, setJustification] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* =========================================================
     NEGOTIATION ERROR DIALOG
  ========================================================= */

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  /* =========================================================
     LOAD OFFER
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setLoadError('');

    getOfferDetailsByApplicantIdRequest(
      token,
      applicantId,
      controller.signal
    )
      .then((result) => {
        setOffer(
          normalizeOfferDetail(result.data || {})
        );
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;

        setLoadError(
          err.message ||
          'Could not load this offer. Please try again.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [token, applicantId]);

  const totalComp = offer?.offeredCtc ?? 0;

  const items = useMemo(
    () => (offer ? buildNegotiationItems(offer) : []),
    [offer]
  );

  /* =========================================================
     SELECT / UPDATE ITEMS
  ========================================================= */

  const allSelected =
    items.length > 0 &&
    selectedIds.size === items.length;

  const toggleItem = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    setValues((prev) =>
      prev[id]
        ? prev
        : {
            ...prev,
            [id]: EMPTY_VALUE
          }
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(items.map((item) => item.id))
      );

      setValues((prev) => {
        const next = { ...prev };

        items.forEach((item) => {
          if (!next[item.id]) {
            next[item.id] = EMPTY_VALUE;
          }
        });

        return next;
      });
    }
  };

  const updateValue = (id, value) => {
    setValues((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  /* =========================================================
     FILES
  ========================================================= */

  const handleFiles = (fileList) => {
    const next = Array.from(fileList ?? [])
      .slice(0, 5 - files.length);

    if (next.length) {
      setFiles((prev) =>
        [...prev, ...next].slice(0, 5)
      );
    }
  };

  const removeFile = (index) => {
    setFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const isItemComplete = (id) => {
    const item = items.find(
      (i) => i.id === id
    );

    const value =
      values[id] ?? EMPTY_VALUE;

    if (item?.optional) {
      return true;
    }

    if (id === 'other') {
      return value.reason.trim().length > 0;
    }

    return (
      value.requested.trim().length > 0 &&
      value.reason.trim().length > 0
    );
  };

  const canSubmit =
    confirmed &&
    selectedIds.size > 0 &&
    Array.from(selectedIds).every(
      (id) => isItemComplete(id)
    ) &&
    !submitting;

  /* =========================================================
     SUBMIT NEGOTIATION
  ========================================================= */

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const negotiation = Array.from(selectedIds)
      .filter(
        (id) =>
          id !== 'other' &&
          id !== 'joining-date'
      )
      .map((id) => {
        const item = items.find(
          (i) => i.id === id
        );

        const value =
          values[id] ?? EMPTY_VALUE;

        const requestedAmount =
          value.requested.trim()
            ? parseAmount(value.requested)
            : parseAmount(
                item?.currentValue ?? 0
              );

        const reason =
          value.reason.trim()
            ? value.reason
            : (item?.currentReason ?? '');

        return {
          fieldName: item.label,
          requestedAmount,
          reason
        };
      });

    const others = selectedIds.has('other')
      ? values.other?.reason || ''
      : '';

    const joiningDateValue =
      values['joining-date']?.requested?.trim();

    const joiningDate =
      selectedIds.has('joining-date')
        ? (
            joiningDateValue ||
            offer.joiningDate ||
            null
          )
        : null;

    const reasonForJoiningDateValue =
      values['joining-date']?.reason?.trim();

    const reasonForJoiningDate =
      selectedIds.has('joining-date')
        ? (
            reasonForJoiningDateValue ||
            null
          )
        : null;

    setSubmitting(true);
    setSubmitError('');

    try {
      await negotiateOfferRequest(
        token,
        {
          offerId:
            offerId ??
            offer.offerId ??
            null,

          applicantId: Number(applicantId),

          jobId:
            jobId ??
            offer.jobId ??
            null,

          overallJustification:
            justification,

          others,

          joiningDate,

          reasonForJoiningDate,

          negotiation
        },
        files
      );

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSubmitted(true);

    } catch (err) {

      console.error(
        'Negotiation request failed:',
        err
      );

      /* =====================================================
         BACKEND ERROR

         Example:

         {
           "errors": [
             "Total requested amount of 600010 exceeds
              the maximum salary of 500000"
           ],
           "message": "Failure",
           "responsecode": "01"
         }
      ===================================================== */

      const backendMessage =
        err?.errors?.[0] ||
        err?.message ||
        'Could not send your negotiation request. Please try again.';

      /*
       * Show dialog only for backend responsecode 01.
       */
      if (err?.responsecode === '01') {

        setErrorDialogMessage(
          backendMessage
        );

        setShowErrorDialog(true);

      } else {

        /*
         * Keep existing inline error behaviour
         * for other errors.
         */
        setSubmitError(
          backendMessage
        );
      }

    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-sm text-slate-500">
          Loading your offer…
        </p>
      </main>
    );
  }

  /* =========================================================
     LOAD ERROR
  ========================================================= */

  if (loadError || !offer) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">

        <p className="text-lg font-bold text-slate-900">
          {loadError
            ? 'Something went wrong.'
            : "We couldn't find that offer."}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {loadError ||
            'It may have been withdrawn, or the link is out of date.'}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/dashboard-careers/offer'
            )
          }
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all offers
        </button>

      </main>
    );
  }

  /* =========================================================
     SUBMITTED
  ========================================================= */

  if (submitted) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center lg:px-10">

        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-8 w-8" />
        </span>

        <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
          Negotiation request sent
        </h1>

        <p className="mt-3 text-slate-500">
          {offer.recruiter
            ? `${offer.recruiter} will review`
            : 'Our team will review'}{' '}
          your request and follow up as soon as possible.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/dashboard-careers/offer/${applicantId}/${offerId}`
            )
          }
          className="mt-8 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5"
        >
          Back to offer
        </button>

      </main>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">

      <button
        type="button"
        onClick={() =>
          navigate(
            `/dashboard-careers/offer/${applicantId}/${offerId}`
          )
        }
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to offer
      </button>

      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Offer negotiation
      </h1>

      <p className="mt-3 max-w-xl text-slate-500">
        Tell us what you&apos;d like to revise.
        Your request will be reviewed by our team.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="space-y-6">

          <div className="rounded-2xl border border-slate-100 bg-white shadow-card">

            <div className="flex items-center justify-between px-6 pt-6 sm:px-8">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  What would you like to negotiate?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select an item to reveal its details and tell us what you&apos;d like us to reconsider.
                </p>
              </div>

              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">

                <span className="relative flex h-5 w-5 items-center justify-center">

                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-brand-600 checked:bg-brand-600 transition"
                  />

                  <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />

                </span>

                Select all

              </label>

            </div>

            <div className="mt-5">

              {items.map((item, i) => (
                <NegotiationItemRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  value={
                    values[item.id] ??
                    EMPTY_VALUE
                  }
                  onToggle={toggleItem}
                  onChange={updateValue}
                  isLast={
                    i === items.length - 1
                  }
                />
              ))}

            </div>

          </div>

          {/* =================================================
              SUPPORTING DOCUMENTS
          ================================================= */}

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 sm:p-8">

            <h2 className="text-base font-bold text-brand-700">
              Supporting documents (optional)
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload any documents that support your request.
            </p>

            <div
              onClick={() =>
                document
                  .getElementById(
                    'negotiation-file-input'
                  )
                  ?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() =>
                setDragOver(false)
              }
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(
                  e.dataTransfer.files
                );
              }}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragOver
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >

              <input
                id="negotiation-file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) =>
                  handleFiles(
                    e.target.files
                  )
                }
              />

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                <Upload className="h-5 w-5 text-brand-600" />
              </span>

              <p className="text-sm font-semibold text-slate-800">
                Drag and drop files here or{' '}
                <span className="text-brand-600">
                  Browse
                </span>
              </p>

              <p className="text-xs text-slate-500">
                PDF, DOC, DOCX, PNG, JPG
                (Max. 5 files, 10MB each)
              </p>

            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">

                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >

                    <span className="flex items-center gap-3">

                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                        <FileText className="h-4 w-4 text-brand-600" />
                      </span>

                      <span className="text-sm font-semibold text-slate-800">
                        {file.name}
                      </span>

                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(i)
                      }
                      className="text-slate-400 hover:text-rose-500"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* =================================================
              JUSTIFICATION
          ================================================= */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">

            <h2 className="text-base font-bold text-slate-900">
              Overall justification (optional)
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Help us understand your overall situation.
            </p>

            <textarea
              rows={4}
              maxLength={1000}
              value={justification}
              onChange={(e) =>
                setJustification(
                  e.target.value
                )
              }
              placeholder="Share anything else that would help your recruiter understand your request."
              className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {justification.length} / 1000
            </p>

          </div>

          {/* =================================================
              NORMAL ERROR
          ================================================= */}

          {submitError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {submitError}
            </div>
          )}

          {/* =================================================
              CONFIRM + BUTTONS
          ================================================= */}

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">

              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">

                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) =>
                    setConfirmed(
                      e.target.checked
                    )
                  }
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-brand-600 checked:bg-brand-600 transition"
                />

                <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />

              </span>

              I confirm that the information provided is accurate and true.

            </label>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard-careers/offer/${applicantId}/${offerId}`
                  )
                }
                className="rounded-full border border-brand-600 px-6 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting
                  ? 'Sending…'
                  : 'Submit negotiation'}
              </button>

            </div>

          </div>

        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Offer summary
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Total first-year compensation
            </p>

            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {formatCurrency(totalComp)}{' '}
              <span className="text-sm font-medium text-slate-400">
                / year
              </span>
            </p>

            {offer.compensation.length > 0 && (
              <>

                <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">

                  {offer.compensation.map(
                    (item) => (
                      <div
                        key={item.label}
                        className={`h-full ${item.color}`}
                        style={{
                          width:
                            totalComp > 0
                              ? `${
                                  (item.value /
                                    totalComp) *
                                  100
                                }%`
                              : 0
                        }}
                      />
                    )
                  )}

                </div>

                <div className="mt-5 space-y-3">

                  {offer.compensation.map(
                    (item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-sm"
                      >

                        <span className="flex items-center gap-2 text-slate-600">

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                          />

                          {item.label}

                        </span>

                        <span className="font-bold text-slate-900">
                          {formatCurrency(
                            item.value
                          )}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </>
            )}

          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ShieldCheck className="h-4 w-4" />
            </span>

            <div>

              <p className="text-sm font-bold text-slate-900">
                Your request is important
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Our team will review your request and get back to you as soon as possible.
              </p>

            </div>

          </div>

        </aside>

      </div>

      {/* =====================================================
          NEGOTIATION ERROR DIALOG
          THIS DOES NOT CHANGE YOUR EXISTING PAGE LAYOUT.
          IT ONLY APPEARS WHEN THE BACKEND RETURNS responsecode 01.
      ===================================================== */}

      {showErrorDialog && (
        <div
          className="negotiation-error-dialog-overlay"
          onClick={() =>
            setShowErrorDialog(false)
          }
        >

          <div
            className="negotiation-error-dialog"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="negotiation-error-dialog-icon">
              !
            </div>

            <div className="negotiation-error-dialog-content">

              <h2 className="negotiation-error-dialog-title">
                Negotiation Request Failed
              </h2>

              <p className="negotiation-error-dialog-message">
                {errorDialogMessage}
              </p>

            </div>

            <div className="negotiation-error-dialog-actions">

              <button
                type="button"
                className="negotiation-error-dialog-button"
                onClick={() =>
                  setShowErrorDialog(false)
                }
              >
                OK
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}