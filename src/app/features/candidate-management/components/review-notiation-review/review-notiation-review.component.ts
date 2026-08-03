import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { ApprovalPipelineComponent } from '../../../approvals/components/approval-pipeline/approval-pipeline.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';

import { ApprovalStage } from '../../../../shared/constants/approval.stage.modal';
import { NegotiationDocument, NegotiationItem, OFFER_APPROVAL_STAGES, OFFER_CREATOR_ROLE, OFFER_STAGE_ORDER } from '../../../../shared/constants/offer.model';


interface NegotiationDetailsApiResponse {
  data: {
    annualHiringCost: number;
    applicantId: number;
    candidateId: string;
    candidateName: string;
    email: string;
    jobId: number;
    jobTitle: string;
    joiningDate: string;
    joiningDateReason: string | null;
    maximumSalary: number;
    minimumSalary: number;
    negotiation: {
      fieldName: string;
      initialAmount: number | null;
      reason: string;
      requestedAmount: number;
    }[];
    negotiationId: number;
    offerReleasedOn: string;
    others: string | null;
    overallJustification: string;
    srId: string;
    supportingDocuments: string[];
    totalRequestedAmount: number;
  };
  message: string;
  responsecode: string;
}

const ITEM_ICONS: Record<string, string> = {
  'basic pay': 'fa-solid fa-credit-card',
  'hra': 'fa-solid fa-house',
  'special allowance': 'fa-solid fa-star',
  'signing bonus': 'fa-solid fa-gift',
  'relocation budget': 'fa-solid fa-key',
};
const DEFAULT_ITEM_ICON = 'fa-solid fa-file-lines';
const TERMS_KEYWORDS = ['period', 'date', 'notice', 'location'];

@Component({
  selector: 'app-review-notiation-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, HeadingComponent, ApprovalPipelineComponent],
  templateUrl: './review-notiation-review.component.html',
  styleUrl: './review-notiation-review.component.scss',
})
export class ReviewNotiationReviewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private candidateService = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);

  heading = 'Review negotiation request';
  subHeading = 'Review everything the candidate asked to revise, then forward your recommendation for approval.';
  statusBadge = 'Awaiting HR review';

  isLoading = true;
  isSubmitting = false;
  private applicantId: any;

  // HR (the creator) is actively reviewing right now — shown as IN_PROGRESS
  // — while the 3 real approver stages haven't started yet.
  pipelineStages: ApprovalStage[] = OFFER_STAGE_ORDER.map((role, i): ApprovalStage => ({
    id: i + 1,
    role,
    approverName: '',
    approverInitials: '',
    status: role === OFFER_CREATOR_ROLE ? 'IN_PROGRESS' : 'PENDING',
  }));

  candidate = {
    name: '', email: '', initials: '', avatarColor: '#7C3AED',
    jobTitle: '', offerReleasedOn: '', requestId: '',
  };

  // ── Requested package vs market range ───────────────────────────────────
  marketMin = 0;
  marketMax = 0;
  offeredCtc = 0;
  askedCtc = 0;


  get hasOfferBaseline(): boolean { return this.offeredCtc > 0; }

  get aboveMarketMax(): boolean { return this.askedCtc > this.marketMax; }
  get deltaAmount(): number { return Math.max(0, this.askedCtc - this.marketMax); }
  get deltaPercent(): number {
    if (!this.marketMax) return 0;
    return Math.round((this.deltaAmount / this.marketMax) * 1000) / 10;
  }

  /** 0-100 position on the track for a rupee value, spanning marketMin (0%)
   * through whichever is larger of marketMax / askedCtc (100%). */
  private trackPosition(value: number): number {
    const upper = Math.max(this.marketMax, this.askedCtc, this.marketMin + 1);
    const range = upper - this.marketMin;
    if (range <= 0) return 0;
    return Math.min(100, Math.max(0, ((value - this.marketMin) / range) * 100));
  }
  get marketMaxPosition(): number { return this.trackPosition(this.marketMax); }
  get offerPosition(): number { return this.trackPosition(this.offeredCtc); }
  get askedPosition(): number { return this.trackPosition(this.askedCtc); }

  /** True when OFFER and ASKED land close enough on the track that their
   * chips would visually collide (e.g. both far below marketMin clamp to
   * ~0%) — the template staggers the ASKED chip above OFFER in that case
   * so both stay readable instead of one covering the other. */
  get markersOverlap(): boolean {
    return this.hasOfferBaseline && this.askedCtc > 0
      && Math.abs(this.offerPosition - this.askedPosition) < 10;
  }

  items: NegotiationItem[] = [];
  get changedItemsCount(): number {
    return this.items.filter(i => i.askedValue !== i.initialValue).length;
  }
  overallJustification = '';

  otherNotes = '';
  documents: NegotiationDocument[] = [];

  // ── HR recommendation form ──────────────────────────────────────────────
  revisedTotalPackage: number | null = null;
  reasonForForwarding = '';
  get nextApprovalStage(): string { return OFFER_APPROVAL_STAGES[0]; }

  get canForward(): boolean {
    return !this.isSubmitting && !!this.revisedTotalPackage && this.reasonForForwarding.trim().length > 0;
  }

  ngOnInit(): void {
    this.applicantId = this.route.snapshot.paramMap.get('id');
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {
      const res: NegotiationDetailsApiResponse = await this.candidateService.getNegotiationDetails(this.applicantId);

      if (res?.responsecode === '00') {
        this.applyNegotiationDetails(res.data);
      } else {
        console.error('Failed to fetch negotiation details:', res?.message);
        this.notificationService.error(res?.message || 'Failed to load the candidate’s negotiation request');
      }
    } catch (err) {
      console.error('Failed to load negotiation request', err);
      this.notificationService.error('Failed to load the negotiation request. Please try again.');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  
  private applyNegotiationDetails(data: NegotiationDetailsApiResponse['data']): void {
    // ── Candidate summary strip ──
    this.candidate.name = data.candidateName;
    this.candidate.email = data.email;
    this.candidate.initials = this.getInitials(data.candidateName);
    this.candidate.jobTitle = (data.jobTitle ?? '').trim();
    this.candidate.offerReleasedOn = this.formatDate(data.offerReleasedOn);
    // No PRR-style request id exists in this API — srId is the closest
    // real identifier the backend gives us.
    this.candidate.requestId = data.srId ?? '';

    
    this.marketMin = data.minimumSalary ?? 0;
    this.marketMax = data.maximumSalary ?? 0;
    this.offeredCtc = data.annualHiringCost ?? 0;
    this.askedCtc = data.totalRequestedAmount ?? 0;


    this.items = (data.negotiation ?? []).map((raw) => this.buildItem(raw));

    if (data.joiningDateReason) {
      this.items.push({
        key: 'joiningDate',
        icon: 'fa-regular fa-calendar',
        label: 'Joining Date',
        category: 'TERMS',
        isDate: true,
        initialValue: null,
        askedValue: data.joiningDate,
        initialDisplay: '—',
        askedDisplay: this.formatDate(data.joiningDate),
        changePercent: 0,
        hasBaseline: false,
        justification: data.joiningDateReason,
        forward: true,
        valueToForward: data.joiningDate,
      });
    }

    this.overallJustification = data.overallJustification ?? '';
    this.otherNotes = data.others ?? '';
    this.revisedTotalPackage = this.askedCtc || null;

    // ── Supporting documents — API gives raw storage paths only, no
    // size/upload-date metadata, so those are left blank rather than
    // fabricated.
    this.documents = (data.supportingDocuments ?? []).map((path) => {
      const name = path.split('/').pop() || path;
      return {
        name,
        sizeLabel: '',
        uploadedOn: '',
        kind: this.inferKind(name),
        // TODO: this is the raw relative path returned by the API
        // ("negotiationdocuments/...") — confirm the file-server base URL
        // to prefix here once it's available; as-is this link may 404.
        url: path,
      };
    });
  }

  private buildItem(raw: NegotiationDetailsApiResponse['data']['negotiation'][number]): NegotiationItem {
    const hasBaseline = raw.initialAmount != null && raw.initialAmount > 0;
    const changePercent = hasBaseline
      ? Math.round(((raw.requestedAmount - raw.initialAmount!) / raw.initialAmount!) * 1000) / 10
      : 0;
    const key = raw.fieldName.trim().toLowerCase().replace(/\s+/g, '-');
    const isTerms = TERMS_KEYWORDS.some(kw => raw.fieldName.toLowerCase().includes(kw));

    return {
      key,
      icon: ITEM_ICONS[raw.fieldName.trim().toLowerCase()] ?? DEFAULT_ITEM_ICON,
      label: raw.fieldName,
      category: isTerms ? 'TERMS' : 'COMPENSATION',
      isDate: false,
      initialValue: raw.initialAmount,
      askedValue: raw.requestedAmount,
      initialDisplay: hasBaseline ? this.formatCurrency(raw.initialAmount!) : '—',
      askedDisplay: this.formatCurrency(raw.requestedAmount),
      changePercent,
      hasBaseline,
      justification: raw.reason ?? '',
      forward: true,
      valueToForward: raw.requestedAmount,
    };
  }

  // ── Table interactions ──────────────────────────────────────────────────
  onValueToForwardChange(item: NegotiationItem, raw: string): void {
    if (item.isDate) {
      item.valueToForward = raw;
    } else {
      const n = Number(String(raw).replace(/[^\d.-]/g, ''));
      item.valueToForward = isNaN(n) ? 0 : n;
    }
  }

  /** Text input bound to revisedTotalPackage shows/accepts the same
   * "₹13,50,000" formatting used everywhere else on this page. */
  onRevisedPackageChange(raw: string): void {
    const n = Number(String(raw).replace(/[^\d.-]/g, ''));
    this.revisedTotalPackage = isNaN(n) || n === 0 ? null : n;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatCurrency(n: number): string {
    if (n == null) return '';
    return '₹' + Math.round(n).toLocaleString('en-IN');
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

  async onReject(): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {

      const res: any = await this.candidateService.approveOffer({
        applicantId: this.applicantId,
        approve: false,
        comments: this.reasonForForwarding?.trim() || 'Negotiation request rejected by HR',
      });
      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message ?? 'Negotiation request rejected');
        this.onBack();
      } else {
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('Reject negotiation request failed', err);
      this.notificationService.error('Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  async onForwardForApproval(): Promise<void> {
    if (!this.canForward) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      
      const res: any = await this.candidateService.approveOffer({
        applicantId: this.applicantId,
        approve: true,
        comments: this.reasonForForwarding.trim(),
        revisedTotalPackage: this.revisedTotalPackage,
        forwardedItems: this.items
          .filter(i => i.forward)
          .map(i => ({ key: i.key, valueToForward: i.valueToForward })),
      });
      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message ?? 'Forwarded for approval');
        this.onBack();
      } else {
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('Forward negotiation request failed', err);
      this.notificationService.error('Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }
}
