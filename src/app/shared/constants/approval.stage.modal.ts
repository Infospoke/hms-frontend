// ─── Generic approval-flow domain model ──────────────────────────────────────
// Used by both <app-approval-pipeline> and <app-approval-timeline>, and by any
// page that needs an "N-step approval chain" UI (SR approvals, Offer approvals,
// budget approvals, etc). Keep this file free of any page-specific naming.

export type StageStatus = 'APPROVED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED' | 'CREATED';

export interface StageStatusDef {
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
}

export const STAGE_STATUS_CONFIG: Record<StageStatus, StageStatusDef> = {
  APPROVED:    { icon: 'fa-solid fa-circle-check', color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Approved' },
  IN_PROGRESS: { icon: 'fa-solid fa-clock',        color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', label: 'In Progress' },
  PENDING:     { icon: 'fa-regular fa-circle',     color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', label: 'Waiting for previous approval' },
  REJECTED:    { icon: 'fa-solid fa-circle-xmark', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Rejected' },
  CREATED:     { icon: 'fa-solid fa-paper-plane',  color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Created' },
};

export interface ApprovalStage {
  id: number;
  role: string;
  approverName: string;
  approverInitials: string;
  status: StageStatus;
  timestamp?: string;
  comments?: string;
  /** True for every PENDING stage that follows a REJECTED stage in the chain. */
  prevRejected?: boolean;
}