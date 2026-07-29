import { useEffect, useState } from 'react';
import OfferRow from '../components/careers/OfferRow.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getCandidateOffersRequest } from '../lib/api.js';
import { normalizeApiOffer } from '../data/offers.js';

export default function OffersPage() {
  const { token } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    
    const controller = new AbortController();

    setLoading(true);
    setError('');

    getCandidateOffersRequest(token, controller.signal)
      .then((result) => {
        setOffers((result.data || []).map(normalizeApiOffer));
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load your offers. Please try again.');
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
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
          <span aria-hidden="true">🎉</span>
          Offers
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Your offers</h1>
        <p className="mt-3 max-w-xl text-slate-500">
          Every offer you&apos;ve received from Nexus, in one place. Open one to review the details and
          respond.
        </p>

        <div className="mt-8 space-y-5">
          {loading && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading your offers…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && offers.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              You don&apos;t have any offers yet.
            </div>
          )}

          {!loading && !error && offers.map((offer) => <OfferRow key={offer.offerId} offer={offer} />)}
        </div>
      </main>
  );
}
