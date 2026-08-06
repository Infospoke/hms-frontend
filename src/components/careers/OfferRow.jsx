import { Link } from 'react-router-dom';
import { Gift, MapPin } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { getTotalComp, formatCurrency } from '../../data/offers.js';

const STATUS_LABEL = {
  'action-needed': 'Action needed',
  accepted: 'Accepted',
  declined: 'Declined',
  negotiating: 'In negotiation',
};

const STATUS_VARIANT = {
  'action-needed': 'success',
  accepted: 'success',
  declined: 'default',
  negotiating: 'warning',
};

const BUTTON_LABEL = {
  'action-needed': 'Review offer',
  negotiating: 'View request',
  accepted: 'View details',
  declined: 'View details',
};

export default function OfferRow({ offer }) {
  const isActionNeeded = offer.status === 'action-needed';
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Gift className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{offer.jobTitle}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            {offer.company && <span>{offer.company}</span>}
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              {offer.location}
              {offer.workMode || offer.employmentType
                ? ` · ${offer.workMode || offer.employmentType}`
                : ''}
            </span>
            <span className="font-semibold text-slate-700">
              {formatCurrency(getTotalComp(offer))}/year
            </span>
            {offer.respondBy && <span>Respond by {offer.respondBy}</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
        <Badge variant={STATUS_VARIANT[offer.status] ?? 'default'} icon={<span className="h-1.5 w-1.5 rounded-full bg-current" />}>
          {STATUS_LABEL[offer.status] ?? offer.status}
        </Badge>
        <Link
          to={`/dashboard-careers/offer/${offer.applicantId}/${offer.offerId}`}
          
          state={{ offerId: offer.offerId, jobId: offer.jobId, status: offer.status }}
          className={
            isActionNeeded
              ? 'rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5'
              : 'rounded-full border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50'
          }
        >
          {BUTTON_LABEL[offer.status] ?? 'View details'}
        </Link>
      </div>
    </div>
  );
}
