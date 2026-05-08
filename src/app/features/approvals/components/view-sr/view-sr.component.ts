import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { SrReviewComponent } from '../../../demand/components/sr-review/sr-review';
import { ApprovalService } from '../../services/approval-service';

// ─── Stage status config (icon, colors) – single source of truth ────────────
export type StageStatus = 'APPROVED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';

export interface StageStatusDef {
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
}

export const STAGE_STATUS_CONFIG: Record<StageStatus, StageStatusDef> = {
  APPROVED: {
    icon: 'fa-solid fa-circle-check',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    label: 'Approved',
  },
  IN_PROGRESS: {
    icon: 'fa-solid fa-clock',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
    label: 'In Progress',
  },
  PENDING: {
    icon: 'fa-regular fa-circle',
    color: '#9ca3af',
    bg: '#f9fafb',
    border: '#e5e7eb',
    label: 'Pending',
  },
  REJECTED: {
    icon: 'fa-solid fa-circle-xmark',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fca5a5',
    label: 'Rejected',
  },
};

// ─── SR overall-status badge config ─────────────────────────────────────────
export type SrStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface SrStatusDef {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const SR_STATUS_CONFIG: Record<SrStatus, SrStatusDef> = {
  'Pending Approval': { label: 'Pending Approval', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved:           { label: 'Approved',          color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  Rejected:           { label: 'Rejected',           color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

// ─── Priority dot colors ──────────────────────────────────────────────────────
export const PRIORITY_COLOR: Record<string, string> = {
  High:   '#f97316',
  Medium: '#3b82f6',
  Low:    '#22c55e',
};

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface ApprovalStage {
  id: number;
  role: string;
  approverName: string;
  approverInitials: string;
  status: StageStatus;
  timestamp?: string;
  comments?: string;
}

@Component({
  selector: 'app-view-sr',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    HeadingComponent,
    SrReviewComponent,
  ],
  templateUrl: './view-sr.component.html',
  styleUrl: './view-sr.component.scss',
})
export class ViewSrComponent implements OnInit {

  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef);
  private approvalSvc = inject(ApprovalService);

  // ── UI state ─────────────────────────────────────────────────────────────
  isLoading    = true;
  isSubmitting = false;
  isFullSrOpen = false;

  // ── Section review ticks – 5 steps, all must be ticked to enable actions ─
  readonly TOTAL_SECTIONS = 5;
  reviewedCount = 0;

  get allSectionsReviewed(): boolean {
    return this.reviewedCount >= this.TOTAL_SECTIONS;
  }

  // ── SR header data ────────────────────────────────────────────────────────
  srId            = '';
  overallStatus: SrStatus = 'Pending Approval';
  createdBy       = '';
  department      = '';
  dateCreated     = '';
  priority        = '';
  targetStartDate = '';

  /** Info-strip items – built from TS for easy backend mapping */
  get metaItems() {
    return [
      { icon: 'fa-regular fa-user',           label: 'Created By',        value: this.createdBy,        isPriority: false },
      { icon: 'fa-regular fa-building',        label: 'Department',        value: this.department,       isPriority: false },
      { icon: 'fa-regular fa-calendar',        label: 'Date Created',      value: this.dateCreated,      isPriority: false },
      { icon: 'fa-solid fa-flag',              label: 'Priority',          value: this.priority,         isPriority: true  },
      { icon: 'fa-regular fa-calendar-check', label: 'Target Start Date', value: this.targetStartDate,  isPriority: false },
    ];
  }

  // ── Approval pipeline stages ──────────────────────────────────────────────
  pipelineStages: ApprovalStage[] = [];

  get progressPercent(): number {
    if (!this.pipelineStages.length) return 0;
    const done = this.pipelineStages.filter(
      s => s.status === 'APPROVED' || s.status === 'REJECTED'
    ).length;
    return Math.round((done / this.pipelineStages.length) * 100);
  }

  get progressStep(): string {
    const done = this.pipelineStages.filter(
      s => s.status === 'APPROVED' || s.status === 'REJECTED'
    ).length;
    return `Step ${done} of ${this.pipelineStages.length}`;
  }

  // ── Comment textarea bound to the IN_PROGRESS stage ──────────────────────
  approvalComment = '';

  // ── SR content inputs (fed straight to SrReviewComponent) ────────────────
  step0: any = null;
  step1: any = null;
  step2: any = null;
  step3: any = null;
  step4: any = null;
  mustSkills:       string[] = [];
  niceSkills:       string[] = [];
  certs:            string[] = [];
  langs:            string[] = [];
  jobBoards:        string[] = [];
  assessmentTypes:  string[] = [];
  diversityBoards:  string[] = [];
  selectedManagers: any[]    = [];
  replaceEmployee:  any      = null;
  supportDoc:       any      = null;

  // ── Exposed configs (used in template without calling functions in html) ──
  readonly stageStatusCfg = STAGE_STATUS_CONFIG;
  readonly srStatusCfg    = SR_STATUS_CONFIG;
  readonly priorityColor  = PRIORITY_COLOR;

  // ── Template helpers ──────────────────────────────────────────────────────
  get currentSrStatus(): SrStatusDef {
    return this.srStatusCfg[this.overallStatus] ?? this.srStatusCfg['Pending Approval'];
  }

  get priorityDotColor(): string {
    return this.priorityColor[this.priority] ?? '#9ca3af';
  }

  getStageCircleStyle(status: StageStatus) {
    const c = this.stageStatusCfg[status];
    return { background: c.bg, border: `2px solid ${c.border}` };
  }

  getStatusBadgeStyle(status: StageStatus) {
    const c = this.stageStatusCfg[status];
    return { color: c.color, background: c.bg, border: `1px solid ${c.border}` };
  }

  getTimelineBorderStyle(status: StageStatus) {
    return { 'border-left': `3px solid ${this.stageStatusCfg[status]?.color ?? '#e2e8f0'}` };
  }

  getAvatarStyle(status: StageStatus) {
    const c = this.stageStatusCfg[status];
    return { background: c.color };
  }

  isStageActive(status: StageStatus): boolean {
    return status === 'IN_PROGRESS';
  }

  isConnectorFilled(status: StageStatus): boolean {
    return status === 'APPROVED';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const state = history.state ?? {};
    this.srId = state.srId ?? 'SR-2025-ENG-0042';
    this.loadSrDetails();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  private async loadSrDetails(): Promise<void> {
    try {
      // TODO: replace mock with real API:
      // const res: any = await this.approvalSvc.getSrDetails(this.srId);
      const res = this.getMockData();
      this.mapResponse(res);
    } catch (err) {
      console.error('Failed to load SR details', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private mapResponse(res: any): void {
    const h = res.header;
    this.srId            = h.srId;
    this.overallStatus   = h.overallStatus;
    this.createdBy       = h.createdBy;
    this.department      = h.department;
    this.dateCreated     = h.dateCreated;
    this.priority        = h.priority;
    this.targetStartDate = h.targetStartDate;

    this.pipelineStages = res.approvalPipeline;

    const d = res.srDetails;
    this.step0           = d.step0;
    this.step1           = d.step1;
    this.step2           = d.step2;
    this.step3           = d.step3;
    this.step4           = d.step4;
    this.mustSkills      = d.mustSkills      ?? [];
    this.niceSkills      = d.niceSkills      ?? [];
    this.certs           = d.certs           ?? [];
    this.langs           = d.langs           ?? [];
    this.jobBoards       = d.jobBoards       ?? [];
    this.assessmentTypes = d.assessmentTypes ?? [];
    this.diversityBoards = d.diversityBoards ?? [];
    this.selectedManagers = d.selectedManagers ?? [];
    this.replaceEmployee  = d.replaceEmployee  ?? null;
    this.supportDoc       = d.supportDoc       ?? null;
  }

  // ── Tick handler (from SrReviewComponent) ────────────────────────────────
  onTicksChanged(ticks: boolean[]): void {
    this.reviewedCount = ticks.filter(Boolean).length;
    this.cdr.markForCheck();
  }

  // ── Approve / Reject ──────────────────────────────────────────────────────
  async onApprove(): Promise<void> {
    if (!this.allSectionsReviewed || this.isSubmitting) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      // await this.approvalSvc.approveOrReject({ srId: this.srId, decision: 'APPROVE', comments: this.approvalComment });
      console.log('Approved', { srId: this.srId, comments: this.approvalComment });
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  async onReject(): Promise<void> {
    if (!this.allSectionsReviewed || this.isSubmitting) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      // await this.approvalSvc.approveOrReject({ srId: this.srId, decision: 'REJECT', comments: this.approvalComment });
      console.log('Rejected', { srId: this.srId, comments: this.approvalComment });
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  openFullSr(): void  { this.isFullSrOpen = true;  }
  closeFullSr(): void { this.isFullSrOpen = false; }

  goBack(): void {
    this.router.navigateByUrl(history.state?.url ?? '/approval/sr-list');
  }

  // ── Mock data – replace entire block with real API call ───────────────────
  private getMockData() {
    return {
      header: {
        srId: 'SR-2025-ENG-0042',
        overallStatus: 'Pending Approval' as SrStatus,
        createdBy: 'Alex Kumar',
        department: 'Engineering',
        dateCreated: '12 May 2025',
        priority: 'High',
        targetStartDate: '01 Jun 2025',
      },
      approvalPipeline: [
        {
          id: 1, role: 'HM Manager', approverName: 'Rohit Sharma', approverInitials: 'RS',
          status: 'APPROVED' as StageStatus,
          timestamp: '12 May 2025, 10:30 AM',
          comments: 'Role is aligned with team goals. Approved.',
        },
        {
          id: 2, role: 'Dept Head', approverName: 'Priya Mehta', approverInitials: 'PM',
          status: 'APPROVED' as StageStatus,
          timestamp: '12 May 2025, 11:45 AM',
          comments: 'Business need is valid. Approved.',
        },
        {
          id: 3, role: 'HRBP', approverName: 'Sneha Iyer', approverInitials: 'SI',
          status: 'IN_PROGRESS' as StageStatus,
          timestamp: '12 May 2025, 02:15 PM',
          comments: '',
        },
        {
          id: 4, role: 'Finance', approverName: '', approverInitials: '',
          status: 'PENDING' as StageStatus,
          timestamp: '', comments: '',
        },
      ],
      srDetails: {
        step0: {
          jobTitle: 'Senior Backend Engineer', dept: 'Backend Development',
          bu: 'Engineering', location: 'Hyderabad, India', workMode: 'Hybrid',
          empType: 'Full-time', seniority: 'Mid-Level', openings: 1,
          priority: 'High', startDate: '01 Jun 2025',
        },
        step1: {
          justType: 'New Hire',
          bizCase: 'We need a senior backend engineer to support the growing platform demands and scale our API layer.',
          impactNote: 'Without this hire, delivery timelines will slip by Q3 and team bandwidth will be severely constrained.',
        },
        step2: {
          costCenter: 'ENG-CC-001', budgetCode: 'BUD-2025-ENG', hcSlot: true,
          salaryComp: '20-28', proposedComp: 24,
          signingBonus: false, signingAmt: 0,
          equity: false,       equityAmt: 0,
          relocation: false,   relocAmt: 0,
        },
        step3: {
          eduReq: "Bachelor's in Computer Science", travel: 'Minimal',
          expMin: 3, expMax: 9, interviewMin: 3, interviewMax: 5, assessmentOn: true,
        },
        step4: {
          internalFirst: true, sourcingBudget: 50000,
          referralOn: true, referralAmt: 15000, diversityOn: false,
        },
        mustSkills:       ['Node.js', 'PostgreSQL', 'REST APIs', 'AWS'],
        niceSkills:       ['GraphQL', 'Redis', 'Docker'],
        certs:            ['AWS Certified Developer'],
        langs:            ['English', 'Hindi'],
        jobBoards:        ['LinkedIn', 'Naukri'],
        assessmentTypes:  ['Technical Coding Round'],
        diversityBoards:  [],
        selectedManagers: [{ name: 'Venkatesh P.' }],
        replaceEmployee:  null,
        supportDoc:       null,
      },
    };
  }
}
