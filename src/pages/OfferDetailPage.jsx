import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, Download, Check, BarChart3 } from 'lucide-react';
import ESignModal from '../components/careers/ESignModal.jsx';
import OfferLetterViewer from '../components/careers/OfferLetterViewer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getOfferDetailsByApplicantIdRequest, fetchOfferLetterBlob, acceptOfferRequest } from '../lib/api.js';
import { normalizeOfferDetail, formatCurrency } from '../data/offers.js';

/** "Priya Sharma" -> "Priya_Sharma_Offer_Letter.pdf" (falls back to the applicantId if there's no name yet). */
function offerLetterFilename(candidateName, applicantId) {
  const safeName = (candidateName || '').trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  return safeName ? `${safeName}_Offer_Letter.pdf` : `Offer_Letter_${applicantId}.pdf`;
}

/** Opens a Blob in a new tab (view) or triggers a save-as download, then cleans up the object URL. */
function openBlob(blob, { download, filename } = {}) {
  const url = URL.createObjectURL(blob);
  if (download) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'offer-letter.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  // Give the new tab / download a moment to actually pick up the blob URL
  // before revoking it.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function OfferDetailPage() {
  const { applicantId,offerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  console.log('OfferDetailPage params:', { applicantId, offerId },);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  const [status, setStatus] = useState(location.state?.status ?? 'action-needed');
  const [showSignModal, setShowSignModal] = useState(false);

  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const [letterBlob, setLetterBlob] = useState(null);
  const [letterLoading, setLetterLoading] = useState(true);
  const [letterError, setLetterError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getOfferDetailsByApplicantIdRequest(token, applicantId, controller.signal)
      .then((result) => {
        const detail = normalizeOfferDetail(result.data || {});
        setOffer(detail);
        console.log('Offer detail:', detail);
        if (!location.state?.status) {
          setStatus(detail.requestedOn ? 'negotiating' : 'action-needed');
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load this offer. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token, applicantId]);

  useEffect(() => {
    const controller = new AbortController();
    setLetterLoading(true);
    setLetterError('');

    fetchOfferLetterBlob(token, offerId, 'view', controller.signal)
      .then((blob) => {
        setLetterBlob(blob);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setLetterError(err.message || 'Could not load the offer letter. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLetterLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [token, applicantId]);

 
  const handleSigned = () => {
    setShowSignModal(false);
    setStatus('accepted');
  };

  const handleDecline = () => {
    setStatus('declined');
  };
const handleAcceptOffer = async ({
  signatureFile,
  signatureType,
  comments
}) => {
  try {
    const response = await acceptOfferRequest(token, {
      comments,
      signatureFile,
      signatureType,
      candidateId: offer.candidateId,
      offerId: offerId,
      applicantId: applicantId,
    });

    console.log('Accept offer response:', response);

    if (response?.status === 'ok') {
      console.log('Message:', response.message);
      console.log('Generated file:', response.minio_file_name);

      setShowESignModal(false);
    } else {
      console.error(
        response?.message || 'Failed to accept offer'
      );
    }

  } catch (err) {
    console.error(err);
  }
};
  const handleDownload = async () => {
    setDownloadBusy(true);
    setDownloadError('');
    try {
      console.log(offerId)
      const blob = await fetchOfferLetterBlob(token,offerId, 'download');
      openBlob(blob, { download: true, filename: offerLetterFilename(offer?.candidateName, applicantId) });
    } catch (err) {
      setDownloadError(err.message || 'Could not download the offer letter. Please try again.');
    } finally {
      setDownloadBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-sm text-slate-500">Loading your offer…</p>
      </main>
    );
  }

  if (error || !offer) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <p className="text-lg font-bold text-slate-900">
          {error ? 'Something went wrong.' : "We couldn't find that offer."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {error || 'It may have been withdrawn, or the link is out of date.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard-careers/offer')}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all offers
        </button>
      </main>
    );
  }

  const totalComp = offer.offeredCtc;
  // const offerId = location.state?.offerId ?? offer.offerId ?? null;
  const jobId = location.state?.jobId ?? offer.jobId ?? null;

  const negotiatePath = `/dashboard-careers/offer/${applicantId}/negotiate`;
  const negotiateState = { state: { offerId, jobId } };

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/dashboard-careers/offer')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          All offers
        </button>

        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
          <span aria-hidden="true">🎉</span>
          Offer
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Your offer for {offer.jobTitle}
        </h1>
        <p className="mt-3 max-w-xl text-slate-500">
          Review the details, understand your total comp, and respond right here.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Offer summary + letter actions */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-6 py-4">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="h-4 w-4 text-slate-400" />
                {offerLetterFilename(offer.candidateName, applicantId)}
              </span>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloadBusy}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {downloadBusy ? 'Downloading…' : 'Download'}
              </button>
            </div>

            {downloadError && (
              <p className="border-b border-rose-100 bg-rose-50 px-6 py-2.5 text-sm font-medium text-rose-600">
                {downloadError}
              </p>
            )}

            {/* The entire offer letter, exactly as issued — auto-loaded via
                the view-offer-letter API and shown as a scrollable PDF.
                Only the surrounding chrome (the "paper on a desk" frame) is
                styled; the document content itself is untouched. */}
            <div className="max-h-[80vh] min-h-[480px] overflow-y-auto bg-slate-100 px-4 py-8 sm:px-10 sm:py-10">
              {letterLoading && (
                <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500">
                  Loading offer letter…
                </div>
              )}

              {!letterLoading && letterError && (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm font-medium text-rose-600">{letterError}</p>
                </div>
              )}

              {!letterLoading && !letterError && letterBlob && (
                <OfferLetterViewer file={letterBlob} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total first-year compensation
              </p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">
                {formatCurrency(totalComp)} <span className="text-sm font-medium text-slate-400">/ year</span>
              </p>

              {offer.compensation.length > 0 && (
                <>
                  <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    {offer.compensation.map((item) => (
                      <div
                        key={item.label}
                        className={`h-full ${item.color}`}
                        style={{ width: totalComp > 0 ? `${(item.value / totalComp) * 100}%` : 0 }}
                      />
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {offer.compensation.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                {offer.employmentType && (
                  <div className="flex items-center justify-between">
                    <span>Employment type</span>
                    <span className="font-semibold text-slate-700">{offer.employmentType}</span>
                  </div>
                )}
                {offer.workLocation && (
                  <div className="flex items-center justify-between">
                    <span>Work location</span>
                    <span className="font-semibold text-slate-700">{offer.workLocation}</span>
                  </div>
                )}
                {offer.joiningDateLabel && (
                  <div className="flex items-center justify-between">
                    <span>Joining date</span>
                    <span className="font-semibold text-slate-700">{offer.joiningDateLabel}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              {status === 'action-needed' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSignModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5"
                  >
                    <Check className="h-4 w-4" />
                    Accept &amp; e-sign
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(negotiatePath, negotiateState)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-brand-500 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Request to negotiate
                  </button>
                  <button
                    type="button"
                    onClick={handleDecline}
                    className="mt-4 w-full text-center text-sm font-semibold text-slate-400 transition hover:text-slate-600"
                  >
                    Decline offer
                  </button>
                </>
              ) : (
                // Already accepted / declined / requested a negotiation —
                // no action buttons, just a status message, so a candidate
                // can't take the same action (or a conflicting one) twice.
                <div
                  className={`rounded-xl px-4 py-3.5 text-center text-sm font-semibold ${
                    status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'negotiating'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {status === 'accepted' && "You've accepted this offer — welcome to Nexus!"}
                  {status === 'negotiating' &&
                    'Negotiation requested — our team is reviewing it. No further action is needed right now.'}
                  {status === 'declined' && "You've declined this offer."}
                </div>
              )}

              {offer.recruiter && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  Questions about your offer?{' '}
                  <span className="font-semibold text-brand-600">Contact {offer.recruiter}</span>
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {showSignModal && (
        <ESignModal
          offer={offer}
          totalCompLabel={formatCurrency(totalComp)}
          onClose={() => setShowSignModal(false)}
           onConfirm={handleAcceptOffer}
        />
      )}
    </>
  );
}
