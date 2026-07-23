import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { HeadingComponent } from '../../../../shared/components/heading/heading.component';

import { NotificationService } from '../../../../core/services/notification.service';

import { ApprovalPipelineComponent } from '../approval-pipeline/approval-pipeline.component';
import { ApprovalTimelineComponent } from '../approval-timeline/approval-timeline.component';
import { ApprovalService } from '../../services/approval-service';

import { ApplicantInfo, CompBreakdownItem, CompensationVsMarket, OFFER_STATUS_CONFIG, OfferBasicInfo, OfferPageMode, OfferStatus, OfferStatusDef } from '../../../../shared/constants/offer.model';
import { ApprovalStage } from '../../../../shared/constants/approval.stage.modal';
import { CandidateServiceComponent } from '../../../candidate-management/serviecs/candidate-service.component';
// NOTE: confirm this import path matches where common-modal.component.ts actually lives in your repo.
import { CommonModalComponent, CommentModalAction, CommentModalResult } from '../../../../shared/components/common-modal/common-modal.component';
import { DomSanitizer } from '@angular/platform-browser';

// ─── API response shapes ───────────────────────────────────────────────────
// GET /hms/offer-details/get-offer-details-by-applicant-id/{applicantId}
interface OfferDetailsApiResponse {
  data: {
    applicantId: number;
    candidateName: string;
    email: string;
    jobTitle: string;
    department: string;
    recruiter: string;
    employmentType: string;
    workLocation: string;
    requestedOn: string;

    basicSalary: number;
    signingBonus: number;
    annualRsuEsopValue: number;
    otherBenefits: number;
    totalCtc: number;
    offeredCtc: number;
    minSalary: number;
    maxSalary: number;

    noticePeriod: string;
    probationPeriod: string;
  };
  message: string;
  responsecode: string;
}

// GET /hms/offer-details/get-offer-comments/{applicantId}
// NOTE: the API pads this array with placeholder rows for stages that
// haven't been reached yet — those rows have role/approvedOn/comments all
// null and approved: false, which does NOT mean "rejected". Only rows with
// a real (non-null) role represent an actual actioned stage.
interface OfferCommentApiItem {
  role: string | null;
  approverName: string | null;
  approverSequence: string | null;
  approved: boolean;
  approvedOn: string | null;
  comments: string | null;
}

interface OfferCommentsApiResponse {
  data: OfferCommentApiItem[];
  message: string;
  responsecode: string;
}


const OFFER_STAGE_ORDER = ['Financial Analyst', 'Finance Head', 'HR Head'];


@Component({
  selector: 'app-view-offer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    HeadingComponent,
    ApprovalPipelineComponent,
    ApprovalTimelineComponent,
    NzModalModule,
    CommonModalComponent,
  ],
  templateUrl: './view-offer.component.html',
  styleUrl: './view-offer.component.scss',
})
export class ViewOfferComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private offerSvc = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);
  private candidateService=inject(CandidateServiceComponent);
  isLoading = true;
  isSubmitting = false;
  applicantId:any;
  /** Doubles as the applicantId used in the offer-details / offer-comments API calls. */
  offerId = '';
  url: any;
  /** Which stage tab on the list page to re-activate when navigating back (e.g. 'rol'). */
  activeType: any;

  pageMode: OfferPageMode = 'view';
  get isApproveMode(): boolean { return this.pageMode === 'approve'; }
  get isReleaseMode(): boolean { return this.pageMode === 'release'; }
  get isViewMode(): boolean { return this.pageMode === 'view'; }

  /**
   * Passed in via router state from the list page (only true when the
   * navigating user's role is 'Finance Head'). Only Finance Head gets the
   * e-signature + comments card — everyone else in approve mode goes
   * straight to Approve/Reject with no upload requirement.
   */
  isUpload = false;

  // ── Header ───────────────────────────────────────────────────────────────
  applicant: ApplicantInfo = {
    name: '', initials: '', avatarColor: '#6366f1',
    role: '', department: '', email: '', requestedOn: '',
  };
  overallStatus: OfferStatus = 'Pending';
  readonly offerStatusCfg = OFFER_STATUS_CONFIG;
  get currentOfferStatus(): OfferStatusDef {
    return this.offerStatusCfg[this.overallStatus] ?? this.offerStatusCfg['Pending'];
  }

  // ── Basic information panel ─────────────────────────────────────────────
  basicInfo: OfferBasicInfo | null = null;

  // ── Pie chart overview ──────────────────────────────────────────────────
  compBreakdown: CompBreakdownItem[] = [];
  totalCtcLabel = '';

  /** conic-gradient string built from compBreakdown, consumed by the donut in the template */
  get pieGradient(): string {
    let cursor = 0;
    const stops = this.compBreakdown.map(item => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  compVsMarket: CompensationVsMarket = { marketMin: 0, offeredCtc: 0, marketMax: 0 };
  get marketDotPosition(): number {
    const { marketMin, offeredCtc, marketMax } = this.compVsMarket;
    if (marketMax <= marketMin) return 50;
    const pct = ((offeredCtc - marketMin) / (marketMax - marketMin)) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  // ── Approval pipeline / timeline ────────────────────────────────────────
  pipelineStages: ApprovalStage[] = [];
  get timelineStages(): ApprovalStage[] { return this.pipelineStages; }

  // ── Approve-mode inputs (e-signature + comment) ─────────────────────────
  eSignatureFile: File | null = null;
  eSignaturePreviewUrl: string | null = null;
  comment = '';
  readonly COMMENT_MAX = 500;

  // TODO: the approve-offer payload only accepts { applicantId, approve, comments } —
  // there's no field for the e-signature file. Still gating on it client-side since
  // the UI asks for it, but it isn't actually sent anywhere yet. If there's a
  // separate signature-upload endpoint, wire it into submitDecision() alongside
  // the approveOffer() call; otherwise consider dropping the requirement.
  //
  // Only Finance Head (isUpload) is required to attach a signature + comment
  // before deciding. That's now collected via the e-signature popup (opened
  // from the Approve/Reject Offer buttons) rather than inline on the page —
  // this getter gates the popup's own submit button, not the page buttons.
  /** Gates the e-signature popup's submit button — user must tick this
   *  before the Approve/Reject decision can go through. */
  confirmationChecked = false;

  get canSubmitDecision(): boolean {
    if (this.isSubmitting) return false;
    if (this.isUpload) {
      return !!this.eSignatureFile && this.comment.trim().length > 0 && this.confirmationChecked;
    }
    return true;
  }

  onESignatureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.eSignatureFile = file;
    this.eSignaturePreviewUrl = URL.createObjectURL(file);
    this.cdr.markForCheck();
  }

  removeESignature(): void {
    this.eSignatureFile = null;
    if (this.eSignaturePreviewUrl) URL.revokeObjectURL(this.eSignaturePreviewUrl);
    this.eSignaturePreviewUrl = null;
    this.cdr.markForCheck();
  }

  // ── E-signature + comments popup (Finance Head only) ────────────────────
  // Opened from the Approve/Reject Offer buttons instead of showing the
  // upload card inline on the page.
  eSignatureModalVisible = false;
  eSignatureModalAction: 'approve' | 'reject' | null = null;

  private openESignatureModal(action: 'approve' | 'reject'): void {
    this.eSignatureModalAction = action;
    this.eSignatureModalVisible = true;
    this.confirmationChecked = false;
    this.cdr.markForCheck();
  }

  closeESignatureModal(): void {
    if (this.isSubmitting) return;
    this.eSignatureModalVisible = false;
    this.eSignatureModalAction = null;
    this.confirmationChecked = false;
    this.cdr.markForCheck();
  }

  async submitESignatureDecision(): Promise<void> {
    if (!this.canSubmitDecision || !this.eSignatureModalAction) return;
    const approved = this.eSignatureModalAction === 'approve';
    await this.submitDecision(approved);
    this.eSignatureModalVisible = false;
    this.eSignatureModalAction = null;
    this.confirmationChecked = false;
    this.cdr.markForCheck();
  }

  // ── Approve/Reject comment modal (app-common-modal) ─────────────────────
  // Used for everyone EXCEPT Finance Head — Finance Head already supplies a
  // comment (+ signature) inline via the upload card, so their Approve/Reject
  // click submits straight away without asking again.
  commentModalVisible = false;
  commentModalAction: CommentModalAction | null = null;

  private openDecisionModal(action: CommentModalAction): void {
    this.commentModalAction = action;
    this.commentModalVisible = true;
    this.cdr.markForCheck();
  }

  onDecisionModalCancelled(): void {
    this.commentModalVisible = false;
    this.commentModalAction = null;
    this.cdr.markForCheck();
  }

  onDecisionModalConfirmed(result: CommentModalResult): void {
    this.comment = result.comment;
    const approved = result.action === 'approve';
    this.submitDecision(approved).finally(() => {
      this.commentModalVisible = false;
      this.commentModalAction = null;
      this.cdr.markForCheck();
    });
  }
  pdfUrl: any;
  isPdfVisible: boolean = false;
  private pdfObjectUrl: string | null = null;
  constructor(private sanitizer: DomSanitizer){}
  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const state = history.state ?? {};
    // Prefer whatever was passed via router state; fall back to the route param.
    this.offerId = state.offerId ?? this.route.snapshot.paramMap.get('offerId') ?? '';
    this.url = state.url;
    this.activeType = state.activeType;
    // True only when the navigating user's role is 'Finance Head' (set by the caller).
    this.isUpload = !!state.isUpload;
    // Preferred: caller tells us the mode. Fall back to deriving it once data loads.
    this.pageMode = state.mode ?? 'approve';
    this.loadOfferDetails(!state.mode);
  }

  private async loadOfferDetails(deriveMode: boolean): Promise<void> {
    try {
      const [detailsRes, commentsRes] = await Promise.all([
        this.offerSvc.getOfferDetails(this.offerId) as Promise<OfferDetailsApiResponse>,
        this.offerSvc.getCommentsForOfferId(this.offerId) as Promise<OfferCommentsApiResponse>,
      ]);

      if (detailsRes?.responsecode !== '00') {
        this.notificationService.error(detailsRes?.message || 'Failed to fetch offer details');
        return;
      }

      // The comments call failing shouldn't block the rest of the page —
      // just fall back to an empty chain (every stage renders as PENDING/IN_PROGRESS).
      const comments = commentsRes?.responsecode === '00' ? commentsRes.data : [];
      if (commentsRes?.responsecode !== '00') {
        console.error('Failed to fetch offer comments:', commentsRes?.message);
      }

      this.mapApiResponse(detailsRes.data, comments);
      if (deriveMode) this.pageMode = this.deriveModeFromOffer();
    } catch (err) {
      console.error('Failed to load offer details', err);
      this.notificationService.error('Failed to load offer details');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Only used when no explicit mode was passed in (deep link / refresh).
   * NOTE: this API doesn't return a "released" flag, so there's currently no
   * way to distinguish an already-released offer from an approved-but-not-yet
   * -released one purely from this response — defaulting to 'release' once
   * every stage is approved. Swap in the real flag once it's available.
   */
  private deriveModeFromOffer(): OfferPageMode {
    return this.overallStatus === 'Approved' ? 'release' : 'approve';
  }

  private mapApiResponse(data: OfferDetailsApiResponse['data'], comments: OfferCommentApiItem[]): void {
  this.applicantId=data?.applicantId;
    this.applicant = {
      name: data.candidateName,
      initials: this.getInitials(data.candidateName),
      avatarColor: '#6366f1',
      role: data.jobTitle,
      department: data.department,
      email: data.email,
      requestedOn: this.formatDate(data.requestedOn),
    };

    this.basicInfo = {
      jobTitle: data.jobTitle,
      department: data.department,
      offeredCtc: this.formatCurrency(data.offeredCtc) + ' / Annum',
      probationPeriod: data.probationPeriod,
      noticePeriod: data.noticePeriod,
      workLocation: data.workLocation,
      employmentType: data.employmentType,
      // TODO: not returned by this API yet.
      payFrequency: '',
      offerValidTill: '',
      recruiter: data.recruiter,
      // TODO: no hiringManager field on this endpoint yet.
      hiringManager: '—',
    };

    // The API's totalCtc is the authoritative number for the donut's center
    // label. It isn't guaranteed to equal the sum of the 4 components below
    // (e.g. here basicSalary alone already equals totalCtc/offeredCtc), so
    // don't recompute it — but DO use the summed components as the pie's own
    // denominator, so the 4 slices always add up to 100% of each other.
    this.totalCtcLabel = this.formatCurrency(data.totalCtc ?? data.offeredCtc);

    const parts = [
      { label: 'Basic Salary',    value: data.basicSalary,          color: '#2563eb' },
      { label: 'Signing Bonus',   value: data.signingBonus,         color: '#16a34a' },
      { label: 'RSU (Per Annum)', value: data.annualRsuEsopValue,   color: '#7c3aed' },
      { label: 'Other Benefits', value: data.otherBenefits,         color: '#f97316' },
    ];
    const partsTotal = parts.reduce((sum, p) => sum + (p.value || 0), 0);
    this.compBreakdown = parts.map(p => ({
      label: p.label,
      color: p.color,
      percent: partsTotal > 0 ? Math.round((p.value / partsTotal) * 1000) / 10 : 0,
    }));

    this.compVsMarket = {
      marketMin: data.minSalary,
      offeredCtc: data.offeredCtc,
      marketMax: data.maxSalary,
    };

    this.pipelineStages = this.buildPipelineStages(comments);
    this.overallStatus = this.deriveOverallStatus(this.pipelineStages);
  }

  // ── Pipeline construction ───────────────────────────────────────────────
  private buildPipelineStages(comments: OfferCommentApiItem[]): ApprovalStage[] {
    // Only rows with a real role represent an actual actioned stage — rows
    // the API pads on with role/approvedOn/comments all null (and
    // approved: false) are placeholders for stages not yet reached, not
    // rejections, so they're dropped before matching against the fixed order.
    const actioned = (comments ?? []).filter(c => !!c.role);

    let foundInProgress = false;
    let foundRejected = false;

    return OFFER_STAGE_ORDER.map((role, i): ApprovalStage => {
      const entry = actioned.find(c => c.role?.trim().toLowerCase() === role.toLowerCase());

      let status: ApprovalStage['status'];
      if (entry) {
        status = entry.approved === false ? 'REJECTED' : 'APPROVED';
        if (status === 'REJECTED') foundRejected = true;
      } else if (foundRejected) {
        status = 'PENDING';
      } else if (!foundInProgress) {
        status = 'IN_PROGRESS';
        foundInProgress = true;
      } else {
        status = 'PENDING';
      }

      return {
        id: i + 1,
        role,
        approverName: entry?.approverName ?? '',
        approverInitials: this.getInitials(entry?.approverName ?? ''),
        status,
        timestamp: entry?.approvedOn ? this.formatDateTime(entry.approvedOn) : undefined,
        comments: entry?.comments ?? '',
        prevRejected: status === 'PENDING' && foundRejected,
      };
    });
  }

  private deriveOverallStatus(stages: ApprovalStage[]): OfferStatus {
    if (stages.some(s => s.status === 'REJECTED')) return 'Rejected';
    if (stages.every(s => s.status === 'APPROVED')) return 'Approved';
    return 'Pending';
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  private formatCurrency(value: number): string {
    if (value == null) return '';
    return '₹ ' + Math.round(value).toLocaleString('en-IN');
  }

  /** "2026-07-10" -> "10 Jul 2026" (date-only, no time component in this API). */
  private formatDate(iso: string | null): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
  }

  private formatDateTime(iso: string | null): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${datePart}, ${timePart}`;
    } catch { return iso; }
  }

 
  confirmApprove(): void {
    if (this.isSubmitting) return;
    if (this.isUpload) {
      // Finance Head: collect signature + comment via the popup first.
      this.openESignatureModal('approve');
    } else {
      this.openDecisionModal('approve');
    }
  }

  confirmReject(): void {
    if (this.isSubmitting) return;
    if (this.isUpload) {
      this.openESignatureModal('reject');
    } else {
      this.openDecisionModal('reject');
    }
  }

  async onApprove(): Promise<void> {
    if (!this.canSubmitDecision) return;
    await this.submitDecision(true);
  }

  async onReject(): Promise<void> {
    if (!this.canSubmitDecision) return;
    await this.submitDecision(false);
  }

  private async submitDecision(approved: boolean): Promise<void> {
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      const res: any = await this.offerSvc.approveOffer({
        applicantId: this.offerId,
        approve: approved,
        comments: this.comment.trim(),
      });

      if (res?.responsecode === '00') {
        const alreadyCompleted = /already completed/i.test(res?.message ?? '');
        this.notificationService.success(res?.message ?? (approved ? 'Offer approved' : 'Offer rejected'));
        if (alreadyCompleted) {
          // Nothing left for this user to action — refresh in place instead
          // of navigating away, so the pipeline reflects the real current state.
          await this.loadOfferDetails(false);
        } else {
          this.goBack();
        }
      } else {
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('Offer decision failed', err);
      this.notificationService.error('Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  async onReleaseOfferLetter(): Promise<void> {
    // if (this.isSubmitting) return;
    // this.isSubmitting = true;
    // this.cdr.markForCheck();
    // try {
    //   const res: any = await firstValueFrom(this.offerSvc.releaseOfferLetter(this.offerId));
    //   if (res?.responsecode === '00') {
    //     this.notificationService.success(res?.message ?? 'Offer letter released');
    //     this.goBack();
    //   } else {
    //     this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
    //   }
    // } catch (err) {
    //   console.error('Release offer letter failed', err);
    //   this.notificationService.error('Something went wrong. Please try again.');
    // } finally {
    //   this.isSubmitting = false;
    //   this.cdr.markForCheck();
    // }
  }

  async viewOfferLetter() {
    try {
      const res: any = await this.candidateService.viewOfferLetter(this.offerId);
      const blob: Blob = res instanceof Blob ? res : new Blob([res], { type: 'application/pdf' });

      // If the backend returned an error (auth failure, 404, 500, or a JSON
      // error body sent with a 200), `responseType: 'blob'` will still
      // "succeed" — you just get a blob whose content isn't actually a PDF.
      // Surface that instead of silently showing a blank/broken iframe.
      if (blob.type && !blob.type.includes('pdf')) {
        const text = await blob.text();
        console.error('Offer letter endpoint did not return a PDF. Response:', text);
        this.notificationService.error('Could not load the offer letter. Please try again.');
        return;
      }

      if (this.pdfObjectUrl) {
        window.URL.revokeObjectURL(this.pdfObjectUrl);
      }

      this.pdfObjectUrl = window.URL.createObjectURL(blob);
      const safeUrl = this.pdfObjectUrl + '#toolbar=0&navpanes=0&scrollbar=0';
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
      this.isPdfVisible = true;
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to load offer letter PDF', err);
      this.notificationService.error('Failed to load offer letter. Please try again.');
    }
  }

  closePdfPreview(): void {
    this.isPdfVisible = false;
    if (this.pdfObjectUrl) {
      window.URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
    this.pdfUrl = null;
  }

  viewApplicantDetails(): void {
    // TODO: wire to your real applicant-details view (modal / route)
  }

  goBack(): void {
    this.router.navigateByUrl(this.url ?? '/offer-management/in-progress', {
      state: { activeType: this.activeType }
    });
  }
}