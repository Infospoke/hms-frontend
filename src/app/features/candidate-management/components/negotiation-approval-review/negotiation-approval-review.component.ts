import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ApprovalPipelineComponent } from '../../../approvals/components/approval-pipeline/approval-pipeline.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';
// TODO: adjust this relative path to wherever app-common-modal actually
// lives in the repo — using the same folder-naming pattern as the other
// shared imports above as a best guess.
import {
  CommonModalComponent,
  CommentModalAction,
  CommentModalResult,
} from '../../../../shared/components/common-modal/common-modal.component';

import { ApprovalStage } from '../../../../shared/constants/approval.stage.modal';
import {
  ApprovedBudgetInfo,
  NegotiationComparisonItem,
  NegotiationDocument,
  OFFER_STAGE_ORDER,
  OFFER_CREATOR_ROLE,
  OFFER_APPROVAL_STAGES,
} from '../../../../shared/constants/offer.model';
import { AuthService } from '../../../../core/auth/auth.service';

interface NegotiationApprovalStageApi {
  approvedBy: string | null;
  approvedOn: string | null;
  role: string;
  stage: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
}

interface NegotiationApprovalApiResponse {
  data: {
    annualHiringCost: number | null;
    applicantId: number;
    approvalStages: NegotiationApprovalStageApi[];
    candidateId: string | null;
    candidateName: string | null;
    email: string | null;
    hrReason: string | null;
    hrRecommendations: { amount: number; fieldName: string }[];
    hrRecommendedCtc: number | null;
    jobId: number;
    jobTitle: string | null;
    joiningDate: string | null;
    joiningDateReason: string | null;
    maximumSalary: number | null;
    minimumSalary: number | null;
    negotiation: {
      fieldName: string;
      initialAmount: number | null;
      reason: string;
      requestedAmount: number | null;
    }[];
    negotiationId: number;
    offerReleasedOn: string;
    others: string | null;
    overallJustification: string;
    revisedJoiningDate: string | null;
    srId: string | null;
    supportingDocuments: string[];
    totalRequestedAmount: number | null;
  };
  message: string;
  responsecode: string;
}

const ITEM_ICONS: Record<string, string> = {
  'basic pay': 'fa-solid fa-credit-card',
  'fixed pay': 'fa-solid fa-credit-card',
  'hra': 'fa-solid fa-house',
  'special allowance': 'fa-solid fa-star',
  'signing bonus': 'fa-solid fa-gift',
  'joining bonus': 'fa-solid fa-gift',
  'equity/rsu': 'fa-solid fa-chart-line',
  'relocation budget': 'fa-solid fa-key',
};
const DEFAULT_ITEM_ICON = 'fa-solid fa-file-lines';
const TERMS_KEYWORDS = ['period', 'date', 'notice', 'location'];


// Which stage of approvalStages (from the negotiation-details API) is
// currently PENDING drives this — see mapRoleToApproverRole/applyNegotiationDetails.
// Falls back to authService.getRole() / route data / query param only until
// the API response has loaded.
export type ApproverRole = 'FINANCE_ANALYST' | 'FINANCE_HEAD' | 'HR_HEAD';

// Static role-name → ApproverRole lookup, built once from OFFER_STAGE_ORDER
// so there's a single source of truth for role-name matching across:
// the default (pre-API) pipeline, authService.getRole(), and the API's
// approvalStages[].role.
const ROLE_TO_APPROVER_ROLE: Record<string, ApproverRole> = {
  'finance analyst': 'FINANCE_ANALYST',
  'finance head': 'FINANCE_HEAD',
  'hr head': 'HR_HEAD',
};

const GUARANTEED_HR_FIELDS: { label: string; icon: string }[] = [
  { label: 'Basic Pay', icon: 'fa-solid fa-credit-card' },
  { label: 'Signing Bonus', icon: 'fa-solid fa-gift' },
  { label: 'Equity/RSU', icon: 'fa-solid fa-chart-line' },
  { label: 'Relocation Budget', icon: 'fa-solid fa-key' },
];

@Component({
  selector: 'app-negotiation-approval-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ApprovalPipelineComponent, CommonModalComponent],
  templateUrl: './negotiation-approval-review.component.html',
  styleUrl: './negotiation-approval-review.component.scss',
})
export class NegotiationApprovalReviewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private candidateService = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);
  private authService=inject(AuthService);
  isLoading = true;
  isSubmitting = false;
  private applicantId: any;
  // offerId comes from the route (offer-management/negotiation-approvals/:id/:offerId) —
  // needed for the HR-head "regenerate offer letter" call below.
  private offerId: any;

  // Placeholder until applyNegotiationDetails() below overwrites it with the
  // real value derived from the API's approvalStages (first PENDING stage).
  currentApproverRole: ApproverRole = 'HR_HEAD';

  // The logged-in user's own role, resolved from authService.getRole()
  // against the static OFFER_STAGE_ORDER. Independent of which stage the
  // negotiation is currently sitting at — used purely for canEditDecisions
  // (only a Finance Analyst may edit the comparison table, regardless of
  // which stage is currently pending).
  private myRole: ApproverRole | null = null;

  // Raw approvalStages from the API, kept around so priorStagesApproved
  // (used to gate the HR head's "3rd stage") can check the earlier stages.
  private approvalStagesRaw: NegotiationApprovalStageApi[] = [];

  statusBadge = 'Awaiting hr manager';

  // ── Header ───────────────────────────────────────────────────────────────
  candidate = {
    name: '', initials: '', avatarColor: '#7C3AED',
    role: '', department: '', email: '',
    requestedOn: '', currentCtc: 0,
    candidateId: '' as string | null,
  };

  jobTitle = '';
  // TODO: recruiter isn't part of the negotiation-details response —
  // wire this up once a field/endpoint for it is confirmed.
  recruiterName = '';

  // ── Approval pipeline — Department head -> Finance team -> HR manager ->
  // Final approval.
  // TODO: this API doesn't return approver-chain stage statuses yet, so
  // the pipeline below is still DUMMY data. Swap for real stage data
  // (matching the response contract) once it's available.
  pipelineStages: ApprovalStage[] = [];

  // ── "View approved budget & compensation" popup ─────────────────────────
  // TODO: no budget-band data in this API either — stays DUMMY until a
  // real budget endpoint/field is confirmed.
  showBudgetModal = false;
  budget: ApprovedBudgetInfo = {
    compensationBandMin: 0, compensationBandMax: 0,
    departmentBudgetAnnual: 0, allocatedThisQuarter: 0, remainingBudget: 0,
    note: '',
  };

  // ── Requested package vs market range ───────────────────────────────────
  marketMin = 0;
  marketMax = 0;
  offeredCtc = 0;
  askedCtc = 0;

  get hasOfferBaseline(): boolean { return this.offeredCtc > 0; }
  get aboveMarketMax(): boolean { return this.askedCtc > this.marketMax; }
  get belowMarketMin(): boolean { return this.askedCtc > 0 && this.askedCtc < this.marketMin; }
  get withinMarketRange(): boolean { return this.askedCtc > 0 && !this.aboveMarketMax && !this.belowMarketMin; }
  get deltaAmount(): number { return Math.max(0, this.askedCtc - this.marketMax); }
  get deltaPercent(): number {
    if (!this.marketMax) return 0;
    return Math.round((this.deltaAmount / this.marketMax) * 1000) / 10;
  }
  get marketPercentile(): number {
    if (this.marketMax <= this.marketMin) return 0;
    return Math.round(((this.askedCtc - this.marketMin) / (this.marketMax - this.marketMin)) * 100);
  }

  private trackPosition(value: number): number {
    const upper = Math.max(this.marketMax, this.askedCtc, this.marketMin + 1);
    const range = upper - this.marketMin;
    if (range <= 0) return 0;
    return Math.min(100, Math.max(0, ((value - this.marketMin) / range) * 100));
  }
  get marketMaxPosition(): number { return this.trackPosition(this.marketMax); }
  get offerPosition(): number { return this.trackPosition(this.offeredCtc); }
  get askedPosition(): number { return this.trackPosition(this.askedCtc); }

  get markersOverlap(): boolean {
    return this.hasOfferBaseline && this.askedCtc > 0
      && Math.abs(this.offerPosition - this.askedPosition) < 10;
  }

  // ── Candidate's reason for negotiation + comparison table ───────────────
  items: NegotiationComparisonItem[] = [];

  
  get reasonItems(): NegotiationComparisonItem[] {
    return this.items.filter(i => i.candidateAsked != null);
  }

  // ── HR recommendation — read-only display; HR already made this call on
  // the review-negotiation-request page, the approver just sees it here. ──
  hrRecommendedPackage = 0;
  hrRecommendationNote = '';

  documents: NegotiationDocument[] = [];

  reasonForSendingBack = '';

  // ── HR head — offer letter must be regenerated before they can approve ──
  isRegeneratingOfferLetter = false;
  isOfferLetterRegenerated = false;

  get isHrHead(): boolean {
    return this.currentApproverRole === 'HR_HEAD';
  }

  // Stage 3 (HR head) can't be actioned until stages 1 & 2 (Finance
  // Analyst, Finance Head) are both APPROVED. In practice currentApproverRole
  // is only ever HR_HEAD once the API says those stages are done — this is
  // a defensive re-check on the raw stage list.
  get priorStagesApproved(): boolean {
    const hrStageIndex = this.approvalStagesRaw.findIndex(
      s => this.mapRoleToApproverRole(s.role) === 'HR_HEAD',
    );
    if (hrStageIndex <= 0) return true;
    return this.approvalStagesRaw
      .slice(0, hrStageIndex)
      .every(s => s.status === 'APPROVED');
  }

  get canApprove(): boolean {
    return !this.isSubmitting
      && this.items.some(i => i.forward && !i.isDate && Number(i.yourDecision) > 0)
      && (!this.isHrHead || (this.priorStagesApproved && this.isOfferLetterRegenerated));
  }

  // Only a Finance Analyst may edit the "Your decision" column of the
  // comparison table — Finance Head and HR Head see it read-only.
  get canEditDecisions(): boolean {
    return this.currentApproverRole === 'FINANCE_ANALYST';
  }

  // ── Comment modal (app-common-modal) — every decision (approve / send
  // back) now routes through this for a required comment before the
  // underlying API call fires. ──
  commentModalVisible = false;
  commentModalAction: CommentModalAction | null = null;
  private pendingDecision: 'approve' | 'sendback' | null = null;

  // ── Supporting document preview modal ───────────────────────────────────
  isDocModalOpen = false;
  isDocModalLoading = false;
  docModalError = '';
  docModalTitle = '';
  docModalUrl: SafeResourceUrl | null = null;
  private docModalObjectUrl: string | null = null;

  ngOnInit(): void {
    this.applicantId = this.route.snapshot.paramMap.get('id');
    this.offerId = this.route.snapshot.paramMap.get('offerId');

    // Resolve the logged-in user's role against the static OFFER_STAGE_ORDER
    // (['HR', 'Finance Analyst', 'Finance Head', 'HR Head']). Only roles
    // that are actual *approval* stages (i.e. everything except the
    // creator, HR) map to an ApproverRole — HR never approves on this screen.
    const rawRole = this.authService.getRole();
    const matchedStageRole = OFFER_STAGE_ORDER.find(
      (r) => r.toLowerCase() === (rawRole ?? '').trim().toLowerCase(),
    );
    this.myRole =
      matchedStageRole && matchedStageRole !== OFFER_CREATOR_ROLE
        ? this.mapRoleToApproverRole(matchedStageRole)
        : null;

    // Placeholder until the negotiation-details response loads and
    // applyNegotiationDetails() derives the real current-approver role from
    // approvalStages — this just avoids a flash of the wrong branch/gate
    // while the request is in flight.
    this.currentApproverRole =
      (this.route.snapshot.data['approverRole'] as ApproverRole)
      ?? (this.route.snapshot.queryParamMap.get('role') as ApproverRole)
      ?? this.myRole
      ?? 'HR_HEAD';

    // Static default pipeline (all stages PENDING) so the UI never flashes
    // empty while loadAll() below is in flight — buildPipelineStages()
    // overwrites this with real statuses once the API responds.
    this.pipelineStages = this.buildDefaultPipelineStages();

    this.loadAll();
  }

  /** Static, pre-API pipeline: every stage in OFFER_APPROVAL_STAGES shown as PENDING. */
  private buildDefaultPipelineStages(): ApprovalStage[] {
    return OFFER_APPROVAL_STAGES.map((role, i): ApprovalStage => ({
      id: i + 1,
      role,
      approverName: '',
      approverInitials: '',
      status: 'PENDING',
    }));
  }

  private async loadAll(): Promise<void> {
    try {
      const res: NegotiationApprovalApiResponse = await this.candidateService.getNegotiationDetails(this.applicantId);

      if (res?.responsecode === '00') {
        this.applyNegotiationDetails(res.data);
      } else {
        console.error('Failed to fetch negotiation approval details:', res?.message);
        this.notificationService.error(res?.message || 'Failed to load the negotiation approval');
      }
    } catch (err) {
      console.error('Failed to load negotiation approval', err);
      this.notificationService.error('Failed to load the negotiation approval. Please try again.');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private applyNegotiationDetails(data: NegotiationApprovalApiResponse['data']): void {
    // ── Header ──
    this.candidate = {
      name: data.candidateName ?? '',
      initials: this.getInitials(data.candidateName ?? ''),
      avatarColor: '#7C3AED',
      // TODO: role/department aren't part of this API response.
      role: '',
      department: '',
      email: data.email ?? '',
      requestedOn: this.formatDateTime(data.offerReleasedOn),
      // "Current CTC on table" = what HR has recommended forward, falling
      // back to the candidate's total ask if HR hasn't recommended yet.
      currentCtc: data.hrRecommendedCtc ?? data.totalRequestedAmount ?? 0,
      candidateId: data.candidateId ?? null,
    };
    this.jobTitle = (data.jobTitle ?? '').trim();

    
    this.approvalStagesRaw = data.approvalStages ?? [];
    this.pipelineStages = this.buildPipelineStages(this.approvalStagesRaw);

    // Whoever's stage is first PENDING is the "current approver" this
    // screen behaves as — drives the finance-vs-HR-head branching in
    // submitApproval() and the offer-letter-regeneration gate below.
    const currentStage = this.approvalStagesRaw.find(s => s.status === 'PENDING');
    if (currentStage) {
      this.currentApproverRole = this.mapRoleToApproverRole(currentStage.role);
      this.statusBadge = `Awaiting ${currentStage.role}`;
    } else if (this.approvalStagesRaw.length) {
      this.statusBadge = 'All stages approved';
    }

    // ── Requested package vs market range ──
    this.marketMin = data.minimumSalary ?? 0;
    this.marketMax = data.maximumSalary ?? 0;
    this.offeredCtc = data.annualHiringCost ?? 0;
    this.askedCtc = data.totalRequestedAmount ?? 0;

    // ── Items — candidate's negotiation + HR's recommendation per field ──
    const hrRecMap = new Map<string, number>();
    for (const rec of data.hrRecommendations ?? []) {
      hrRecMap.set(rec.fieldName.trim().toLowerCase(), rec.amount);
    }

    this.items = (data.negotiation ?? []).map((raw) => this.buildItem(raw, hrRecMap));

    for (const field of GUARANTEED_HR_FIELDS) {
      const alreadyExists = this.items.some(i => i.label.toLowerCase() === field.label.toLowerCase());
      if (!alreadyExists) {
        const hrRecommends = hrRecMap.get(field.label.toLowerCase()) ?? null;
        this.items.push({
          key: field.label.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: field.icon,
          label: field.label,
          category: 'COMPENSATION',
          isDate: false,
          forward: false,
          initialOffer: null,
          candidateAsked: null,
          hrRecommends,
          yourDecision: hrRecommends ?? 0,
          decisionStatus: 'Accepted',
          justification: '',
        });
      }
    }

    // Joining Date always gets a row — HR's revisedJoiningDate is the
    // default decision, falling back to the candidate's original ask.
    const joiningDecision = data.revisedJoiningDate ?? data.joiningDate ?? '';
    this.items.push({
      key: 'joiningDate',
      icon: 'fa-regular fa-calendar',
      label: 'Joining Date',
      category: 'TERMS',
      isDate: true,
      forward: !!data.joiningDateReason,
      initialOffer: null,
      candidateAsked: data.joiningDate ?? null,
      hrRecommends: data.revisedJoiningDate ?? null,
      yourDecision: joiningDecision,
      decisionStatus: 'Accepted',
      justification: data.joiningDateReason ?? '',
    });

    // ── Candidate's overall justification / HR recommendation note ──
    this.hrRecommendedPackage = data.hrRecommendedCtc ?? 0;
    this.hrRecommendationNote = data.hrReason ?? data.overallJustification ?? '';

    // ── Supporting documents — raw filenames only, no size/upload-date
    // metadata, so those are left blank rather than fabricated.
    this.documents = (data.supportingDocuments ?? []).map((path) => {
      const name = path.split('/').pop() || path;
      return {
        name,
        sizeLabel: '',
        uploadedOn: '',
        kind: this.inferKind(name),
        url: path,
      };
    });
  }

  // Always renders the full static OFFER_APPROVAL_STAGES chain (Finance
  // Analyst -> Finance Head -> HR Head), overlaying whatever status/approver
  // data the API returned for each role by name. This way the pipeline
  // never looks incomplete even if the API's approvalStages array is short
  // or out of order.
  private buildPipelineStages(stages: NegotiationApprovalStageApi[]): ApprovalStage[] {
    const byRole = new Map<string, NegotiationApprovalStageApi>();
    for (const s of stages) {
      byRole.set(s.role.trim().toLowerCase(), s);
    }

    let currentMarked = false;
    return OFFER_APPROVAL_STAGES.map((roleName, i): ApprovalStage => {
      const apiStage = byRole.get(roleName.toLowerCase());

      let status: ApprovalStage['status'];
      if (apiStage?.status === 'APPROVED') {
        status = 'APPROVED';
      } else if (apiStage?.status === 'REJECTED') {
        // TODO: confirm 'REJECTED' is an actual member of ApprovalStage['status']
        // — double-cast as a stopgap so this compiles either way.
        status = 'REJECTED' as unknown as ApprovalStage['status'];
      } else if (!currentMarked) {
        // First non-approved stage in order is the one in progress.
        status = 'IN_PROGRESS';
        currentMarked = true;
      } else {
        status = 'PENDING';
      }

      return {
        id: i + 1,
        role: roleName,
        approverName: apiStage?.approvedBy ?? '',
        approverInitials: this.getInitials(apiStage?.approvedBy ?? roleName),
        status,
      };
    });
  }

  private mapRoleToApproverRole(role: string | null | undefined): ApproverRole {
    const normalized = (role ?? '').trim().toLowerCase();
    return ROLE_TO_APPROVER_ROLE[normalized] ?? 'HR_HEAD';
  }

  private buildItem(
    raw: NegotiationApprovalApiResponse['data']['negotiation'][number],
    hrRecMap: Map<string, number>,
  ): NegotiationComparisonItem {
    const hasAsk = raw.requestedAmount != null;
    const isTerms = TERMS_KEYWORDS.some(kw => raw.fieldName.toLowerCase().includes(kw));
    const hrRecommends = hrRecMap.get(raw.fieldName.trim().toLowerCase()) ?? (hasAsk ? raw.requestedAmount : null);

    return {
      key: raw.fieldName.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: ITEM_ICONS[raw.fieldName.trim().toLowerCase()] ?? DEFAULT_ITEM_ICON,
      label: raw.fieldName,
      category: isTerms ? 'TERMS' : 'COMPENSATION',
      isDate: false,
      forward: hasAsk,
      initialOffer: raw.initialAmount,
      candidateAsked: hasAsk ? raw.requestedAmount : null,
      hrRecommends,
      yourDecision: hrRecommends ?? 0,
      decisionStatus: 'Accepted',
      justification: raw.reason ?? '',
    };
  }

  // ── Table interactions ──────────────────────────────────────────────────
  onDecisionChange(item: NegotiationComparisonItem, raw: string): void {
    if (item.isDate) {
      item.yourDecision = raw;
    } else {
      const n = Number(String(raw).replace(/[^\d.-]/g, ''));
      item.yourDecision = isNaN(n) ? 0 : n;
      item.decisionStatus = item.yourDecision === item.hrRecommends ? 'Accepted' : 'Modified';
    }
  }

  openBudgetModal(): void {
    this.showBudgetModal = true;
    this.cdr.markForCheck();
  }

  closeBudgetModal(): void {
    this.showBudgetModal = false;
    this.cdr.markForCheck();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  private formatDateTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  formatCurrency(n: number | null): string {
    if (n == null) return '';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private inferKind(name: string): 'pdf' | 'img' | 'file' {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'img';
    return 'file';
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  onBack(): void {
    this.router.navigate([`/candidate-management/offer-management`],{state:{activeType:'rol'}});
    // this.router.navigateByUrl('/candidate-management/offer-management');
  }

  onViewOfferLetter(): void {
   
    this.notificationService.info('Offer letter preview coming soon');
  }

  // ── Supporting document preview ─────────────────────────────────────────
  async onViewDocument(doc: NegotiationDocument): Promise<void> {
    this.isDocModalOpen = true;
    this.isDocModalLoading = true;
    this.docModalError = '';
    this.docModalTitle = doc.name;
    this.docModalUrl = null;
    this.cdr.markForCheck();

    try {
      const blob: Blob = await this.candidateService.viewDocument({ filePath: doc.url });
      this.revokeDocModalObjectUrl();
      this.docModalObjectUrl = URL.createObjectURL(blob);
      this.docModalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.docModalObjectUrl);
    } catch (err) {
      console.error('Failed to load document preview', err);
      this.docModalError = 'Could not load this document. Please try again.';
    } finally {
      this.isDocModalLoading = false;
      this.cdr.markForCheck();
    }
  }

  closeDocModal(): void {
    this.isDocModalOpen = false;
    this.docModalUrl = null;
    this.docModalError = '';
    this.revokeDocModalObjectUrl();
    this.cdr.markForCheck();
  }

  private revokeDocModalObjectUrl(): void {
    if (this.docModalObjectUrl) {
      URL.revokeObjectURL(this.docModalObjectUrl);
      this.docModalObjectUrl = null;
    }
  }

  async onRegenerateOfferLetter(): Promise<void> {
    if (this.isRegeneratingOfferLetter) return;
    this.isRegeneratingOfferLetter = true;
    this.cdr.markForCheck();
    try {
      const payload={
        application_id: this.applicantId,
          candidate_id: this.candidate.candidateId,
          offer_id: this.offerId,
          total_ctc: this.hrRecommendedPackage,
          approve: true,
          
          comments: 'Regenerating offer letter ahead of negotiation approval',
      }
      const response:any=await this.candidateService.regenerateOfferLetter(payload)
      
      console.log(response);
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      // window.open(objectUrl, '_blank');

      this.isOfferLetterRegenerated = true;
      this.notificationService.success('Offer letter regenerated. You can now approve.');
    } catch (err) {
      console.error('Failed to regenerate offer letter', err);
      this.isOfferLetterRegenerated = false;
      // this.notificationService.error('Failed to regenerate the offer letter. Please try again.');
    } finally {
      this.isRegeneratingOfferLetter = false;
      this.cdr.markForCheck();
    }
  }

  // ── Comment modal entry points ──────────────────────────────────────────
  // Both decisions now open app-common-modal to collect a required comment
  // before the underlying API call fires.
  onSendBackToHR(): void {
    if (this.isSubmitting) return;
    this.pendingDecision = 'sendback';
    this.commentModalAction = 'reject';
    this.commentModalVisible = true;
    this.cdr.markForCheck();
  }

  onApproveAndContinue(): void {
    if (!this.canApprove) return;
    this.pendingDecision = 'approve';
    this.commentModalAction = 'approve';
    this.commentModalVisible = true;
    this.cdr.markForCheck();
  }

  onDecisionModalCancelled(): void {
    this.commentModalVisible = false;
    this.pendingDecision = null;
    this.cdr.markForCheck();
  }

  async onDecisionModalConfirmed(result: CommentModalResult): Promise<void> {
    const comment = result.comment;
    const decision = this.pendingDecision;
    this.commentModalVisible = false;
    this.pendingDecision = null;
    this.cdr.markForCheck();

    if (decision === 'approve') {
      await this.submitApproval(comment);
    } else if (decision === 'sendback') {
      await this.submitSendBack(comment);
    }
  }

  private async submitSendBack(comment: string): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      // TODO: no confirmed "send back to HR" endpoint yet — reusing
      // approveOffer(approve:false) as a placeholder, following the same
      // best-guess + TODO convention used elsewhere in this app, until
      // backend confirms the real contract for this action.
      const res: any = await this.candidateService.approveOffer({
        applicantId: this.applicantId,
        approve: false,
        comments: comment,
      });
      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message ?? 'Sent back to HR');
        this.onBack();
      } else {
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('Send back to HR failed', err);
      this.notificationService.error('Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  private async submitApproval(comment: string): Promise<void> {
    if (!this.canApprove) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    try {
      let payload: any;

      if (this.currentApproverRole === 'FINANCE_ANALYST') {
        // ── Stage 1 — Finance Analyst: full recommendation breakdown ──
        payload = {
          applicantId: this.applicantId,
          approve: true,
          comments: comment,
          approvalType: 'NEGOTIATION',
          financeRecommendations: this.items
            .filter(i => i.forward && !i.isDate)
            .map(i => ({ fieldName: i.label, amount: Number(i.yourDecision) || 0 })),
          financeReason: comment,
        };
      } else if (this.currentApproverRole === 'FINANCE_HEAD') {
        // ── Stage 2 — Finance Head: lean sign-off, no recommendation breakdown ──
        payload = {
          applicantId: this.applicantId,
          approve: true,
          comments: comment,
          approvalType: 'NEGOTIATION',
        };
      } else {
        // ── Stage 3 — HR Head: gated on priorStagesApproved + isOfferLetterRegenerated
        // (already enforced by the canApprove getter above) ──
        payload = {
          applicantId: this.applicantId,
          approve: true,
          comments: comment,
          approvalType: 'NEGOTIATION',
          decisions: this.items
            .filter(i => i.forward)
            .map(i => ({ key: i.key, value: i.yourDecision })),
        };
      }

      // All three stages hit the same endpoint via candidateService.
      const res: any = await this.candidateService.approveOffer(payload);
      const responsecode = res?.responsecode;
      const message = res?.message;
      const errors = res?.errors;

      if (responsecode === '00') {
        this.notificationService.success(message ?? 'Approved and forwarded');
        this.onBack();
      } else {
        this.notificationService.error(errors?.[0] ?? message ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('Approve negotiation failed', err);
      this.notificationService.error('Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }
}