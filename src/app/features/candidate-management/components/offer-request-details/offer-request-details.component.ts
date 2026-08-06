import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  DonutPieChartComponent,
  DonutSegment,
} from '../donut-pie-chart/donut-pie-chart.component';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

interface CompensationRow {
  label: string;
  type: string;
  value: number;
  color: string;
}

interface Candidate {
  name: string;
  email: string;
  initials: string;
  jobTitle: string;
  department: string;
  recruiter: string;
  requestId: string;
  requestedOn: string;
  status: string;
}

interface OfferTerms {
  noticePeriod: string;
  probationPeriod: string;
  template: string;
  /** ISO date string (yyyy-MM-dd) — must be a future date, never today or in the past. */
  joiningDate: string;
}

interface MarketMarker {
  /** e.g. "P25" */
  label: string;
  value: number;
  /** Position along the 0-100 bar. Matches the percentile itself. */
  percentile: number;
}

interface MarketComparison {
  percentile: number;
  message: string;
  markers: MarketMarker[];
}

// ─── API response shape ────────────────────────────────────────────────────
// GET /hms/offer-details/get-offer-details-by-applicant-id/{applicantId}
interface OfferDetailsApiResponse {
  data: {
    applicantId: number;
    jobId: number;
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

@Component({
  selector: 'app-offer-request-details',
  standalone: true,
  imports: [CommonModule, FormsModule, DonutPieChartComponent],
  templateUrl: './offer-request-details.component.html',
  styleUrls: ['./offer-request-details.component.scss'],
  
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferRequestDetailsComponent implements OnInit {
  isLoading = true;

  candidate: Candidate = {
    name: '',
    email: '',
    initials: '',
    jobTitle: '',
    department: '',
    recruiter: '',
    requestId: '',
    requestedOn: '',
    status: 'Pending finance approval', // TODO: no status field in this API yet — swap in the real one once available.
  };

  compensation: CompensationRow[] = [];

  // --- Offer terms -------------------------------------------------------
  noticePeriodOptions = ['15 days', '30 days', '45 days', '60 days', '90 days'];
  probationPeriodOptions = ['No probation', '1 month', '3 months', '6 months'];
  offerTemplateOptions: any[] = [];

  offerTerms: OfferTerms = {
    noticePeriod: '30 days',
    probationPeriod: '3 months',
    template: '',
    joiningDate: '',
  };

  
  minJoiningDate = this.computeMinJoiningDate();

  marketComparison: MarketComparison = {
    percentile: 60,
    message: 'You are offering above market median',
    markers: [
      { label: 'Min', value: 1000000, percentile: 0 },
      { label: 'P25', value: 1050000, percentile: 25 },
      { label: 'P50', value: 1220000, percentile: 50 },
      { label: 'P75', value: 1480000, percentile: 75 },
      { label: 'Max', value: 1800000, percentile: 100 },
    ],
  };

  totalCTC = 0;
  donutSegments: DonutSegment[] = [];
  private notificationService=inject(NotificationService);

  @ViewChild('offerForm') offerForm?: NgForm;

  private applicantId: any;
  private jobId?: any;
  
  private candidateId?: number;
  private offerId?:any;
  private candidateService = inject(CandidateServiceComponent);
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
 
  ngOnInit(): void {
    this.applicantId = this.activeRoute.snapshot.paramMap.get('id');
    this.jobId=this.activeRoute.snapshot.paramMap.get('jobId');
    this.offerId=this.activeRoute.snapshot.paramMap.get('offerId');
    Promise.all([this.getOfferTemplates(), this.loadOfferDetailsById()])

  }
  private async getOfferTemplates() {
    const res: any = await this.candidateService.getOfferTemplates();
    if (res?.responsecode == '00') {
      this.offerTemplateOptions = res?.data;
    }
    else {
      this.offerTemplateOptions = [];
    }
  }
  private async loadOfferDetailsById(): Promise<void> {
    try {

      const res: any = await this.candidateService.getOfferDetails(this.applicantId);
      if (res?.responsecode == '00') {
        this.applyOfferDetails(res.data);
      } else {
        console.error('Failed to fetch offer details:', res?.message);
      }
    } catch (err) {
      console.error('Failed to load offer details', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private applyOfferDetails(data: any): void {
    this.candidate = {
      name: data.candidateName,
      email: data.email,
      initials: this.getInitials(data.candidateName),
      jobTitle: data.jobTitle,
      department: data.department,
      recruiter: data.recruiter,
      
      requestId: `OFR-${data.applicantId}`,
      requestedOn: this.formatDate(data.requestedOn),
      status: this.candidate.status,
    };

    // this.jobId = data.jobId;
    
    this.candidateId = data.candidateId;
    // this.offerId = data.offerId;

    this.compensation = [
      { label: 'Basic salary', type: 'Fixed', value: data.basicSalary, color: '#3357e8' },
      { label: 'Signing bonus', type: 'One-time', value: data.signingBonus, color: '#8b5cf6' },
      { label: 'Annual RSU / ESOP value', type: 'Equity', value: data.equity, color: '#10b981' },
      { label: 'Other benefits', type: 'Fixed', value: data.otherBenefits, color: '#f59e0b' },
    ];

    
    this.totalCTC = data.offeredCtc ?? data.offeredCtc ?? 0;

    this.donutSegments = this.compensation.map((row) => ({
      label: row.label,
      value: row.value,
      color: row.color,
    }));

    this.offerTerms = {
      noticePeriod: this.matchOption(this.noticePeriodOptions, data.noticePeriod) ?? this.offerTerms.noticePeriod,
      probationPeriod: this.matchOption(this.probationPeriodOptions, data.probationPeriod) ?? this.offerTerms.probationPeriod,
      template: this.offerTerms.template,
      // TODO: no joining-date field in this API yet — keep whatever the user has selected in the form.
      joiningDate: this.offerTerms.joiningDate,
    };

    this.marketComparison = this.computeMarketComparison(
      data.offeredCtc ?? this.totalCTC,
      data.minSalary ?? 0,
      data.maxSalary ?? 0,
    );
  }

  /**
   * Builds a Min / P25 / P50 / P75 / Max scale spanning `minSalary` (0%) to
   * `maxSalary` (100%), then places the candidate's offered CTC on that
   * 0-100 scale by linearly interpolating between the two nearest markers.
   * Values at or below minSalary clamp to 0%; at or above maxSalary clamp
   * to 100% — so the dot can land anywhere along the full range.
   */
  private computeMarketComparison(offeredCtc: number, minSalary: number, maxSalary: number): MarketComparison {
    const range = maxSalary - minSalary;

    const markers: MarketMarker[] = [
      { label: 'Min', value: minSalary, percentile: 0 },
      { label: 'P25', value: minSalary + range * 0.25, percentile: 25 },
      { label: 'P50', value: minSalary + range * 0.5, percentile: 50 },
      { label: 'P75', value: minSalary + range * 0.75, percentile: 75 },
      { label: 'Max', value: maxSalary, percentile: 100 },
    ];

    const percentile = this.interpolatePercentile(offeredCtc, markers);

    return {
      percentile,
      message: this.getMarketMessage(percentile),
      markers,
    };
  }

  private interpolatePercentile(value: number, markers: MarketMarker[]): number {
    if (!markers.length) return 0;

    const first = markers[0];
    const last = markers[markers.length - 1];

    // Clamp to the ends of the range — nothing before Min, nothing past Max.
    if (value <= first.value) return first.percentile;
    if (value >= last.value) return last.percentile;

    for (let i = 0; i < markers.length - 1; i++) {
      const lo = markers[i];
      const hi = markers[i + 1];
      if (value >= lo.value && value <= hi.value) {
        const ratio = hi.value === lo.value ? 0 : (value - lo.value) / (hi.value - lo.value);
        return Math.round(lo.percentile + ratio * (hi.percentile - lo.percentile));
      }
    }

    return last.percentile;
  }

  private getMarketMessage(percentile: number): string {
    if (percentile > 50) return 'You are offering above market median';
    if (percentile === 50) return 'You are offering at market median';
    return 'You are offering below market median';
  }

  private getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /** "2026-07-10" -> "10 Jul 2026", matching the page's existing date display format. */
  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }


  /** Returns tomorrow's date as "yyyy-MM-dd" — the smallest value the joining-date input will accept. */
  private computeMinJoiningDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private matchOption(options: string[], apiValue: string | undefined | null): string | undefined {
    if (!apiValue) return undefined;
    return options.find((opt) => opt.toLowerCase() === apiValue.trim().toLowerCase());
  }

  formatINR(n: number): string {
    return n.toLocaleString('en-IN');
  }

  trackByLabel(_index: number, row: CompensationRow): string {
    return row.label;
  }

  trackByMarker(_index: number, marker: MarketMarker): string {
    return marker.label;
  }

 
  async generateOfferLetter(): Promise<void> {
    const templateCtrl = this.offerForm?.controls['offerTemplate'];
    if (templateCtrl && templateCtrl.invalid) {
      templateCtrl.markAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const payload = {
      application_id: Number(this.applicantId),
      job_id: this.jobId,
      offer_id:this.offerId,
      candidate_id: this.candidateId, // TODO: confirm this field once offer-details response is updated
           // TODO: confirm this field once offer-details response is updated
      basic_salary: this.getCompensationValue('Basic salary'),
      signing_bonus: this.getCompensationValue('Signing bonus'),
      equity_rsu: this.getCompensationValue('Annual RSU / ESOP value'),
      other_benefits: this.getCompensationValue('Other benefits'),
      notice_period: this.extractNoticePeriodDays(this.offerTerms.noticePeriod),
    };

    try {
      const response:any=await this.candidateService.generateOfferLetter(payload);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      this.notificationService.success('Offer letter generated');
    } catch (err) {
      console.error('Error generating offer letter', err);
      this.notificationService.error('Failed to generate the offer letter. Please try again.');
    }
  }

  onBack(): void {
    this.router.navigate(['/candidate-management/offer-management']);
  }

  onSaveDraft(): void {
    console.log('Save draft', { candidate: this.candidate, offerTerms: this.offerTerms });
  }

  async onSubmit(): Promise<void> {
    this.offerForm?.form.markAllAsTouched();
    if (this.offerForm && this.offerForm.invalid) {
      this.cdr.markForCheck();
      return;
    }

    const payload = {
      applicantId: Number(this.applicantId),
      totalCtc: this.totalCTC,
      noticePeriod: this.offerTerms.noticePeriod,
      probationPeriod: this.offerTerms.probationPeriod,
      offerLetterTemplateId: Number(this.offerTerms.template),
      joiningDate: this.offerTerms.joiningDate,
      compensation: this.buildCompensationSummary(),
      submitFinancialApproval: true,
    };

    try {
      const res: any = await this.candidateService.submitOfferRequest(payload);
      if (res?.responsecode === '00') {
        this.notificationService.success(res?.message);
        this.onBack()
      } else {
        this.notificationService.error(res?.erros?.[0] || res?.message);
      }
    } catch (err) {
      console.error('Error submitting offer request', err);
    }
  }

  private getCompensationValue(label: string): number {
    return this.compensation.find((row) => row.label === label)?.value ?? 0;
  }

  /** "15 days" -> "15" (API wants just the number, as a string). */
  private extractNoticePeriodDays(noticePeriod: string): string {
    const match = noticePeriod?.match(/\d+/);
    return match ? match[0] : noticePeriod ?? '';
  }

  private buildCompensationSummary(): string {
    return this.compensation
      .filter((row) => row.value > 0)
      .map((row) => row.label)
      .join(' + ');
  }
}