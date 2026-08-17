import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import {
  ApprovalPipelineComponent
} from '../../../approvals/components/approval-pipeline/approval-pipeline.component';

import {
  NotificationService
} from '../../../../core/services/notification.service';

import {
  CandidateServiceComponent
} from '../../serviecs/candidate-service.component';

import {
  CommonModalComponent,
  CommentModalAction,
  CommentModalResult
} from '../../../../shared/components/common-modal/common-modal.component';

import {
  ApprovalStage
} from '../../../../shared/constants/approval.stage.modal';

import {
  ApprovedBudgetInfo,
  NegotiationComparisonItem,
  NegotiationDocument,
  OFFER_STAGE_ORDER,
  OFFER_CREATOR_ROLE,
  OFFER_APPROVAL_STAGES
} from '../../../../shared/constants/offer.model';

import {
  AuthService
} from '../../../../core/auth/auth.service';

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
    hrRecommendations: {
      amount: number;
      fieldName: string;
    }[];
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
  'relocation budget': 'fa-solid fa-key'
};

const DEFAULT_ITEM_ICON = 'fa-solid fa-file-lines';

const TERMS_KEYWORDS = [
  'period',
  'date',
  'notice',
  'location'
];

export type ApproverRole =
  | 'FINANCE_ANALYST'
  | 'FINANCE_HEAD'
  | 'HR_HEAD';

const ROLE_TO_APPROVER_ROLE: Record<string, ApproverRole> = {
  'finance analyst': 'FINANCE_ANALYST',
  'finance head': 'FINANCE_HEAD',
  'hr head': 'HR_HEAD'
};

const GUARANTEED_HR_FIELDS: {
  label: string;
  icon: string;
}[] = [
  {
    label: 'Basic Pay',
    icon: 'fa-solid fa-credit-card'
  },
  {
    label: 'Signing Bonus',
    icon: 'fa-solid fa-gift'
  },
  {
    label: 'Equity/RSU',
    icon: 'fa-solid fa-chart-line'
  },
  {
    label: 'Relocation Budget',
    icon: 'fa-solid fa-key'
  }
];

@Component({
  selector: 'app-negotiation-approval-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ApprovalPipelineComponent,
    CommonModalComponent
  ],
  templateUrl: './negotiation-approval-review.component.html',
  styleUrl: './negotiation-approval-review.component.scss'
})
export class NegotiationApprovalReviewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private candidateService = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  isLoading = true;
  isSubmitting = false;

  private applicantId: any;
  private offerId: any;

  currentApproverRole: ApproverRole = 'HR_HEAD';

  private myRole: ApproverRole | null = null;

  private approvalStagesRaw: NegotiationApprovalStageApi[] = [];

  statusBadge = 'Awaiting hr manager';

  candidate = {
    name: '',
    initials: '',
    avatarColor: '#7C3AED',
    role: '',
    department: '',
    email: '',
    requestedOn: '',
    currentCtc: 0,
    candidateId: '' as string | null
  };

  jobTitle = '';
  recruiterName = '';

  pipelineStages: ApprovalStage[] = [];

  showBudgetModal = false;

  budget: ApprovedBudgetInfo = {
    compensationBandMin: 0,
    compensationBandMax: 0,
    departmentBudgetAnnual: 0,
    allocatedThisQuarter: 0,
    remainingBudget: 0,
    note: ''
  };

  marketMin = 0;
  marketMax = 0;
  offeredCtc = 0;
  askedCtc = 0;

  get hasOfferBaseline(): boolean {
    return this.offeredCtc > 0;
  }

  get aboveMarketMax(): boolean {
    return this.askedCtc > this.marketMax;
  }

  get belowMarketMin(): boolean {
    return this.askedCtc > 0 &&
      this.askedCtc < this.marketMin;
  }

  get withinMarketRange(): boolean {
    return this.askedCtc > 0 &&
      !this.aboveMarketMax &&
      !this.belowMarketMin;
  }

  get deltaAmount(): number {
    return Math.max(
      0,
      this.askedCtc - this.marketMax
    );
  }

  get deltaPercent(): number {
    if (!this.marketMax) {
      return 0;
    }

    return Math.round(
      (this.deltaAmount / this.marketMax) * 1000
    ) / 10;
  }

  get marketPercentile(): number {
    if (this.marketMax <= this.marketMin) {
      return 0;
    }

    return Math.round(
      (
        (this.askedCtc - this.marketMin) /
        (this.marketMax - this.marketMin)
      ) * 100
    );
  }

  private trackPosition(value: number): number {
    const upper = Math.max(
      this.marketMax,
      this.askedCtc,
      this.marketMin + 1
    );

    const range = upper - this.marketMin;

    if (range <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        ((value - this.marketMin) / range) * 100
      )
    );
  }

  get marketMaxPosition(): number {
    return this.trackPosition(this.marketMax);
  }

  get offerPosition(): number {
    return this.trackPosition(this.offeredCtc);
  }

  get askedPosition(): number {
    return this.trackPosition(this.askedCtc);
  }

  get markersOverlap(): boolean {
    return this.hasOfferBaseline &&
      this.askedCtc > 0 &&
      Math.abs(
        this.offerPosition -
        this.askedPosition
      ) < 10;
  }

  items: NegotiationComparisonItem[] = [];

  get reasonItems(): NegotiationComparisonItem[] {
    return this.items.filter(
      i => i.candidateAsked != null
    );
  }

  hrRecommendedPackage = 0;
  hrRecommendationNote = '';

  documents: NegotiationDocument[] = [];

  reasonForSendingBack = '';

  isRegeneratingOfferLetter = false;
  isOfferLetterRegenerated = false;

  get isHrHead(): boolean {
    return this.currentApproverRole === 'HR_HEAD';
  }

  get priorStagesApproved(): boolean {
    const hrStageIndex =
      this.approvalStagesRaw.findIndex(
        s =>
          this.mapRoleToApproverRole(s.role) === 'HR_HEAD'
      );

    if (hrStageIndex <= 0) {
      return true;
    }

    return this.approvalStagesRaw
      .slice(0, hrStageIndex)
      .every(
        s => s.status === 'APPROVED'
      );
  }

  get canApprove(): boolean {
    return !this.isSubmitting &&
      this.items.some(
        i =>
          i.forward &&
          !i.isDate &&
          Number(i.yourDecision) > 0
      ) &&
      (
        !this.isHrHead ||
        (
          this.priorStagesApproved &&
          this.isOfferLetterRegenerated
        )
      );
  }

  get canEditDecisions(): boolean {
    return this.currentApproverRole === 'FINANCE_ANALYST';
  }

  commentModalVisible = false;

  commentModalAction:
    CommentModalAction | null = null;

  private pendingDecision:
    'approve' |
    'sendback' |
    null = null;

  isDocModalOpen = false;
  isDocModalLoading = false;
  docModalError = '';
  docModalTitle = '';

  docModalUrl:
    SafeResourceUrl | null = null;

  private docModalObjectUrl:
    string | null = null;

  ngOnInit(): void {
    this.applicantId =
      this.route.snapshot.paramMap.get('id');

    this.offerId =
      this.route.snapshot.paramMap.get('offerId');

    const rawRole =
      this.authService.getRole();

    const normalizedRawRole =
      (rawRole ?? '')
        .trim()
        .toLowerCase();

    const matchedStageRole =
      OFFER_STAGE_ORDER.find(
        r =>
          r.toLowerCase() ===
          normalizedRawRole
      );

    this.myRole =
      matchedStageRole &&
        matchedStageRole !== OFFER_CREATOR_ROLE
        ? this.mapRoleToApproverRole(matchedStageRole)
        : this.mapRoleToApproverRole(rawRole);

    this.currentApproverRole =
      (this.route.snapshot.data[
        'approverRole'
      ] as ApproverRole)
      ??
      (this.route.snapshot.queryParamMap.get(
        'role'
      ) as ApproverRole)
      ??
      this.myRole
      ??
      'HR_HEAD';

    this.pipelineStages =
      this.buildDefaultPipelineStages();

    this.loadAll();
  }

  private mapRoleToApproverRole(
    role: string | null | undefined
  ): ApproverRole {
    const normalizedRole =
      (role ?? '').trim().toLowerCase();

    return ROLE_TO_APPROVER_ROLE[normalizedRole] ?? 'HR_HEAD';
  }

  private buildDefaultPipelineStages(): ApprovalStage[] {
    return OFFER_APPROVAL_STAGES.map(
      (role, i): ApprovalStage => ({
        id: i + 1,
        role,
        approverName: '',
        approverInitials: '',
        status: 'PENDING'
      })
    );
  }

  private async loadAll(): Promise<void> {
    try {
      const res:
        NegotiationApprovalApiResponse =
        await this.candidateService
          .getNegotiationDetails(
            this.applicantId
          );

      console.log(
        'FULL NEGOTIATION RESPONSE:',
        res
      );

      console.log(
        'NEGOTIATION DATA:',
        res?.data
      );

      if (res?.responsecode === '00') {
        this.applyNegotiationDetails(
          res.data
        );
      } else {
        console.error(
          'Failed to fetch negotiation approval details:',
          res?.message
        );

        this.notificationService.error(
          res?.message ||
          'Failed to load the negotiation approval'
        );
      }
    } catch (err) {
      console.error(
        'ACTUAL ERROR:',
        err
      );

      this.notificationService.error(
        'Failed to load the negotiation approval. Please try again.'
      );
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private applyNegotiationDetails(
    data: NegotiationApprovalApiResponse['data']
  ): void {
    this.candidate = {
      name: data.candidateName ?? '',
      initials: this.getInitials(
        data.candidateName ?? ''
      ),
      avatarColor: '#7C3AED',
      role: '',
      department: '',
      email: data.email ?? '',
      requestedOn: this.formatDateTime(
        data.offerReleasedOn
      ),
      currentCtc:
        data.hrRecommendedCtc ??
        data.totalRequestedAmount ??
        0,
      candidateId:
        data.candidateId ?? null
    };

    this.jobTitle =
      (data.jobTitle ?? '').trim();

    this.approvalStagesRaw =
      data.approvalStages ?? [];

    this.pipelineStages =
      this.buildPipelineStages(
        this.approvalStagesRaw
      );

    const currentStage =
      this.approvalStagesRaw.find(
        s => s.status === 'PENDING'
      );

    if (currentStage) {
      this.currentApproverRole =
        this.mapRoleToApproverRole(
          currentStage.role
        );

      this.statusBadge =
        `Awaiting ${currentStage.role}`;
    } else if (
      this.approvalStagesRaw.length
    ) {
      this.statusBadge =
        'All stages approved';
    }

    this.marketMin =
      data.minimumSalary ?? 0;

    this.marketMax =
      data.maximumSalary ?? 0;

    this.offeredCtc =
      data.annualHiringCost ?? 0;

    this.askedCtc =
      data.totalRequestedAmount ?? 0;

    const departmentBudgetAnnual =
      data.hrRecommendedCtc ?? 0;

    const allocatedThisQuarter =
      data.annualHiringCost ?? 0;

    this.budget = {
      compensationBandMin:
        data.minimumSalary ?? 0,

      compensationBandMax:
        data.maximumSalary ?? 0,

      departmentBudgetAnnual,

      allocatedThisQuarter,

      remainingBudget:
        Math.max(
          0,
          departmentBudgetAnnual -
          allocatedThisQuarter
        ),

      note:
        data.hrReason ?? ''
    };

    const hrRecMap =
      new Map<string, number>();

    for (
      const rec of data.hrRecommendations ?? []
    ) {
      hrRecMap.set(
        rec.fieldName
          .trim()
          .toLowerCase(),
        rec.amount
      );
    }

    this.items =
      (data.negotiation ?? [])
        .map(
          raw =>
            this.buildItem(
              raw,
              hrRecMap
            )
        );

    for (
      const field of GUARANTEED_HR_FIELDS
    ) {
      const alreadyExists =
        this.items.some(
          i =>
            i.label.toLowerCase() ===
            field.label.toLowerCase()
        );

      if (!alreadyExists) {
        const hrRecommends =
          hrRecMap.get(
            field.label.toLowerCase()
          ) ?? null;

        this.items.push({
          key:
            field.label
              .trim()
              .toLowerCase()
              .replace(/\s+/g, '-'),

          icon:
            field.icon,

          label:
            field.label,

          category:
            'COMPENSATION',

          isDate:
            false,

          forward:
            false,

          initialOffer:
            null,

          candidateAsked:
            null,

          hrRecommends,

          yourDecision:
            hrRecommends ?? 0,

          decisionStatus:
            'Accepted',

          justification:
            ''
        });
      }
    }

    const joiningDecision =
      data.revisedJoiningDate ??
      data.joiningDate ??
      '';

    this.items.push({
      key: 'joiningDate',

      icon:
        'fa-regular fa-calendar',

      label:
        'Joining Date',

      category:
        'TERMS',

      isDate:
        true,

      forward:
        !!data.joiningDateReason,

      initialOffer:
        null,

      candidateAsked:
        data.joiningDate ?? null,

      hrRecommends:
        data.revisedJoiningDate ?? null,

      yourDecision:
        joiningDecision,

      decisionStatus:
        'Accepted',

      justification:
        data.joiningDateReason ?? ''
    });

    this.hrRecommendedPackage =
      data.hrRecommendedCtc ?? 0;

    this.hrRecommendationNote =
      data.hrReason ??
      data.overallJustification ??
      '';

    this.documents =
      (data.supportingDocuments ?? [])
        .map(path => {
          const name =
            path.split('/').pop() ||
            path;

          return {
            name,
            sizeLabel: '',
            uploadedOn: '',
            kind:
              this.inferKind(name),
            url:
              path
          };
        });
  }

  private buildPipelineStages(
    stages: NegotiationApprovalStageApi[]
  ): ApprovalStage[] {
    const byRole =
      new Map<string, NegotiationApprovalStageApi>();

    for (const stage of stages) {
      byRole.set(
        stage.role
          .trim()
          .toLowerCase(),
        stage
      );
    }

    let currentMarked = false;

    return OFFER_APPROVAL_STAGES.map(
      (
        roleName,
        index
      ): ApprovalStage => {
        const apiStage =
          byRole.get(
            roleName
              .trim()
              .toLowerCase()
          );

        let status:
          ApprovalStage['status'];

        if (
          apiStage?.status ===
          'APPROVED'
        ) {
          status = 'APPROVED';
        } else if (
          apiStage?.status ===
          'REJECTED'
        ) {
          status =
            'REJECTED' as unknown as
            ApprovalStage['status'];
        } else if (
          !currentMarked
        ) {
          status =
            'IN_PROGRESS';

          currentMarked = true;
        } else {
          status =
            'PENDING';
        }

        return {
          id:
            index + 1,

          role:
            roleName,

          approverName:
            apiStage?.approvedBy ?? '',

          approverInitials:
            this.getInitials(
              apiStage?.approvedBy ??
              roleName
            ),

          status
        };
      }
    );
  }

  private buildItem(
    raw:
      NegotiationApprovalApiResponse[
      'data'
      ]['negotiation'][number],

    hrRecMap:
      Map<string, number>
  ): NegotiationComparisonItem {
    const hasAsk =
      raw.requestedAmount != null;

    const isTerms =
      TERMS_KEYWORDS.some(
        kw =>
          raw.fieldName
            .toLowerCase()
            .includes(kw)
      );

    const hrRecommends =
      hrRecMap.get(
        raw.fieldName
          .trim()
          .toLowerCase()
      ) ??
      (
        hasAsk
          ? raw.requestedAmount
          : null
      );

    return {
      key:
        raw.fieldName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),

      icon:
        ITEM_ICONS[
          raw.fieldName
            .trim()
            .toLowerCase()
        ] ??
        DEFAULT_ITEM_ICON,

      label:
        raw.fieldName,

      category:
        isTerms
          ? 'TERMS'
          : 'COMPENSATION',

      isDate:
        false,

      forward:
        hasAsk,

      initialOffer:
        raw.initialAmount,

      candidateAsked:
        hasAsk
          ? raw.requestedAmount
          : null,

      hrRecommends,

      yourDecision:
        hrRecommends ?? 0,

      decisionStatus:
        'Accepted',

      justification:
        raw.reason ?? ''
    };
  }

  onDecisionChange(
    item: NegotiationComparisonItem,
    raw: string
  ): void {
    if (item.isDate) {
      item.yourDecision = raw;
    } else {
      const n =
        Number(
          String(raw)
            .replace(/[^\d.-]/g, '')
        );

      item.yourDecision =
        isNaN(n)
          ? 0
          : n;

      item.decisionStatus =
        item.yourDecision ===
          item.hrRecommends
          ? 'Accepted'
          : 'Modified';
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

  getInitials(name: string): string {
    if (!name) {
      return '?';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private formatDateTime(
    iso: string
  ): string {
    if (!iso) {
      return '';
    }

    const d =
      new Date(iso);

    if (isNaN(d.getTime())) {
      return iso;
    }

    return (
      d.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      ) +
      ' · ' +
      d.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      )
    );
  }

  formatCurrency(
    n: number | null
  ): string {
    if (n == null) {
      return '';
    }

    return (
      '₹' +
      Math.round(n)
        .toLocaleString('en-IN')
    );
  }

  formatDate(
    iso: string | null
  ): string {
    if (!iso) {
      return '';
    }

    const d =
      new Date(iso);

    if (isNaN(d.getTime())) {
      return iso;
    }

    return d.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  private inferKind(
    name: string
  ): 'pdf' | 'img' | 'file' {
    const ext =
      name
        .split('.')
        .pop()
        ?.toLowerCase() ?? '';

    if (ext === 'pdf') {
      return 'pdf';
    }

    if (
      [
        'png',
        'jpg',
        'jpeg',
        'gif',
        'webp'
      ].includes(ext)
    ) {
      return 'img';
    }

    return 'file';
  }

  onBack(): void {
    const isHrHead =
      this.mapRoleToApproverRole(
        this.authService.getRole()
      ) === 'HR_HEAD';

    this.router.navigate(
      ['/approval/approve-offer-requests'],
      {
        state: {
          isUpload: isHrHead,
          mode: 'approve',
          url: '/approval/approve-offer-requests'
        }
      }
    );
  }

  private navigateToOfferApproval(): void {
    const isHrHead =
      this.mapRoleToApproverRole(
        this.authService.getRole()
      ) === 'HR_HEAD';

    this.router.navigate(
      ['/approval/approve-offer-requests'],
      {
        state: {
          isUpload: isHrHead,
          mode: 'approve',
          url: '/approval/approve-offer-requests'
        }
      }
    );
  }

  private async navigateToOfferManagementView(): Promise<void> {
    const isHrHead =
      this.mapRoleToApproverRole(
        this.authService.getRole()
      ) === 'HR_HEAD';

    const navigationId =
      this.applicantId;

    if (
      navigationId === null ||
      navigationId === undefined ||
      navigationId === ''
    ) {
      this.notificationService.error(
        'Application ID is missing. Unable to open offer management.'
      );
      return;
    }

    const url = [
      '/approval',
      'approve-offer-requests',
      'offer-management',
      'view',
      navigationId
    ];

    console.log(
      'Navigating to Offer Management View'
    );

    console.log(
      'Navigation ID:',
      navigationId
    );

    console.log(
      'Authenticated Role:',
      this.authService.getRole()
    );

    console.log(
      'Mapped Role:',
      this.mapRoleToApproverRole(
        this.authService.getRole()
      )
    );

    console.log(
      'Navigation URL:',
      url
    );

    try {
      const navigated =
        await this.router.navigate(
          url,
          {
            state: {
              isUpload: isHrHead,
              mode: 'approve',
              url: '/approval/approve-offer-requests'
            }
          }
        );

      console.log(
        'Navigation result:',
        navigated
      );

      if (!navigated) {
        this.notificationService.error(
          'Unable to open Offer Management View.'
        );
      }
    } catch (error) {
      console.error(
        'Navigation to Offer Management View failed:',
        error
      );

      this.notificationService.error(
        'Unable to open Offer Management View.'
      );
    }
  }

  onViewOfferLetter(): void {
    this.notificationService.info(
      'Offer letter preview coming soon'
    );
  }

  async onViewDocument(
    doc: NegotiationDocument
  ): Promise<void> {
    this.isDocModalOpen = true;
    this.isDocModalLoading = true;
    this.docModalError = '';
    this.docModalTitle =
      doc.name;
    this.docModalUrl = null;

    this.cdr.markForCheck();

    try {
      const blob: Blob =
        await this.candidateService
          .viewDocument({
            filePath: doc.url
          });

      this.revokeDocModalObjectUrl();

      this.docModalObjectUrl =
        URL.createObjectURL(blob);

      this.docModalUrl =
        this.sanitizer
          .bypassSecurityTrustResourceUrl(
            this.docModalObjectUrl
          );
    } catch (err) {
      console.error(
        'Failed to load document preview',
        err
      );

      this.docModalError =
        'Could not load this document. Please try again.';
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
      URL.revokeObjectURL(
        this.docModalObjectUrl
      );

      this.docModalObjectUrl = null;
    }
  }

  async onRegenerateOfferLetter(): Promise<void> {
    if (this.isRegeneratingOfferLetter) {
      return;
    }

    this.isRegeneratingOfferLetter = true;
    this.cdr.markForCheck();

    try {
      const payload = {
        application_id:
          this.applicantId,

        candidate_id:
          this.candidate.candidateId,

        offer_id:
          this.offerId,

        total_ctc:
          this.hrRecommendedPackage,

        approve:
          true,

        comments:
          'Regenerating offer letter ahead of negotiation approval'
      };

      const response: any =
        await this.candidateService
          .regenerateOfferLetter(payload);

      console.log(
        'Regenerate offer letter response:',
        response
      );

      if (
        response?.status === 'ok'
      ) {
        this.isOfferLetterRegenerated =
          true;

        this.notificationService.success(
          response?.message ||
          'Offer letter regenerated successfully.'
        );

        console.log(
          'Generated file:',
          response?.minio_file_name
        );
      } else {
        this.isOfferLetterRegenerated =
          false;

        this.notificationService.error(
          response?.message ||
          'Failed to regenerate the offer letter.'
        );
      }
    } catch (err) {
      console.error(
        'Failed to regenerate offer letter',
        err
      );

      this.isOfferLetterRegenerated =
        false;

      this.notificationService.error(
        'Failed to regenerate the offer letter. Please try again.'
      );
    } finally {
      this.isRegeneratingOfferLetter =
        false;

      this.cdr.markForCheck();
    }
  }

  onSendBackToHR(): void {
    if (this.isSubmitting) {
      return;
    }

    this.pendingDecision =
      'sendback';

    this.commentModalAction =
      'reject';

    this.commentModalVisible =
      true;

    this.cdr.markForCheck();
  }

  async onApproveAndContinue(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }
  
    const isHrHead = this.authService.getRole() === 'HR Head';
  
    const applicationId = this.applicantId;
  
    if (!applicationId) {
      this.notificationService.error(
        'Application ID is missing.'
      );
      return;
    }
  
    const url = `/approval/approve-offer-requests/offer-management/view/${applicationId}`;
  
    console.log('Approve & Continue clicked');
    console.log('Application ID:', applicationId);
    console.log('Navigation URL:', url);
    console.log('Auth Role:', this.authService.getRole());
  
    try {
      await this.router.navigateByUrl(url, {
        state: {
          isUpload: isHrHead,
          mode: 'approve',
          url: '/approval/approve-offer-requests'
        }
      });
    } catch (error) {
      console.error(
        'Navigation failed:',
        error
      );
  
      this.notificationService.error(
        'Unable to open Offer Management View.'
      );
    }
  }
  onDecisionModalCancelled(): void {
    this.commentModalVisible =
      false;

    this.pendingDecision =
      null;

    this.cdr.markForCheck();
  }

  async onDecisionModalConfirmed(
    result: CommentModalResult
  ): Promise<void> {
    const comment =
      result.comment;

    const decision =
      this.pendingDecision;

    this.commentModalVisible =
      false;

    this.pendingDecision =
      null;

    this.cdr.markForCheck();

    if (
      decision === 'approve'
    ) {
      await this.submitApproval(
        comment
      );
    } else if (
      decision === 'sendback'
    ) {
      await this.submitSendBack(
        comment
      );
    }
  }

  private async submitSendBack(
    comment: string
  ): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting =
      true;

    this.cdr.markForCheck();

    try {
      const res: any =
        await this.candidateService
          .approveOffer({
            applicantId:
              this.applicantId,

            approve:
              false,

            comments:
              comment
          });

      if (
        res?.responsecode === '00'
      ) {
        this.notificationService.success(
          res?.message ??
          'Sent back to HR'
        );

        await this.navigateToOfferApproval();
      } else {
        this.notificationService.error(
          res?.errors?.[0] ??
          res?.message ??
          'Something went wrong'
        );
      }
    } catch (err) {
      console.error(
        'Send back to HR failed',
        err
      );

      this.notificationService.error(
        'Something went wrong. Please try again.'
      );
    } finally {
      this.isSubmitting =
        false;

      this.cdr.markForCheck();
    }
  }

  private async submitApproval(
    comment: string
  ): Promise<void> {
    if (!this.canApprove) {
      return;
    }

    this.isSubmitting =
      true;

    this.cdr.markForCheck();

    try {
      let payload: any;

      const loggedInRole =
        this.mapRoleToApproverRole(
          this.authService.getRole()
        );

      if (
        loggedInRole ===
        'FINANCE_ANALYST'
      ) {
        payload = {
          applicantId:
            this.applicantId,

          approve:
            true,

          comments:
            comment,

          approvalType:
            'NEGOTIATION',

          financeRecommendations:
            this.items
              .filter(
                i =>
                  i.forward &&
                  !i.isDate
              )
              .map(
                i => ({
                  fieldName:
                    i.label,

                  amount:
                    Number(
                      i.yourDecision
                    ) || 0
                })
              ),

          financeReason:
            comment
        };
      } else if (
        loggedInRole ===
        'FINANCE_HEAD'
      ) {
        payload = {
          applicantId:
            this.applicantId,

          approve:
            true,

          comments:
            comment,

          approvalType:
            'NEGOTIATION'
        };
      } else {
        payload = {
          applicantId:
            this.applicantId,

          approve:
            true,

          comments:
            comment,

          approvalType:
            'NEGOTIATION',

          decisions:
            this.items
              .filter(
                i => i.forward
              )
              .map(
                i => ({
                  key:
                    i.key,

                  value:
                    i.yourDecision
                })
              )
        };
      }

      console.log(
        'NEGOTIATION APPROVAL PAYLOAD:',
        payload
      );

      const res: any =
        await this.candidateService
          .approveOffer(payload);

      console.log(
        'NEGOTIATION APPROVAL RESPONSE:',
        res
      );

      const responsecode =
        res?.responsecode;

      const message =
        res?.message;

      const errors =
        res?.errors;

      if (
        responsecode === '00'
      ) {
        this.notificationService.success(
          message ??
          'Approved and forwarded'
        );

        if (
          loggedInRole ===
          'HR_HEAD'
        ) {
          await this.navigateToOfferManagementView();
        } else {
          await this.navigateToOfferApproval();
        }

        return;
      }

      this.notificationService.error(
        errors?.[0] ??
        message ??
        'Something went wrong'
      );

    } catch (err) {
      console.error(
        'Approve negotiation failed',
        err
      );

      this.notificationService.error(
        'Something went wrong. Please try again.'
      );
    } finally {
      this.isSubmitting =
        false;

      this.cdr.markForCheck();
    }
  }
}