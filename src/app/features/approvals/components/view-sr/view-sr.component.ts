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

// ─── API Response Interfaces ─────────────────────────────────────────────────
interface PositionBasicsResponse {
  id: number;
  srId: string;
  jobTitle: string;
  businessUnitName: string;
  departmentId: number;
  departmentName: string;
  reportingManagerInfo: number[];
  location: string;
  seniorityLevelName: string;
  openings: number;
  targetStartDate: string;
  workMode: string;
  employmentType: string;
  priority: string;
  approved: boolean;
  createdOn: string;
  createdBy: string;
  userId: number;
  approver1: string | null;
  approver2: string | null;
  approver3: string | null;
  approver1By: string | null;
  approver2By: string | null;
  approver3By: string | null;
  dateOfApproval1: string | null;
  dateOfApproval2: string | null;
  dateOfApproval3: string | null;
  commentsByApprover1: string | null;
  commentsByApprover2: string | null;
  commentsByApprover3: string | null;
  approver1Role: string | null;
  approver2Role: string | null;
  approver3Role: string | null;
}

interface BusinessJustificationResponse {
  id: number;
  srId: string;
  requisitionType: string;
  businessCase: string;
  impactIfNotFilled: string;
  replacesEmployee: number | null;
  document: any;
  draft: any;
  submitted: boolean;
  approved: boolean;
}

interface BudgetAndCompensationResponse {
  id: number;
  srId: string;
  proposedTotalCompensation: number;
  signingBonus: boolean;
  equity: boolean;
  relocationBudget: boolean;
  signingBonusAmount: number;
  equityAmount: number;
  relocationBudgetAmount: number;
  annualHiringCost: number;
  draft: any;
  submitted: boolean;
  minSalary: number;
  maxSalary: number;
  approved: boolean;
}

interface RolesAndRequirementsResponse {
  id: number;
  srId: string;
  skillsMustHave: string[];
  niceToHaveSkills: string[];
  educationRequirement: string;
  travelRequirement: string;
  minExperience: number;
  maxExperience: number;
  minInterviewRounds: number;
  maxInterviewRounds: number;
  certificationsRequired: string[];
  languages: string[];
  assessmentRequired: boolean;
  submitted: boolean;
  approved: boolean;
}

interface SourcingStrategyResponse {
  id: number;
  srId: string;
  internalBoard: boolean;
  naukri: boolean;
  linkedIn: boolean;
  indeed: boolean;
  companySite: boolean;
  agencyRpo: boolean;
  internalFirstPolicy: boolean;
  sourcingBudget: number;
  referralEnabled: boolean;
  referralAmount: number;
  diversityEnabled: boolean;
  diversityTags: string[];
  draft: any;
  submitted: boolean;
  approved: boolean;
}

interface SrApiResponse {
  data: {
    positonBasicsResponse: PositionBasicsResponse;
    businessJustificationResponse: BusinessJustificationResponse;
    budgetAndCompensationResponse: BudgetAndCompensationResponse;
    rolesAndRequirementsResponse: RolesAndRequirementsResponse;
    sourcingStrategyResponse: SourcingStrategyResponse;
  };
  message: string;
  responsecode: string;
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

  // ── Comment textarea — bound only to the single IN_PROGRESS stage ─────────
  approvalComment = '';

  /**
   * Strips any potential image markdown or HTML image tags from a comment string.
   */
  sanitizeComment(raw: string): string {
    if (!raw) return '';
    // Strip HTML tags (like those from rich text editors)
    return raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, '[image removed]')
      .replace(/<img[^>]*>/gi, '[image removed]')
      .replace(/data:image\/[^;]+;base64,[^\s"')]+/gi, '[image removed]')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Intercept textarea input to prevent pasting of image data URIs or
   * markdown image syntax. Strips them on the fly.
   */
  onCommentInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const cleaned = this.sanitizeComment(textarea.value);
    if (cleaned !== textarea.value) {
      this.approvalComment = cleaned;
      textarea.value = cleaned;
      this.cdr.markForCheck();
    }
  }

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

  // ── Exposed configs (used in template) ───────────────────────────────────
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
    this.srId = state.srId ?? 'SR-2026-TAC-0275';
    this.loadSrDetails();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  private async loadSrDetails(): Promise<void> {
    try {
      // Real API call — replace with actual endpoint as needed:
      const res: any = await this.approvalSvc.getSrDetails(this.srId);
      this.mapApiResponse(res);

  
    } catch (err) {
      console.error('Failed to load SR details', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

 
  private mapApiResponse(res: SrApiResponse): void {
    const basics   = res.data.positonBasicsResponse;
    const bizJust  = res.data.businessJustificationResponse;
    const budget   = res.data.budgetAndCompensationResponse;
    const roles    = res.data.rolesAndRequirementsResponse;
    const sourcing = res.data.sourcingStrategyResponse;

    // ── Header ────────────────────────────────────────────────────────────
    this.srId            = basics.srId;
    this.createdBy       = basics.createdBy;
    this.department      = basics.departmentName;
    this.dateCreated     = this.formatDate(basics.createdOn);
    this.priority        = basics.priority;
    this.targetStartDate = this.formatDate(basics.targetStartDate);

    // Derive overall SR status from approval flags
    this.overallStatus = this.deriveOverallStatus(basics);

    // ── Pipeline stages from approver fields ──────────────────────────────
    this.pipelineStages = this.buildPipelineStages(basics);

    // ── Step 0: Position Basics ───────────────────────────────────────────
    this.step0 = {
      jobTitle:  basics.jobTitle,
      dept:      basics.departmentName,
      bu:        basics.businessUnitName,
      location:  basics.location,
      workMode:  basics.workMode,
      empType:   basics.employmentType,
      seniority: basics.seniorityLevelName,
      openings:  basics.openings,
      priority:  basics.priority,
      startDate: basics.targetStartDate,
    };

    // ── Step 1: Business Justification ────────────────────────────────────
    this.step1 = {
      justType:   bizJust.requisitionType,
      bizCase:    this.sanitizeComment(bizJust.businessCase),
      impactNote: this.sanitizeComment(bizJust.impactIfNotFilled),
    };

    // ── Step 2: Budget & Compensation ─────────────────────────────────────
    this.step2 = {
      proposedComp: budget.proposedTotalCompensation,
      salaryComp:   `${budget.minSalary / 1000}–${budget.maxSalary / 1000}K`,
      signingBonus: budget.signingBonus,
      signingAmt:   budget.signingBonusAmount,
      equity:       budget.equity,
      equityAmt:    budget.equityAmount,
      relocation:   budget.relocationBudget,
      relocAmt:     budget.relocationBudgetAmount,
      annualCost:   budget.annualHiringCost,
    };

    // ── Step 3: Roles & Requirements ──────────────────────────────────────
    this.step3 = {
      eduReq:       roles.educationRequirement,
      travel:       roles.travelRequirement,
      expMin:       roles.minExperience,
      expMax:       roles.maxExperience,
      interviewMin: roles.minInterviewRounds,
      interviewMax: roles.maxInterviewRounds,
      assessmentOn: roles.assessmentRequired,
    };

    // ── Step 4: Sourcing Strategy ─────────────────────────────────────────
    this.step4 = {
      internalFirst:  sourcing.internalFirstPolicy,
      sourcingBudget: sourcing.sourcingBudget,
      referralOn:     sourcing.referralEnabled,
      referralAmt:    sourcing.referralAmount,
      diversityOn:    sourcing.diversityEnabled,
    };

    // ── Skills / certs / langs ────────────────────────────────────────────
    this.mustSkills      = roles.skillsMustHave      ?? [];
    this.niceSkills      = roles.niceToHaveSkills    ?? [];
    this.certs           = roles.certificationsRequired ?? [];
    this.langs           = roles.languages            ?? [];
    this.diversityBoards = sourcing.diversityTags.filter(Boolean);

    // ── Job boards from sourcing flags ────────────────────────────────────
    const boards: string[] = [];
    if (sourcing.internalBoard) boards.push('Internal Board');
    if (sourcing.naukri)        boards.push('Naukri');
    if (sourcing.linkedIn)      boards.push('LinkedIn');
    if (sourcing.indeed)        boards.push('Indeed');
    if (sourcing.companySite)   boards.push('Company Site');
    if (sourcing.agencyRpo)     boards.push('Agency / RPO');
    this.jobBoards = boards;

    // ── Assessment types (none in current API, default empty) ────────────
    this.assessmentTypes  = [];
    this.selectedManagers = basics.reportingManagerInfo.map(id => ({ id }));
    this.replaceEmployee  = bizJust.replacesEmployee ?? null;
    this.supportDoc       = bizJust.document ?? null;
  }

  /**
   * Derives the overall SR status from the approver chain.
   * - If any approver explicitly rejected → 'Rejected'
   * - If all approved → 'Approved'
   * - Otherwise → 'Pending Approval'
   */
  private deriveOverallStatus(basics: PositionBasicsResponse): SrStatus {
    if (basics.approved) return 'Approved';
    // Could add rejected logic here if backend provides it
    return 'Pending Approval';
  }

  /**
   * Builds the pipeline stages array from the flat approver fields
   * returned by the position-basics endpoint.
   * Supports up to 3 approver slots (approver1/2/3).
   */
  private buildPipelineStages(basics: PositionBasicsResponse): ApprovalStage[] {
    const slots = [
      {
        approverBy:   basics.approver1By,
        approverRole: basics.approver1Role,
        dateApproval: basics.dateOfApproval1,
        comments:     basics.commentsByApprover1,
      },
      {
        approverBy:   basics.approver2By,
        approverRole: basics.approver2Role,
        dateApproval: basics.dateOfApproval2,
        comments:     basics.commentsByApprover2,
      },
      {
        approverBy:   basics.approver3By,
        approverRole: basics.approver3Role,
        dateApproval: basics.dateOfApproval3,
        comments:     basics.commentsByApprover3,
      },
    ];

    // Filter to only defined slots
    const defined = slots.filter(s => s.approverRole !== null || s.approverBy !== null);

    // If no approvers defined yet, fall back to mock pipeline for UX display
    if (!defined.length) {
      return this.getMockPipelineStages();
    }

    let foundInProgress = false;
    return defined.map((slot, i) => {
      let status: StageStatus;
      if (slot.dateApproval) {
        status = 'APPROVED';
      } else if (!foundInProgress) {
        status = 'IN_PROGRESS';
        foundInProgress = true;
      } else {
        status = 'PENDING';
      }

      const name = slot.approverBy ?? '';
      return {
        id:               i + 1,
        role:             slot.approverRole ?? `Approver ${i + 1}`,
        approverName:     name,
        approverInitials: this.getInitials(name),
        status,
        timestamp: slot.dateApproval ? this.formatDate(slot.dateApproval) : undefined,
        comments:  slot.comments ?? '',
      };
    });
  }

  /**
   * Fallback pipeline when no approver data exists yet on the SR.
   * Shown so the UI always has a meaningful pipeline displayed.
   */
  private getMockPipelineStages(): ApprovalStage[] {
    return [
      { id: 1, role: 'HM Manager',  approverName: '', approverInitials: '', status: 'IN_PROGRESS' },
      { id: 2, role: 'Dept Head',   approverName: '', approverInitials: '', status: 'PENDING' },
      { id: 3, role: 'HRBP',        approverName: '', approverInitials: '', status: 'PENDING' },
    ];
  }

  /** Formats an ISO date string (YYYY-MM-DD) to a readable label */
  private formatDate(iso: string | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return iso;
    }
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
      await this.approvalSvc.approveOrReject({
        srId: this.srId,
        decision: 'APPROVE',
        comments: this.approvalComment,
      });
      console.log('Approved', { srId: this.srId, comments: this.approvalComment });
    } catch (err) {
      console.error('Approval failed', err);
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
      await this.approvalSvc.approveOrReject({
        srId: this.srId,
        decision: 'REJECT',
        comments: this.approvalComment,
      });
      console.log('Rejected', { srId: this.srId, comments: this.approvalComment });
    } catch (err) {
      console.error('Rejection failed', err);
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


  private getApiMockData(): SrApiResponse {

    return {
      data: {
        positonBasicsResponse: {
          id: 253,
          srId: 'SR-2026-TAC-0275',
          jobTitle: 'Senior Backend Engineer',
          businessUnitName: 'Human Capital Management',
          departmentId: 1,
          departmentName: 'Talent Acquisition',
          reportingManagerInfo: [7, 46],
          location: 'Hyderabad, India',
          seniorityLevelName: 'M1',
          openings: 4,
          targetStartDate: '2026-05-06',
          workMode: 'Remote',
          employmentType: 'Part-time',
          priority: 'High',
          approved: false,
          createdOn: '2026-05-06',
          createdBy: 'Venakt',
          userId: 9,
          approver1: null,
          approver2: null,
          approver3: null,
          approver1By: null,
          approver2By: null,
          approver3By: null,
          dateOfApproval1: null,
          dateOfApproval2: null,
          dateOfApproval3: null,
          commentsByApprover1: null,
          commentsByApprover2: null,
          commentsByApprover3: null,
          approver1Role: null,
          approver2Role: null,
          approver3Role: null,
        },
        businessJustificationResponse: {
          id: 96,
          srId: 'SR-2026-TAC-0275',
          requisitionType: 'Replacement',
          businessCase: '<p>This&nbsp;role&nbsp;is&nbsp;required&nbsp;to&nbsp;bring&nbsp;in&nbsp;specialized&nbsp;expertise&nbsp;in&nbsp;backend&nbsp;architecture,&nbsp;system&nbsp;scalability,&nbsp;and&nbsp;performance&nbsp;optimization.</p>',
          impactIfNotFilled: '<p>The&nbsp;purpose&nbsp;of&nbsp;this&nbsp;hiring&nbsp;request&nbsp;is&nbsp;to&nbsp;support&nbsp;the&nbsp;growing&nbsp;workload&nbsp;within&nbsp;the&nbsp;Engineering&nbsp;team&nbsp;and&nbsp;ensure&nbsp;timely&nbsp;delivery&nbsp;of&nbsp;key&nbsp;product&nbsp;features.</p>',
          replacesEmployee: 47,
          document: null,
          draft: null,
          submitted: true,
          approved: false,
        },
        budgetAndCompensationResponse: {
          id: 52,
          srId: 'SR-2026-TAC-0275',
          proposedTotalCompensation: 10000,
          signingBonus: true,
          equity: true,
          relocationBudget: false,
          signingBonusAmount: 10000,
          equityAmount: 10000,
          relocationBudgetAmount: 0,
          annualHiringCost: 30000,
          draft: null,
          submitted: true,
          minSalary: 300000,
          maxSalary: 500000,
          approved: false,
        },
        rolesAndRequirementsResponse: {
          id: 33,
          srId: 'SR-2026-TAC-0275',
          skillsMustHave: [
            'Distributed Systems Architecture',
            'Database Schema Design & Optimization',
            'Technical Leadership & Mentorship',
            'Asynchronous Messaging & Event-Driven Architecture',
          ],
          niceToHaveSkills: [
            'API Gateway Management',
            'Technical Mentorship',
            'Stakeholder Communication',
          ],
          educationRequirement: 'B.Tech in Computer Science and Engineering',
          travelRequirement: '2',
          minExperience: 5,
          maxExperience: 10,
          minInterviewRounds: 2,
          maxInterviewRounds: 6,
          certificationsRequired: [
            'AWS Certified Solutions Architect – Professional',
            'Certified Kubernetes Administrator (CKA)',
            'Confluent Certified Developer for Apache Kafka',
          ],
          languages: ['English'],
          assessmentRequired: false,
          submitted: true,
          approved: false,
        },
        sourcingStrategyResponse: {
          id: 30,
          srId: 'SR-2026-TAC-0275',
          internalBoard: true,
          naukri: true,
          linkedIn: false,
          indeed: false,
          companySite: false,
          agencyRpo: true,
          internalFirstPolicy: true,
          sourcingBudget: 1000,
          referralEnabled: false,
          referralAmount: 0.0,
          diversityEnabled: false,
          diversityTags: [''],
          draft: null,
          submitted: true,
          approved: false,
        },
      },
      message: 'SR data fetched successfully',
      responsecode: '00',
    };
  }
}