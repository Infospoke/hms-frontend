import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ApprovalPipelineComponent } from '../../../approvals/components/approval-pipeline/approval-pipeline.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';

import { ApprovalStage } from '../../../../shared/constants/approval.stage.modal';
import { ApprovedBudgetInfo, NEGOTIATION_APPROVAL_STAGE_ORDER, NegotiationComparisonItem, NegotiationDocument, OFFER_STAGE_ORDER } from '../../../../shared/constants/offer.model';

interface NegotiationApprovalApiResponse {
  data: {
    annualHiringCost: number | null;
    applicantId: number;
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
  imports: [CommonModule, FormsModule, ApprovalPipelineComponent],
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

  isLoading = true;
  isSubmitting = false;
  private applicantId: any;

  statusBadge = 'Awaiting hr manager';

  // ── Header ───────────────────────────────────────────────────────────────
  candidate = {
    name: '', initials: '', avatarColor: '#7C3AED',
    role: '', department: '', email: '',
    requestedOn: '', currentCtc: 0,
  };

  jobTitle = '';
  // TODO: recruiter isn't part of the negotiation-details response —
  // wire this up once a field/endpoint for it is confirmed.
  recruiterName = '';

  
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

  get canApprove(): boolean {
    return !this.isSubmitting
      && this.items.some(i => i.forward && !i.isDate && Number(i.yourDecision) > 0);
  }

  // ── Supporting document preview modal ───────────────────────────────────
  isDocModalOpen = false;
  isDocModalLoading = false;
  docModalError = '';
  docModalTitle = '';
  docModalUrl: SafeResourceUrl | null = null;
  private docModalObjectUrl: string | null = null;

  ngOnInit(): void {
    this.applicantId = this.route.snapshot.paramMap.get('id');
    this.loadAll();
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
    };
    this.jobTitle = (data.jobTitle ?? '').trim();

    
    this.pipelineStages = OFFER_STAGE_ORDER.map((role, i): ApprovalStage => {
      let status: ApprovalStage['status'] = 'PENDING';
      if (i === 0) status = 'CREATED';
      else if (i === 2) status = 'IN_PROGRESS';
      return {
        id: i + 1,
        role,
        approverName: '',
        approverInitials: this.getInitials(role),
        status,
      };
    });

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
    this.router.navigateByUrl('/candidate-management/offer-management');
  }

  onViewOfferLetter(): void {
    // TODO: no confirmed applicantId -> offer-letter link on this screen
    // yet — wire to candidateService.viewOfferLetter(id) once available.
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

  async onSendBackToHR(): Promise<void> {
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
        comments: this.reasonForSendingBack?.trim() || 'Sent back to HR for revision',
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

  async onApproveAndContinue(): Promise<void> {
    if (!this.canApprove) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      // TODO: no confirmed "approver decision" endpoint yet — reusing
      // approveOffer(approve:true) as a placeholder until backend confirms
      // the real contract for this action.
      const res: any = await this.candidateService.approveOffer({
        applicantId: this.applicantId,
        approve: true,
        decisions: this.items
          .filter(i => i.forward)
          .map(i => ({ key: i.key, value: i.yourDecision })),
      });
      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message ?? 'Approved and forwarded');
        this.onBack();
      } else {
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
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
