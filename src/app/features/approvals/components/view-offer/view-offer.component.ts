import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { HeadingComponent } from '../../../../shared/components/heading/heading.component';

import { NotificationService } from '../../../../core/services/notification.service';

import { ApprovalPipelineComponent } from '../approval-pipeline/approval-pipeline.component';
import { ApprovalTimelineComponent } from '../approval-timeline/approval-timeline.component';
import { ApprovalService } from '../../services/approval-service';

import { ApplicantInfo, CompBreakdownItem, CompensationVsMarket, OFFER_CREATOR_ROLE, OFFER_STAGE_ORDER, OFFER_STATUS_CONFIG, OfferBasicInfo, OfferPageMode, OfferStatus, OfferStatusDef } from '../../../../shared/constants/offer.model';
import { ApprovalStage } from '../../../../shared/constants/approval.stage.modal';
import { CandidateServiceComponent } from '../../../candidate-management/serviecs/candidate-service.component';
// NOTE: confirm this import path matches where common-modal.component.ts actually lives in your repo.
import { CommonModalComponent, CommentModalAction, CommentModalResult } from '../../../../shared/components/common-modal/common-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { JobService } from '../../../job/services/job.service';

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

// POST {PYTHON_APPROVE_OFFER_API_URL} — multipart/form-data
// Fields sent: application_id, approve, comments, signature (file),
// signature_type, candidate_id, offer_id.
// Returns the generated offer-letter PDF path (and the PDF itself, base64)
// so the caller can forward the path on to the Java approve-offer API.
interface PythonApproveOfferResponse {
  status: string;
  path: string;
  pdf?: string;
}

// GET applicant details by id — powers the "View Applicant Details" popup.
interface ApplicantDetailsApiData {
  id: number;
  jobId: number;
  jobCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phNo: string;
  Resume: string;
  coverLetterDescription: string;
  privacyPolicy: boolean;
  contactFutureOpportunities: boolean;
  CreatedDate: string;
  jobTitle: string;
  totalApplicants: number;
  currentStage: string;
  planName: string;
  location: string;
  minExperience: number;
  maxExperience: number;
  department: string;
  interviewDate?: string;
  startTime?: string;
  endTime?: string;
  currentStageType?: number;
  noOfStages?: number;
  completedStages?: number;
  completedStageDetails?: unknown[];
}

interface ApplicantDetailsApiResponse {
  data: ApplicantDetailsApiData;
  message: string;
  responsecode: string;
}


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

  private jobService=inject(JobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private offerSvc = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);
  private candidateService=inject(CandidateServiceComponent);
  private approvalService=inject(ApprovalService);
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
  
  signatureType = '';

  
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

    this.isSubmitting = true;
    this.cdr.markForCheck();

    try {
      
      const pyRes = await this.runPythonESignatureApproval(approved);

   
      await this.submitDecision(approved, {
        eSignature: pyRes.status,
        offerLetterPath: pyRes.path,
      });
    } catch (err) {
      console.error('E-signature approval failed', err);
      this.notificationService.error('Failed to process e-signature approval. Please try again.');
    } finally {
      this.eSignatureModalVisible = false;
      this.eSignatureModalAction = null;
      this.confirmationChecked = false;
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Uploads the e-signature + comments to the Python offer-approval service.
   * Expected multipart/form-data fields: application_id, approve, comments,
   * signature (file), signature_type, candidate_id, offer_id.
   */
  private async runPythonESignatureApproval(approved: boolean): Promise<PythonApproveOfferResponse> {
    if (!this.eSignatureFile) {
      throw new Error('No e-signature file selected');
    }

    const formData = new FormData();
   
    formData.append('application_id', String(this.offerId));
    formData.append('approve', String(approved));
    formData.append('comments', this.comment.trim());
    formData.append('signature', this.eSignatureFile, this.eSignatureFile.name);
    formData.append('signature_type', this.signatureType);
    formData.append('candidate_id', String(this.applicantId));
    formData.append('offer_id', String(this.offerId));

   
    const res:any=await this.approvalService.approvePythonApi(formData);

    if (!res?.path) {
      throw new Error(res?.status ?? 'Python approval service did not return an offer letter path');
    }
    return res;
  }

 
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

  // ── Applicant details popup ─────────────────────────────────────────────
  applicantDetailsModalVisible = false;
  applicantDetailsLoading = false;
  applicantDetails: ApplicantDetailsApiData | null = null;
  offerIdForViewOffer:any;
  constructor(private sanitizer: DomSanitizer){}
  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const state = history.state ?? {};
    // Prefer whatever was passed via router state; fall back to the route param.
    this.offerId = state.offerId ?? this.route.snapshot.paramMap.get('offerId') ?? '';
    this.url = state.url;
    this.offerIdForViewOffer=this.route.snapshot.paramMap.get('id');
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
        this.offerSvc.getOfferDetails(this.offerId) as Promise<any>,
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

  
  private deriveModeFromOffer(): OfferPageMode {
    return this.overallStatus === 'Approved' ? 'release' : 'approve';
  }

  private mapApiResponse(data: any, comments: OfferCommentApiItem[]): void {
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
      
      payFrequency: '',
      offerValidTill: '',
      recruiter: data.recruiter,
      // TODO: no hiringManager field on this endpoint yet.
      hiringManager: '—',
    };

    this.totalCtcLabel = this.formatCurrency(data.totalCtc ?? data.offeredCtc);

    const parts = [
      { label: 'Basic Salary',    value: data.basicSalary,          color: '#2563eb' },
      { label: 'Signing Bonus',   value: data.signingBonus,         color: '#16a34a' },
      { label: 'RSU (Per Annum)', value: data.equity,   color: '#7c3aed' },
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

    // A row exists for every stage in the pipeline from the moment the
    // offer is created — including ones nobody has acted on yet, which
    // come back as { role, approved: false, approverName: null,
    // approvedOn: null, comments: null }. Filtering on `role` alone was
    // treating those untouched rows as "actioned" and their default
    // `approved: false` was then read as an explicit rejection, so every
    // stage showed as Rejected before anything had actually happened.
    // Only count a row as actioned once it has real decision evidence.
    const actioned = (comments ?? []).filter(
      c => !!c.role && (c.approverName != null || c.approvedOn != null)
    );

    let foundInProgress = false;
    let foundRejected = false;

    return OFFER_STAGE_ORDER.map((role, i): ApprovalStage => {
      // HR is the creator of the request, not an approver — it's always
      // shown as CREATED rather than matched against approval comments.
      if (role === OFFER_CREATOR_ROLE) {
        return {
          id: i + 1,
          role,
          approverName: '',
          approverInitials: this.getInitials(role),
          status: 'CREATED',
        };
      }

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

  private async submitDecision(
    approved: boolean,
    extra?: { eSignature?: string; offerLetterPath?: string }
  ): Promise<void> {
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      const res: any = await this.offerSvc.approveOffer({
        applicantId: this.offerId,
        approve: approved,
        comments: this.comment.trim(),
        // Only present for the Finance Head / e-signature flow — populated
        // from the Python approval service's response (status + saved path).
        ...(extra?.eSignature !== undefined ? { eSignature: extra.eSignature } : {}),
        ...(extra?.offerLetterPath !== undefined ? { offerLetterPath: extra.offerLetterPath } : {}),
      });

      if (res?.responsecode === '00') {
        const alreadyCompleted = /already completed/i.test(res?.message ?? '');
        this.notificationService.success(res?.message ?? (approved ? 'Offer approved' : 'Offer rejected'));
        if (alreadyCompleted) {
         
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
      const res: any = await this.candidateService.viewOfferLetter(this.offerIdForViewOffer);
      const blob: Blob = res instanceof Blob ? res : new Blob([res], { type: 'application/pdf' });

    
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

  async viewApplicantDetails(): Promise<void> {
    this.applicantDetailsModalVisible = true;
    this.applicantDetailsLoading = true;
    this.applicantDetails = null;
    this.cdr.markForCheck();

    try {
      const res: ApplicantDetailsApiResponse = await this.jobService.getApplicantDetailsById(this.applicantId);
      if (res?.responsecode === '00') {
        this.applicantDetails = res.data;
      } else {
        this.notificationService.error(res?.message || 'Failed to fetch applicant details');
        this.applicantDetailsModalVisible = false;
      }
    } catch (err) {
      console.error('Failed to fetch applicant details', err);
      this.notificationService.error('Failed to fetch applicant details. Please try again.');
      this.applicantDetailsModalVisible = false;
    } finally {
      this.applicantDetailsLoading = false;
      this.cdr.markForCheck();
    }
  }

  closeApplicantDetailsModal(): void {
    this.applicantDetailsModalVisible = false;
    this.applicantDetails = null;
    this.cdr.markForCheck();
  }

  /** "Anusha" + "Putike" -> "Anusha Putike" (falls back gracefully if either half is missing). */
  get applicantDetailsFullName(): string {
    if (!this.applicantDetails) return '';
    return [this.applicantDetails.firstName, this.applicantDetails.lastName].filter(Boolean).join(' ');
  }

  get applicantDetailsInitials(): string {
    return this.getInitials(this.applicantDetailsFullName);
  }

  get applicantDetailsExperience(): string {
    const d = this.applicantDetails;
    if (!d) return '';
    if (d.minExperience == null && d.maxExperience == null) return '—';
    return `${d.minExperience ?? 0} - ${d.maxExperience ?? 0} yrs`;
  }

  get applicantDetailsInterview(): string {
    const d = this.applicantDetails;
    if (!d?.interviewDate) return '—';
    const date = this.formatDate(d.interviewDate);
    if (d.startTime && d.endTime) {
      return `${date}, ${this.formatTimeRange(d.startTime, d.endTime)}`;
    }
    return date;
  }

  /** "10:00:00" / "11:00:00" -> "10:00 AM - 11:00 AM" */
  private formatTimeRange(start: string, end: string): string {
    const toDisplay = (t: string): string => {
      const [h, m] = t.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    try {
      return `${toDisplay(start)} - ${toDisplay(end)}`;
    } catch {
      return `${start} - ${end}`;
    }
  }

  goBack(): void {
    this.router.navigateByUrl(this.url ?? '/offer-management/in-progress', {
      state: { activeType: this.activeType }
    });
  }
}