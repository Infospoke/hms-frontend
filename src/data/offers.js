
export function getTotalComp(offer) {
  if (typeof offer.totalCtc === 'number') return offer.totalCtc;
  return (offer.compensation || []).reduce((sum, item) => sum + item.value, 0);
}

export function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString('en-US')}`;
}

function formatDueDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Normalizes the API's offer status into one of four canonical buckets:
 * 'action-needed' | 'accepted' | 'declined' | 'negotiating'. The API has
 * used a few different spellings for the same states ("Rejected" vs
 * "Declined", "Requested for Negotiation" vs "negotiating"), so this maps
 * every known alias rather than relying on an exact string match.
 */
function normalizeOfferStatus(raw) {
  if (!raw) return 'action-needed';
  const key = String(raw).trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (key === 'accepted' || key === 'approved') return 'accepted';
  if (key === 'declined' || key === 'rejected') return 'declined';
  if (key === 'negotiating' || key === 'requested-for-negotiation') return 'negotiating';
  return 'action-needed';
}

export function normalizeApiOffer(raw) {
  return {
    id: raw.offerId,
    offerId: raw.offerId,
    applicantId: raw.applicantId,
    jobId: raw.jobId,
    jobTitle: raw.jobTitle,
    location: raw.jobLocation,
    employmentType: raw.employmentType,
    totalCtc: raw.totalCtc,
    dueDate: raw.dueDate,
    respondBy: formatDueDate(raw.dueDate),
    status: normalizeOfferStatus(raw.status),
  };
}


export function normalizeOfferDetail(raw) {

  const compensation = [
    { label: 'Base salary', value: raw.basicSalary || 0, color: 'bg-brand-600' },
    { label: 'Signing bonus', value: raw.signingBonus || 0, color: 'bg-orange-500' },
    { label: 'Equity / RSU (annualized)', value: raw.annualRsuEsopValue || 0, color: 'bg-violet-600' },
    { label: 'Other benefits', value: raw.otherBenefits || 0, color: 'bg-brand-400' },
  ];

  const offeredCtc = typeof raw.offeredCtc === 'number' ? raw.offeredCtc : raw.totalCtc || 0;

  return {
    
    offerId: raw.offerId,
    jobId: raw.jobId,
    applicantId: raw.applicantId,
    candidateName: raw.candidateName,
    candidateId: raw.candidateId,
    email: raw.email,
    jobTitle: (raw.jobTitle || '').trim(),
    department: raw.department,
    employmentType: raw.employmentType,
    workLocation: raw.workLocation,
    joiningDate: raw.joiningDate,
    joiningDateLabel: formatDueDate(raw.joiningDate),
    noticePeriod: raw.noticePeriod,
    probationPeriod: raw.probationPeriod,
    recruiter: raw.recruiter,
    // Non-null requestedOn means a negotiation was already asked for, so the
    // detail page opens in that state instead of "action needed".
    requestedOn: raw.requestedOn,
    minSalary: raw.minSalary,
    maxSalary: raw.maxSalary,
    totalCtc: raw.totalCtc,
    offeredCtc,
    basicSalary: raw.basicSalary,
    signingBonus: raw.signingBonus,
    annualRsuEsopValue: raw.annualRsuEsopValue,
    otherBenefits: raw.otherBenefits,
    compensation,
  };
}

const NOT_SPECIFIED = 'Not specified';

export function buildNegotiationItems(detail) {
  return [
    {
      id: 'basic-pay',
      icon: 'CreditCard',
      label: 'Basic Pay (Total Compensation)',
      offeredValue: detail.basicSalary ?? 0,
      offered: formatCurrency(detail.basicSalary ?? 0),
      requestedLabel: 'Requested Basic Pay',
      placeholder: 'Enter amount',
    },
    {
      id: 'signing-bonus',
      icon: 'Briefcase',
      label: 'Signing Bonus',
      offeredValue: detail.signingBonus ?? 0,
      offered: formatCurrency(detail.signingBonus ?? 0),
      requestedLabel: 'Requested Signing Bonus',
      placeholder: 'Enter amount',
    },
    {
      id: 'equity-rsu',
      icon: 'Equity/RSU',
      label: 'Equity/RSU',
      offeredValue: detail.annualRsuEsopValue ?? 0,
      offered: formatCurrency(detail.annualRsuEsopValue ?? 0),
      requestedLabel: 'Requested Equity/RSU',
      placeholder: 'Enter amount',
    },
    {
      id: 'relocation-budget',
      icon: 'MapPin',
      label: 'Relocation Budget',
      // Not part of the offer-details response at all (unlike the others,
      // which are always present even if 0) - always shown blank.
      offeredValue: 0,
      offered: NOT_SPECIFIED,
      requestedLabel: 'Requested Relocation Budget',
      placeholder: 'Enter amount',
    },
    {
      id: 'joining-date',
      icon: 'Calendar',
      label: 'Joining Date',
      offeredValue: 0,
      offered: detail.joiningDateLabel || NOT_SPECIFIED,
      requestedLabel: 'Requested Joining Date',
      placeholder: 'e.g. Aug 18, 2026',
      // Sent as the request's top-level `joiningDate` field rather than in
      // the `negotiation` array (it isn't a monetary field), so a native
      // date input keeps it in the yyyy-mm-dd shape the API expects.
      inputType: 'date',
    },
    // {
    //   id: 'notice-period',
    //   icon: 'Clock',
    //   label: 'Notice Period',
    //   offeredValue: 0,
    //   offered: detail.noticePeriod || NOT_SPECIFIED,
    //   requestedLabel: 'Requested Notice Period',
    //   placeholder: 'Enter amount',
    //   optional: true,
    //   reasonPlaceholder: "Tell us why you're requesting a change (optional).",
    // },
    {
      id: 'other',
      icon: 'MessageCircle',
      label: 'Other',
      offered: null,
      offeredValue: null,
      description: 'Any other requests',
      optional: true,
      reasonPlaceholder: "Tell us what you'd like to revise (optional).",
    },
  ];
}
