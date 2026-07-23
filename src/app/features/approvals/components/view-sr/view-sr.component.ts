import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, firstValueFrom } from 'rxjs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { SrReviewComponent } from '../../../demand/components/sr-review/sr-review';
import { ApprovalService } from '../../services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';
import { StaffingServiceService } from '../../../demand/services/staffing-service.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommentModalAction, CommentModalConfig, CommentModalResult, CommonModalComponent } from '../../../../shared/components/common-modal/common-modal.component';
import { ApprovalPipelineComponent } from '../approval-pipeline/approval-pipeline.component';
import { ApprovalTimelineComponent } from '../approval-timeline/approval-timeline.component';
import { ApprovalStage, STAGE_STATUS_CONFIG, StageStatus } from '../../../../shared/constants/approval.stage.modal';



// ─── SR overall-status ────────────────────────────────────────────────────────
export type SrStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface SrStatusDef { label: string; color: string; bg: string; border: string; }

export const SR_STATUS_CONFIG: Record<SrStatus, SrStatusDef> = {
  'Pending Approval': { label: 'Pending Approval', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  Rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

export const PRIORITY_COLOR: Record<string, string> = {
  High: '#f97316',
  Medium: '#3b82f6',
  Low: '#22c55e',
};

// ─── API response shape ───────────────────────────────────────────────────────
interface PositionBasicsResponse {
  id: number; srId: string; jobTitle: string; businessUnitName: string;
  departmentId: number; departmentName: string; reportingManagerInfo: number[];
  location: string; country:string,seniorityLevelName: string; openings: number;
  targetStartDate: string; workMode: string; employmentType: string;
  priority: string; approved: boolean; createdOn: string;
  createdBy: string; userId: number;
  approver1: boolean | null; approver2: boolean | null; approver3: boolean | null;
  approver1By: string | null; approver2By: string | null; approver3By: string | null;
  dateOfApproval1: string | null; dateOfApproval2: string | null; dateOfApproval3: string | null;
  commentsByApprover1: string | null; commentsByApprover2: string | null; commentsByApprover3: string | null;
  approver1Role: string | null; approver2Role: string | null; approver3Role: string | null;
  submittedOn:string | null;
}

interface BusinessJustificationResponse {
  id: number; srId: string; requisitionType: string; businessCase: string;
  impactIfNotFilled: string; replacesEmployee: number | null; document: any;
  draft: any; submitted: boolean; approved: boolean;
}

interface BudgetAndCompensationResponse {
  id: number; srId: string; proposedTotalCompensation: number; signingBonus: boolean;
  equity: boolean; relocationBudget: boolean; signingBonusAmount: number;
  equityAmount: number; relocationBudgetAmount: number; annualHiringCost: number;
  draft: any; submitted: boolean; minSalary: number; maxSalary: number; approved: boolean;
}

interface RolesAndRequirementsResponse {
  id: number; srId: string; skillsMustHave: string[]; niceToHaveSkills: string[];
  educationRequirement: string; travelRequirement: string; minExperience: number;
  maxExperience: number; minInterviewRounds: number; maxInterviewRounds: number;
  certificationsRequired: string[]; languages: string[];
  assessmentRequired: boolean; submitted: boolean; approved: boolean;
}

interface SourcingStrategyResponse {
  id: number; srId: string; internalBoard: boolean; naukri: boolean; linkedIn: boolean;
  indeed: boolean; companySite: boolean; agencyRpo: boolean; internalFirstPolicy: boolean;
  sourcingBudget: number; referralEnabled: boolean; referralAmount: number;
  diversityEnabled: boolean; diversityTags: string[];
  draft: any; submitted: boolean; approved: boolean;
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
    NzModalModule,
    HeadingComponent,
    SrReviewComponent,
    CommonModalComponent,
    ApprovalPipelineComponent,
    ApprovalTimelineComponent,
  ],
  templateUrl: './view-sr.component.html',
  styleUrl: './view-sr.component.scss',
})
export class ViewSrComponent implements OnInit {

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private approvalSvc = inject(ApprovalService);
  private userSvc = inject(UserService);
  private demandSvc = inject(StaffingServiceService);
  private notificationService = inject(NotificationService);


  isLoading = true;
  isSubmitting = false;
  isFullSrOpen = false;

  /** Set from router state `type`: 'view' hides ticks + action buttons; 'approve' is the default. */
  pageType: 'view' | 'approve' = 'approve';
  get isViewMode(): boolean { return this.pageType === 'view'; }


  readonly TOTAL_SECTIONS = 4;
  reviewedCount = 0;

  get allSectionsReviewed(): boolean { return this.reviewedCount >= this.TOTAL_SECTIONS; }


  srId = '';
  jobTitle = '';
  overallStatus: SrStatus = 'Pending Approval';
  createdBy = '';
  department = '';
  dateCreated = '';
  priority = '';
  targetStartDate = '';
  submittedOn:any;
  get metaItems() {
    return [
      { icon: 'fa-regular fa-user', label: 'Created By', value: this.createdBy, isPriority: false },
      { icon: 'fa-regular fa-building', label: 'Department', value: this.department, isPriority: false },
      { icon: 'fa-regular fa-calendar', label: 'Date Created', value: this.dateCreated, isPriority: false },
      { icon: 'fa-regular fa-paper-plane',   label: 'Submitted On',      value: this.submittedOn,     isPriority: false },
      { icon: 'fa-solid fa-flag', label: 'Priority', value: this.priority, isPriority: true },
      { icon: 'fa-regular fa-calendar-check', label: 'Target Start Date', value: this.targetStartDate, isPriority: false },
    ];
  }


  pipelineStages: ApprovalStage[] = [];
  hasRealApproverData = false;

  get timelineStages(): ApprovalStage[] {
    return this.pipelineStages.filter(s => s.role !== 'HM Manager');
  }


  showCommentModal = false;
  commentModalAction: CommentModalAction | null = null;


  get modalConfig(): Partial<CommentModalConfig> | null {
    if (!this.commentModalAction) return null;
    const map: Record<CommentModalAction, Partial<CommentModalConfig>> = {
      approve: { title: 'Approve SR', description: 'Please provide a comment before approving this Staffing Requisition.' },
      reject: { title: 'Reject SR', description: 'Please provide a reason for rejecting this Staffing Requisition.' },
      deactivate: { title: 'Deactivate', description: 'Please provide a reason for deactivating.' },
      activate: { title: 'Activate', description: 'Please provide a reason for activating.' },
    };
    return map[this.commentModalAction] ?? null;
  }


  step0: any = null; step1: any = null; step2: any = null;
  step3: any = null; step4: any = null;
  mustSkills: string[] = []; niceSkills: string[] = [];
  certs: string[] = []; langs: string[] = [];
  jobBoards: string[] = []; assessmentTypes: string[] = [];
  diversityBoards: string[] = []; selectedManagers: any[] = [];
  replaceEmployee: any = null; supportDoc: any = null;


  readonly stageStatusCfg = STAGE_STATUS_CONFIG;
  readonly srStatusCfg = SR_STATUS_CONFIG;
  readonly priorityColor = PRIORITY_COLOR;

  get currentSrStatus(): SrStatusDef {
    return this.srStatusCfg[this.overallStatus] ?? this.srStatusCfg['Pending Approval'];
  }

  get priorityDotColor(): string {
    return this.priorityColor[this.priority] ?? '#9ca3af';
  }


  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }


  url: any;

  ngOnInit(): void {
    const state = history.state ?? {};
    console.log(state, history.state);
    this.srId = state.srId ?? '';
    this.url = history.state?.url;
    this.pageType = state.type === 'view' ? 'view' : 'approve';
    this.loadSrDetails();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  private async loadSrDetails(): Promise<void> {
    try {
      const pageParams = { page: 0, size: 10, sortBy: 'id', direction: 'DESC', filters: {} };

      const [res, travelRes, firstPage]: any[] = await firstValueFrom(
        forkJoin([
          this.approvalSvc.getSrDetails(this.srId),
          this.demandSvc.getTravel(),
          this.userSvc.getList({ ...pageParams }),
        ])
      );

      if (res?.responsecode !== '00') { console.error('SR details fetch failed:', res?.message); return; }

      let managersList: any[] = firstPage?.data?.users ?? firstPage?.content ?? [];
      const totalElements: number = firstPage?.data?.totalElements ?? 0;
      if (totalElements > 10) {
        const fullRes: any = await this.userSvc.getList({ ...pageParams, size: totalElements });
        managersList = fullRes?.data?.users ?? fullRes?.content ?? [];
      }

      const travelOpts: { id: string; name: string }[] = travelRes?.data ?? [];
      const getTravelName = (id: string): string => travelOpts.find(t => String(t.id) === String(id))?.name ?? id;

      this.mapApiResponse(res, managersList, getTravelName);
    } catch (err) {
      console.error('Failed to load SR details', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private mapApiResponse(res: SrApiResponse, managersList: any[], getTravelName: (id: string) => string): void {
    const basics = res.data.positonBasicsResponse;
    const bizJust = res.data.businessJustificationResponse;
    const budget = res.data.budgetAndCompensationResponse;
    const roles = res.data.rolesAndRequirementsResponse;
    const sourcing = res.data.sourcingStrategyResponse;

    this.srId = basics.srId;
    this.jobTitle = basics.jobTitle;
    this.createdBy = basics.createdBy;
    this.department = basics.departmentName;
    this.submittedOn =basics?.submittedOn ? this.formatDate( basics?.submittedOn):'-';
    this.dateCreated = this.formatDate(basics.createdOn);
    this.priority = basics.priority;
    this.targetStartDate = this.formatDate(basics.targetStartDate);
    this.overallStatus = this.deriveOverallStatus(basics);
    this.pipelineStages = this.buildPipelineStages(basics);

    this.step0 = {
      jobTitle: basics.jobTitle, dept: basics.departmentName, bu: basics.businessUnitName,
      location: basics.location, country:basics?.country,workMode: basics.workMode, empType: basics.employmentType,
      seniority: basics.seniorityLevelName, openings: basics.openings,
      priority: basics.priority, startDate: basics.targetStartDate,
    };

    this.selectedManagers = Array.isArray(basics.reportingManagerInfo)
      ? basics.reportingManagerInfo
        .map((id: any) => managersList.find((u: any) => String(u.id) === String(id)))
        .filter(Boolean)
      : [];

    this.step1 = {
      justType: bizJust.requisitionType ?? '', bizCase: bizJust.businessCase ?? '',
      impactNote: bizJust.impactIfNotFilled ?? '',
    };

    const replacedUser = bizJust.replacesEmployee
      ? managersList.find((u: any) => String(u.id) === String(bizJust.replacesEmployee))
      : null;
    this.replaceEmployee = replacedUser
      ? { id: replacedUser.id, username: String(replacedUser.username ?? replacedUser.name ?? replacedUser.id) }
      : null;
    this.supportDoc = bizJust.document ? { name: bizJust.document, sizeText: '' } : null;

    this.step2 = {
      costCenter: (budget as any).costCenter ?? '', budgetCode: (budget as any).budgetCode ?? '',
      hcSlot: budget.approved ?? false,
      salaryComp: `${budget.minSalary}-${budget.maxSalary}`,
      proposedComp: Number(budget.proposedTotalCompensation),
      signingBonus: budget.signingBonus, signingAmt: Number(budget.signingBonusAmount),
      equity: budget.equity, equityAmt: Number(budget.equityAmount),
      relocation: budget.relocationBudget, relocAmt: Number(budget.relocationBudgetAmount),
      annualHiringCost: budget.annualHiringCost ?? 0,
    };

    this.step3 = {
      eduReq: roles.educationRequirement, travel: getTravelName(roles.travelRequirement ?? ''),
      expMin: roles.minExperience, expMax: roles.maxExperience,
      interviewMin: roles.minInterviewRounds, interviewMax: roles.maxInterviewRounds,
      // assessmentOn: roles.assessmentRequired,
    };

    this.step4 = {
      internalFirst: sourcing?.internalFirstPolicy ?? '-',
      sourcingBudget: sourcing?.sourcingBudget != null ? String(sourcing.sourcingBudget) : '',
      referralOn: sourcing?.referralEnabled,
      referralAmt: sourcing?.referralAmount != null ? String(sourcing.referralAmount) : '',
      diversityOn: sourcing?.diversityEnabled,
    };
    console.log(roles);
    this.mustSkills = this.splitCsv(roles.skillsMustHave);
    this.niceSkills = this.splitCsv(roles.niceToHaveSkills);
    this.certs = this.splitCsv(roles.certificationsRequired);
    this.langs = this.splitCsv(roles.languages);
    this.diversityBoards = this.splitCsv(sourcing.diversityTags);
    this.assessmentTypes = [];

    const boardKeys: Record<string, string> = {
      internalBoard: 'Internal Board', naukri: 'Naukri', linkedIn: 'LinkedIn',
      indeed: 'Indeed', companySite: 'Company Site', agencyRpo: 'Agency / RPO',
    };
    this.jobBoards = Object.entries(boardKeys)
      .filter(([key]) => (sourcing as any)[key])
      .map(([, label]) => label);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private splitCsv(value: string | string[] | null | undefined): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }

  private deriveOverallStatus(basics: PositionBasicsResponse): SrStatus {
    // A stage is truly rejected only when a decision date exists AND the flag is explicitly false
    const isRejected =
      (basics.approver1 === false && basics.dateOfApproval1 !== null) ||
      (basics.approver2 === false && basics.dateOfApproval2 !== null) ||
      (basics.approver3 === false && basics.dateOfApproval3 !== null);
    if (isRejected) return 'Rejected';
    return basics.approved ? 'Approved' : 'Pending Approval';
  }

  private buildPipelineStages(basics: PositionBasicsResponse): ApprovalStage[] {
    const slots = [
      { approvedFlag: basics.approver1, approverBy: basics.approver1By, approverRole: basics.approver1Role, dateApproval: basics.dateOfApproval1, comments: basics.commentsByApprover1 },
      { approvedFlag: basics.approver2, approverBy: basics.approver2By, approverRole: basics.approver2Role, dateApproval: basics.dateOfApproval2, comments: basics.commentsByApprover2 },
      { approvedFlag: basics.approver3, approverBy: basics.approver3By, approverRole: basics.approver3Role, dateApproval: basics.dateOfApproval3, comments: basics.commentsByApprover3 },
    ];

    const defined = slots.filter(s => s.approverRole !== null && s.approverRole !== undefined);
    if (!defined.length) { this.hasRealApproverData = false; return []; }

    this.hasRealApproverData = true;
    let foundInProgress = false;
    let foundRejected = false;

    const approverStages: ApprovalStage[] = defined.map((slot, i) => {
      let status: StageStatus;
      if (slot.dateApproval) {
        // A decision date exists — check whether it was approved or rejected
        if (slot.approvedFlag === false) {
          status = 'REJECTED';
          foundRejected = true;
        } else {
          status = 'APPROVED';
        }
      } else if (foundRejected) {
        // Prior stage was rejected — this one is blocked
        status = 'PENDING';
      } else if (!foundInProgress) {
        // No decision yet and no prior in-progress — this is the current active stage
        status = 'IN_PROGRESS';
        foundInProgress = true;
      } else {
        // A later stage still waiting
        status = 'PENDING';
      }
      const name = slot.approverBy ?? '';
      return {
        id: i + 2, role: slot.approverRole ?? `Approver ${i + 1}`,
        approverName: name, approverInitials: this.getInitials(name),
        status,
        timestamp: slot.dateApproval ? this.formatDateTime(slot.dateApproval) : undefined,
        comments: slot.comments ?? '',
        prevRejected: status === 'PENDING' && foundRejected,
      };
    });

    // ── Prepend the HM Manager stage (always APPROVED — they created the SR) ──
    const creatorName = basics.createdBy ?? '';
    const hmStage: ApprovalStage = {
      id: 1,
      role: 'HM Manager',
      approverName: creatorName,
      approverInitials: this.getInitials(creatorName),
      status: 'CREATED',
      timestamp: this.formatDateTime(basics.createdOn),
      comments: 'SR submitted for approval.',
    };

    return [hmStage, ...approverStages];
  }

  private formatDate(iso: string | null): string {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  }

  /** Formats an ISO date/datetime as  "12 May 2026, 09:30 AM" */
  private formatDateTime(iso: string | null): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${datePart}, ${timePart}`;
    } catch { return iso; }
  }

  // ── Tick handler ──────────────────────────────────────────────────────────
  onTicksChanged(ticks: boolean[]): void {
    this.reviewedCount = ticks.filter(Boolean).length;
    this.cdr.markForCheck();
  }

  // ── Comment Modal ─────────────────────────────────────────────────────────
  openCommentModal(action: CommentModalAction): void {
    this.commentModalAction = action;
    this.showCommentModal = true;
    this.cdr.markForCheck();
  }

  closeCommentModal(): void {
    this.showCommentModal = false;
    this.commentModalAction = null;
    this.cdr.markForCheck();
  }


  async onModalConfirmed(result: CommentModalResult): Promise<void> {
    if (!this.allSectionsReviewed) return;

    this.isSubmitting = true;
    this.cdr.markForCheck();

    try {
      const res: any = await this.approvalSvc.approveOrReject({
        srId: this.srId,
        approved: result.action === 'approve',
        comments: result.comment,
      });

      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message || res?.responseMessage);
        this.showCommentModal = false;
        this.goBack();
      } else {
        this.notificationService.error(res?.errors?.[0] || res?.message || res?.responseMessage);
      }
    } catch (err) {
      console.error('Approval/Rejection failed', err);
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }


  onApprove(): void {
    if (!this.allSectionsReviewed || this.isSubmitting) return;
    this.openCommentModal('approve');
  }

  onReject(): void {
    if (!this.allSectionsReviewed || this.isSubmitting) return;
    this.openCommentModal('reject');
  }

  openFullSr(): void { this.isFullSrOpen = true; }
  closeFullSr(): void { this.isFullSrOpen = false; }

  goBack(): void {
    console.log(history.state?.url);
    this.router.navigateByUrl(history.state?.url ?? '/approval/sr-list');
  }
}