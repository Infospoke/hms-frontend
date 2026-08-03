import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApprovalPipelineComponent } from '../../../approvals/components/approval-pipeline/approval-pipeline.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';

import { ApprovalStage } from '../../../../shared/constants/approval.stage.modal';
import { ApprovedBudgetInfo, NEGOTIATION_APPROVAL_STAGE_ORDER, NegotiationComparisonItem } from '../../../../shared/constants/offer.model';

interface NegotiationApprovalDocument {
  name: string;
  kind: 'pdf' | 'img' | 'file';
  url: string;
}

@Component({
  selector: 'app-negotiation-approval-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, ApprovalPipelineComponent],
  templateUrl: './negotiation-approval-review.component.html',
  styleUrl: './negotiation-approval-review.component.scss',
})
export class NegotiationApprovalReviewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private candidateService = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);

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
  recruiterName = '';

  // ── Approval pipeline — Department head -> Finance team -> HR manager ->
  // Final approval. This is the approver-facing chain, distinct from the
  // 3-level chain HR forwards through on the review-negotiation-request
  // page (see NEGOTIATION_APPROVAL_STAGE_ORDER vs OFFER_STAGE_ORDER).
  // TODO: pipeline stage statuses are DUMMY data below — no confirmed
  // backend endpoint yet for the approver-side chain. Wire this to the
  // real API (single-endpoint pattern, matching getNegotiationDetails)
  // once the contract is available.
  pipelineStages: ApprovalStage[] = [];

  // ── "View approved budget & compensation" popup ─────────────────────────
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
  /** Roughly where the ask sits inside the market band, for the "~55th
   * percentile" note under the range chart. */
  get marketPercentile(): number {
    if (this.marketMax <= this.marketMin) return 0;
    return Math.round(((this.askedCtc - this.marketMin) / (this.marketMax - this.marketMin)) * 100);
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
   * chips would visually collide — the template stacks ASKED above OFFER
   * in that case so both stay readable. */
  get markersOverlap(): boolean {
    return this.hasOfferBaseline && this.askedCtc > 0
      && Math.abs(this.offerPosition - this.askedPosition) < 10;
  }

  // ── Candidate's reason for negotiation + comparison table ───────────────
  items: NegotiationComparisonItem[] = [];
  /** Candidate's stated reason, shown once under the single comparison
   * item on this screen (the review-negotiation-request page shows one
   * per item; here there's a single combined package line). */
  itemReason = '';

  // ── HR recommendation — read-only display on this approver screen (HR
  // already made their recommendation on the review-negotiation-request
  // page; the approver just sees it here). ──
  hrRecommendedPackage = 0;
  hrRecommendationNote = '';

  documents: NegotiationApprovalDocument[] = [];

  reasonForSendingBack = '';

  get canApprove(): boolean {
    return !this.isSubmitting && this.items.length > 0 && this.items.every(i => i.yourDecision > 0);
  }

  ngOnInit(): void {
    this.applicantId = this.route.snapshot.paramMap.get('id');
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {
      // TODO: this whole screen is built against a DUMMY fixture — no
      // confirmed backend endpoint yet for the approver-side negotiation
      // decision view. Swap applyDummyData() for a real single-endpoint
      // call (matching the getNegotiationDetails pattern used on the
      // review-negotiation-request page) once the contract is available.
      this.applyDummyData();
    } catch (err) {
      console.error('Failed to load negotiation approval', err);
      this.notificationService.error('Failed to load the negotiation approval. Please try again.');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private applyDummyData(): void {
    this.candidate = {
      name: 'Sanjay Rao',
      initials: this.getInitials('Sanjay Rao'),
      avatarColor: '#7C3AED',
      role: 'Senior tester',
      department: 'Quality assurance',
      email: 'sanjay.rao@infospoke.in',
      requestedOn: '03 Jul 2026 · 10:20 AM',
      currentCtc: 1200000,
    };
    this.jobTitle = 'Senior tester';
    this.recruiterName = 'Arun Kumar';

    this.pipelineStages = NEGOTIATION_APPROVAL_STAGE_ORDER.map((role, i): ApprovalStage => {
      let status: ApprovalStage['status'] = 'PENDING';
      if (i === 0 || i === 1) status = 'APPROVED';
      else if (i === 2) status = 'IN_PROGRESS';
      return {
        id: i + 1,
        role,
        approverName: '',
        approverInitials: this.getInitials(role),
        status,
      };
    });

    this.budget = {
      compensationBandMin: 996000,
      compensationBandMax: 1368000,
      departmentBudgetAnnual: 5040000,
      allocatedThisQuarter: 3427200,
      remainingBudget: 1612800,
      note: `Figures are indicative for this prototype and pull from the department's approved annual plan.`,
    };

    this.marketMin = 996000;
    this.marketMax = 1368000;
    this.offeredCtc = 1200000;
    this.askedCtc = 1200000;

    this.items = [{
      key: 'basic-pay',
      label: 'Basic Pay (Total Compensation)',
      initialOffer: 1200000,
      candidateAsked: 1200000,
      hrRecommends: 1200000,
      yourDecision: 1200000,
      decisionStatus: 'Accepted',
    }];

    this.hrRecommendedPackage = 1200000;
    this.hrRecommendationNote = 'Sanjay’s fintech QA leadership experience justifies the revision, and it keeps us competitive for this role. Recommending approval.';
    this.itemReason = '6 years testing experience, including 2 years leading QA for a fintech product.';

    this.documents = [];
  }

  // ── Table interactions ──────────────────────────────────────────────────
  onDecisionChange(item: NegotiationComparisonItem, raw: string): void {
    const n = Number(String(raw).replace(/[^\d.-]/g, ''));
    item.yourDecision = isNaN(n) ? 0 : n;
    item.decisionStatus = item.yourDecision === item.hrRecommends ? 'Accepted' : 'Modified';
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

  formatCurrency(n: number | null): string {
    if (n == null) return '';
    return '₹' + Math.round(n).toLocaleString('en-IN');
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
        decisions: this.items.map(i => ({ key: i.key, value: i.yourDecision })),
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
