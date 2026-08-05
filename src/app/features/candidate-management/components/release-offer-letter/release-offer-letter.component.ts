import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { NotificationService } from '../../../../core/services/notification.service';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';
import { OfferLetterPreview, OfferSummaryRow, ReleaseOfferCandidateInfo } from '../../../../shared/constants/offer.model';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";

@Component({
  selector: 'app-release-offer-letter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeadingComponent],
  templateUrl: './release-offer-letter.component.html',
  styleUrl: './release-offer-letter.component.scss',
})
export class ReleaseOfferLetterComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private candidateService = inject(CandidateServiceComponent);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);

  isLoading = true;
  isReleasing = false;
  private applicantId: any;

  
  isReRelease = false;
  get pageTitle(): string { return this.isReRelease ? 'Re-release Offer Letter' : 'Release Offer Letter'; }
  get pageSubheading(): string {
    return this.isReRelease
      ? 'The offer was revised after negotiation. Review the updated offer letter and release it to the candidate again.'
      : 'All approvals are completed. You can now review the final offer letter and release it to the candidate.';
  }

  
  stageLabel = 'Negotiating';
  requestId = '';

  get breadcrumbTrail(): string[] {
    return ['Offer Management', 'Candidate Response', this.stageLabel, this.requestId, this.pageTitle].filter(Boolean);
  }


  candidate: ReleaseOfferCandidateInfo = {
    name: '', initials: '', avatarColor: '#7C3AED',
    role: '', email: '', candidateId: '',
    department: '', employmentType: '', location: '',
  };

  
  summaryRows: OfferSummaryRow[] = [];

  letterPreview: OfferLetterPreview = {
    companyName: '', logoInitial: '', dateLabel: '',
    bodyParagraphs: [], signOffName: '', signOffTitle: '', signOffCompany: '',
  };

  isLetterModalOpen = false;
  isLetterModalLoading = false;
  letterModalError = '';
  letterModalUrl: SafeResourceUrl | null = null;
  private letterModalObjectUrl: string | null = null;

  // Icon lookup for dynamic finance recommendation rows coming back from the API.
  private readonly financeFieldIconMap: Record<string, string> = {
    'basic pay': 'fa-solid fa-credit-card',
    'reallocation budget': 'fa-solid fa-people-arrows',
    'equity': 'fa-solid fa-chart-pie',
    'retention bonus': 'fa-solid fa-gift',
    'joining bonus': 'fa-solid fa-hand-holding-dollar',
    'other': 'fa-solid fa-circle-plus',
  };

  ngOnInit(): void {
    this.applicantId = this.route.snapshot.paramMap.get('id');
    const navState = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    const type = navState?.type;
    this.isReRelease = type === 're-release' || type === 'reRelease';

    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {

        await this.loadReReleaseOfferDetails();
     
    } catch (err) {
      console.error('Failed to load offer release details', err);
      this.notificationService.error('Failed to load the offer. Please try again.');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async loadReReleaseOfferDetails(): Promise<void> {
    const res: any = await this.candidateService.getReReleaseOfferDetailsById(this.applicantId);

    if (res?.responsecode !== '00' || !res?.data) {
      this.notificationService.error(res?.message ?? 'Failed to load the offer. Please try again.');
      return;
    }

    const data = res.data;
    this.requestId = data.offerId != null ? `OFFER-${data.offerId}` : '';

    this.candidate = {
      name: data.candidateName ?? '',
      initials: this.getInitials(data.candidateName ?? ''),
      avatarColor: '#7C3AED',
      role: data.jobTitle ?? '',
      email: data.email ?? '',
      candidateId: data.candidateId != null ? `CAND-${data.candidateId}` : '',
      department: data.departmentName ?? '',
      employmentType: data.employmentType ?? '',
      location: data.location ?? '',
    };

    const financeRows: OfferSummaryRow[] = (data.financeRecommendations ?? []).map((rec: { fieldName: string; amount: number }) => ({
      key: rec.fieldName,
      icon: this.financeFieldIconMap[(rec.fieldName ?? '').toLowerCase()] ?? 'fa-solid fa-sack-dollar',
      label: `${rec.fieldName} (Annual)`,
      value: this.formatCurrency(rec.amount),
    }));

    this.summaryRows = [
      ...financeRows,
      { key: 'totalCtc', icon: 'fa-solid fa-chart-line', label: 'Total CTC (Annual)', value: this.formatCurrency(data.totalCtc), highlight: true },
      { key: 'joiningDate', icon: 'fa-regular fa-calendar', label: 'Joining Date', value: this.formatDate(data.joiningDate) },
      { key: 'offerValidity', icon: 'fa-regular fa-clock', label: 'Offer Validity', value: this.formatDate(data.offerValidity) },
      { key: 'probationPeriod', icon: 'fa-solid fa-shield-halved', label: 'Probation Period', value: data.probationPeriod ?? '' },
    ];

    this.letterPreview = {
      companyName: 'NEXUS',
      logoInitial: 'N',
      dateLabel: this.formatDate(new Date().toISOString()),
      bodyParagraphs: [
        `We are pleased to offer you the position of ${data.jobTitle ?? ''} at Nexus Solutions.`,
        `Please find the offer details and terms of employment in the attached offer letter.`,
        `We look forward to welcoming you to our team!`,
      ],
      signOffName: 'Human Resources',
      signOffTitle: '',
      signOffCompany: 'Nexus Solutions',
    };
  }


  private getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  formatCurrency(n: number | null): string {
    if (n == null) return '';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }


  onCancel(): void {
    this.router.navigateByUrl('/candidate-management/offer-management');
  }

  onDownloadOfferDetails(): void {
   
    this.notificationService.info('Offer details download coming soon');
  }

  async onPreviewFullOfferLetter(): Promise<void> {
    this.isLetterModalOpen = true;
    this.isLetterModalLoading = true;
    this.letterModalError = '';
    this.letterModalUrl = null;
    this.cdr.markForCheck();

    try {
      const blob: Blob = await this.candidateService.viewOfferLetter(this.applicantId);
      this.revokeLetterModalObjectUrl();
      this.letterModalObjectUrl = URL.createObjectURL(blob);
      this.letterModalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.letterModalObjectUrl);
    } catch (err) {
      console.error('Failed to load offer letter preview', err);
      this.letterModalError = 'Could not load the offer letter. Please try again.';
    } finally {
      this.isLetterModalLoading = false;
      this.cdr.markForCheck();
    }
  }

  closeLetterModal(): void {
    this.isLetterModalOpen = false;
    this.letterModalUrl = null;
    this.letterModalError = '';
    this.revokeLetterModalObjectUrl();
    this.cdr.markForCheck();
  }

  private revokeLetterModalObjectUrl(): void {
    if (this.letterModalObjectUrl) {
      URL.revokeObjectURL(this.letterModalObjectUrl);
      this.letterModalObjectUrl = null;
    }
  }

  async onReleaseOfferLetter(): Promise<void> {
    if (this.isReleasing) return;
    this.isReleasing = true;
    this.cdr.markForCheck();
    try {
      
      const res: any = await this.candidateService.releaseOffer({
        applicationIds: [this.applicantId],
      });
      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message ?? 'Offer letter released to the candidate');
        this.onCancel();
      } else {
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('Release offer letter failed', err);
      this.notificationService.error('Something went wrong. Please try again.');
    } finally {
      this.isReleasing = false;
      this.cdr.markForCheck();
    }
  }
  onBackButtonClicked(){

  }
}