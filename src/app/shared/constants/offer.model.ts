// ─── Offer overall-status (top-right badge) ──────────────────────────────────
export type OfferStatus = 'Pending' | 'Approved' | 'Rejected' | 'Released';

export interface OfferStatusDef { label: string; color: string; bg: string; border: string; }

export const OFFER_STATUS_CONFIG: Record<OfferStatus, OfferStatusDef> = {
  Pending:  { label: 'Pending',  color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  Rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  Released: { label: 'Released', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

/**
 * Drives which bottom action-bar (and which optional input blocks) render.
 *  - approve  -> Reject / Approve buttons + e-signature & comment inputs
 *  - release  -> "View offer letter" + "Release offer letter"
 *  - view     -> "View offer letter" only (fully read-only)
 */
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