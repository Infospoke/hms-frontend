
export type OfferStatus = 'Pending' | 'Approved' | 'Rejected' | 'Released';

export interface OfferStatusDef { label: string; color: string; bg: string; border: string; }

export const OFFER_STATUS_CONFIG: Record<OfferStatus, OfferStatusDef> = {
  Pending:  { label: 'Pending',  color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  Rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  Released: { label: 'Released', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};


export type OfferPageMode = 'approve' | 'release' | 'view';

export interface ApplicantInfo {
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  department: string;
  email: string;
  requestedOn: string; // pre-formatted "01 Jul 2026 · 02:00 PM"
}

export interface OfferBasicInfo {
  jobTitle: string;
  department: string;
  offeredCtc: string;       // pre-formatted "₹ 12,00,000 / Annum"
  probationPeriod: string;
  noticePeriod: string;
  workLocation: string;
  employmentType: string;
  payFrequency: string;
  offerValidTill: string;
  recruiter: string;
  hiringManager: string;
}

export interface CompBreakdownItem {
  label: string;
  percent: number;
  color: string;
}

export interface CompensationVsMarket {
  marketMin: number;
  offeredCtc: number;
  marketMax: number;
}


// HR raises/reviews the request — they're the creator, not an approver in
// the chain. Kept as its own named constant so every place that needs to
// special-case it (skip it from "next approval stage" logic, render it as
// CREATED instead of matching it against approval comments, etc.)
// references the same source of truth instead of a bare 'HR' string.
export const OFFER_CREATOR_ROLE = 'HR';

// The real 3-level approval chain.
export const OFFER_APPROVAL_STAGES = ['Financial Analyst', 'Finance Head', 'HR Head'];

// Full pipeline shown in the stepper UI: creator stage + the 3 approvers.
export const OFFER_STAGE_ORDER = [OFFER_CREATOR_ROLE, ...OFFER_APPROVAL_STAGES];

export interface NegotiationItem {
  key: string;
  icon: string;
  label: string;
  category: 'COMPENSATION' | 'TERMS';
  isDate?: boolean;
  initialValue: any;
  askedValue: any;
  
  initialDisplay: string;
  askedDisplay: string;

  changePercent: number;

  hasBaseline: boolean;
  justification: string;
  forward: boolean;
  valueToForward: any;
}

export interface NegotiationDocument {
  name: string;
  sizeLabel: string;
  uploadedOn: string;
  kind: 'pdf' | 'img' | 'file';
  url: string;
}

// ─── Negotiation-approval chain (approver-facing) ─────────────────────────
// Department head -> Finance team -> HR manager -> Final approval. This is
// the pipeline shown on the "Negotiation approvals" detail screen that an
// approver (dept head / finance / HR manager) sees — a different chain
// from OFFER_STAGE_ORDER above (which models HR's own forwarding chain on
// the /review-negotiation-request page). Kept separate on purpose since
// they're two different screens with two different stakeholders.
export const NEGOTIATION_APPROVAL_STAGE_ORDER = ['Department head', 'Finance team', 'HR manager', 'Final approval'];

// "View approved budget & compensation" popup on the negotiation-approvals
// screen — figures are indicative/prototype-only until a real budget API
// is wired up.
export interface ApprovedBudgetInfo {
  compensationBandMin: number;
  compensationBandMax: number;
  departmentBudgetAnnual: number;
  allocatedThisQuarter: number;
  remainingBudget: number;
  note: string;
}

// "Offer comparison — your decision" table row on the negotiation-approvals
// screen: initial offer / candidate ask / HR's recommendation / the
// approver's own (editable) decision.
export interface NegotiationComparisonItem {
  key: string;
  label: string;
  initialOffer: number | null;
  candidateAsked: number;
  hrRecommends: number;
  yourDecision: number;
  decisionStatus: 'Accepted' | 'Modified' | 'Rejected';
}