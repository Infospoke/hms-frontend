
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


export const OFFER_CREATOR_ROLE = 'HR';

export const OFFER_APPROVAL_STAGES = ['Financial Analyst', 'Finance Head', 'HR Head'];

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

export const NEGOTIATION_APPROVAL_STAGE_ORDER = ['Department head', 'Finance team', 'HR manager', 'Final approval'];

export interface ApprovedBudgetInfo {
  compensationBandMin: number;
  compensationBandMax: number;
  departmentBudgetAnnual: number;
  allocatedThisQuarter: number;
  remainingBudget: number;
  note: string;
}

export interface NegotiationComparisonItem {
  key: string;
  icon: string;
  label: string;
  category: 'COMPENSATION' | 'TERMS';
  isDate?: boolean;
  /** FWD checkbox — whether this row is actually carried into the
   * approver's decision (unchecked by default for guaranteed placeholder
   * fields the candidate never asked to change). */
  forward: boolean;
  /** number for money fields, date string for the joining-date row, null
   * when there's nothing to show for that column. */
  initialOffer: any;
  /** null when the candidate never asked to change this field. */
  candidateAsked: any;
  hrRecommends: any;
  yourDecision: any;
  decisionStatus: 'Accepted' | 'Modified' | 'Rejected';
  /** Candidate's stated reason for this specific field, shown in
   * "Candidate's reason for negotiation". */
  justification: string;
}

// ─── Release Offer Letter screen ───────────────────────────────────────────
export interface ReleaseOfferCandidateInfo {
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  email: string;
  candidateId: string;
  department: string;
  employmentType: string;
  location: string;
}

/** One row of the flat "Offer Summary" list (Basic Pay, Reallocation
 * Budget, Equity, Retention Bonus, Total CTC, Joining Date, Offer
 * Validity, Probation Period) — pre-formatted display values so the
 * template stays value-type agnostic (currency vs. date vs. duration). */
export interface OfferSummaryRow {
  key: string;
  icon: string;
  label: string;
  value: string;
  /** Total CTC row — rendered in the accent/highlight style. */
  highlight?: boolean;
}

export interface OfferLetterPreview {
  companyName: string;
  logoInitial: string;
  dateLabel: string;
  bodyParagraphs: string[];
  signOffName: string;
  signOffTitle: string;
  signOffCompany: string;
}