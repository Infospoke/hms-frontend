import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { recruitersPerformanceFilter } from '../../../../shared/constants/reusbale-filter';
import { JobAssignmentsTableComponent, JobAssignmentRow } from '../../../../shared/components/job-assignments-table/job-assignments-table.component';
import { SourcePerformanceGridComponent, SourceTile } from '../../../../shared/components/source-performance-grid/source-performance-grid.component';
import { MultiLineChartComponent, LineSeriesInput } from '../../../../shared/components/multi-line-chart/multi-line-chart.component';
import { CandidatePipelineComponent, PipelineStage } from '../../../../shared/components/candidate-pipeline/candidate-pipeline.component';
import { DashboardService } from '../../services/dashboard.service';
import { SlaCompilanceComponentComponent, SlaFractionMetric } from '../sla-compilance-component/sla-compilance-component.component';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { JobService } from '../../../job/services/job.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-recruiters-performance-dashboard',
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    JobAssignmentsTableComponent,
    SourcePerformanceGridComponent,
    MultiLineChartComponent,
    CandidatePipelineComponent,
    SlaCompilanceComponentComponent
  ],
  templateUrl: './recruiters-performance-dashboard.component.html',
  styleUrl: './recruiters-performance-dashboard.component.scss',
})
export class RecruitersPerformanceDashboardComponent implements OnInit, OnDestroy {

  heading = 'Recruiter Performance Drill-down';
  subHeading = "Track recruiter execution from job assignment to hiring outcome";

  private dashboardService = inject(DashboardService);
  private approvalService = inject(ApprovalService);
  private jobService = inject(JobService);
  private notificationService = inject(NotificationService);

  
  filterDropdowns = recruitersPerformanceFilter;

  // ── active filter state ─────────────────────────────────────────────────
  selectedRecruiterId: any = '';
  fromDate: string = '';
  toDate: string = '';

  // ── selected job assignment (drill-down) ────────────────────────────────
  selectedJobId: any = null;
  selectedJobTitle: string = '';
  performanceDetailLoaded = false;

  // The recruiter dropdown and the date-range picker are two separate
  // controls that can each fire their own change event in quick succession
  // (e.g. editing "From" then "To" moments later) — debounce so that only
  // fires ONE dashboard-count call once things settle, not one per field.
  private filterChange$ = new Subject<any>();
  private destroy$ = new Subject<void>();

  async ngOnInit(): Promise<void> {
    const range = this.resolveDateRange(null);
    this.fromDate = range.fromDate;
    this.toDate = range.toDate;

    this.filterChange$.pipe(
      debounceTime(350),
      takeUntil(this.destroy$)
    ).subscribe(event => this.applyFilterChange(event));

    await this.loadRecruiters();
    this.getDashboardCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── filters bar ──────────────────────────────────────────────────────────
  onFilterChange(event: any): void {
    this.filterChange$.next(event);
  }

  private applyFilterChange(event: any): void {
    if (event?.filters && 'recruiter' in event.filters) {
      this.selectedRecruiterId = event.filters.recruiter || '';
    }

    const range = this.resolveDateRange(event);
    this.fromDate = range.fromDate;
    this.toDate = range.toDate;

    this.selectedJobId = null;
    this.selectedJobTitle = '';
    this.performanceDetailLoaded = false;

    this.getDashboardCount();
  }

  private resolveDateRange(event: any): { fromDate: string; toDate: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

   
    const rangeFrom = event?.fromDate || event?.startDate;
    const rangeTo = event?.toDate || event?.endDate;
    if (rangeFrom && rangeTo) {
      return { fromDate: rangeFrom, toDate: rangeTo };
    }

    const preset = event?.filters?.dateFilter;
    if (preset === 'TODAY') {
      return { fromDate: fmt(today), toDate: fmt(today) };
    }
    if (preset === 'thisWeek') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return { fromDate: fmt(start), toDate: fmt(today) };
    }
    if (preset === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { fromDate: fmt(start), toDate: fmt(today) };
    }
    if (!preset) {
      // Initial load, before the date filter has been touched — default to
      // a rolling one-month window ending today (matches the Date Range
      // card's From/To inputs, which are pre-filled with this same range).
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);
      return { fromDate: fmt(start), toDate: fmt(today) };
    }
    // "All Time" / unrecognised preset → widest safe range.
    return { fromDate: '2000-01-01', toDate: fmt(today) };
  }

 
  private async loadRecruiters(): Promise<void> {
    try {
      const deptRes: any = await this.approvalService.departments();
      const departments: any[] = deptRes?.data ?? [];
      const allowedNames = ['Recruiting Operations', 'Talent Acquisition'];
      const departmentIds = departments
        .filter((d: any) => allowedNames.includes(d?.name))
        .map((d: any) => d.id);

      const body = {
        page: 0,
        size: 200,
        sortBy: 'id',
        direction: 'DESC',
        filters: departmentIds.length ? { departmentIds } : {},
      };

      const res: any = await this.jobService.getRecruiters(body);
      if (res?.responsecode !== '00') return;

      const users = this.flattenRecruiters(res?.data);
      const recruiterOptions = [
        { value: '', label: 'All Recruiters' },
        ...users.map((u: any) => ({ value: u.userId, label: u.recruiterName })),
      ];

      
      const defaultRecruiter = users[0];
      if (defaultRecruiter) {
        this.selectedRecruiterId = defaultRecruiter.userId;
      }

      this.filterDropdowns = this.filterDropdowns.map((item: any) =>
        item.key === 'recruiter'
          ? { ...item, options: recruiterOptions, selected: defaultRecruiter ? defaultRecruiter.userId : '' }
          : item
      );
    } catch (error) {
      console.error('Failed to load recruiters', error);
    }
  }

  private flattenRecruiters(data: any): any[] {
    const departments: any[] = data?.departments ?? [];
    const recruiters: any[] = [];
    for (const dept of departments) {
      for (const role of dept?.roles ?? []) {
        for (const user of role?.users ?? []) {
          recruiters.push(user);
        }
      }
    }
    return recruiters;
  }

  pipelineConfig = {
    layout: 'funnel' as const,
    title: 'Recruitment Funnel',
    periods: ['This Month'],
    selectedPeriod: 'This Month',
    stages: [] as PipelineStage[],
    overallConversionLabel: 'Overall Conversion Rate',
    overallConversionRate: 0,
  };

  cards = [
    {
      label: 'Assignments',
      value: 0,
      iconClass: 'fa-solid fa-briefcase',
      iconBgColor: '#DBEAFE',
      iconColor: '#3B82F6',
    },
    {
      label: 'Applications Added',
      value: 0,
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#F3E8FF',
      iconColor: '#9333EA',
    },
    {
      label: 'Offers Released',
      value: 0,
      iconClass: 'fa-solid fa-gift',
      iconBgColor: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      label: 'Hired',
      value: 0,
      iconClass: 'fa-solid fa-user',
      iconBgColor: '#DCFCE7',
      iconColor: '#22C55E',
    },
    {
      label: 'SLA Compliance',
      value: '0',
      iconClass: 'fa-solid fa-shield-halved',
      iconBgColor: '#DBEAFE',
      iconColor: '#2563EB',
    },
  ];

  // ── Job Assignments table ─────────────────────────────────────────────────
  jobAssignments: JobAssignmentRow[] = [];

  // ── SLA Compliance rings (app-sla-compilance-component) ──────────────────
  slaAssignmentAcceptance: SlaFractionMetric = {
    label: 'Assignment Acceptance Rate',
    completed: 0,
    total: 0,
    color: '#2F80ED',
  };
  slaRequisitionFulfillment: SlaFractionMetric = {
    label: 'Requisition Fulfillment Rate',
    completed: 0,
    total: 0,
    color: '#8E44EC',
  };
  slaOnTimeFulfillment: SlaFractionMetric = {
    label: 'On-Time Fulfillment Rate',
    completed: 0,
    total: 0,
    color: '#F2994A',
  };
  slaOverallCompliancePercent = 0;
  slaChangeVsLastMonth: number | null = null;

  // On Track / At Risk / Overdue — derived from the job assignments table's
  // own slaStatus per row (see jobAssignmentsList below), not a separate API
  // call, so it always matches what's shown in the table.
  slaOnTrackCount = 0;
  slaAtRiskCount = 0;
  slaOverdueCount = 0;

  // ── Candidate Source Performance ──────────────────────────────────────────
  sourceTiles: SourceTile[] = [];
  sourceFootNote = 'Added / Interviewed / Offered / Hired counts per source';

  private readonly sourceColorPalette = ['#3B5BDB', '#6D28D9', '#15803D', '#EA580C', '#0D9488', '#B91C1C', '#0369A1'];

  // ── Hiring Trend ───────────────────────────────────────────────────────────
  trendCategories: string[] = [];
  trendSeries: LineSeriesInput[] = [];

  async getDashboardCount() {

    const obj = {
      sortBy: 'assignedAt',
      direction: 'DESC',
      filters: {
        recruiterId: this.selectedRecruiterId || '',
        fromDate: this.fromDate,
        toDate: this.toDate,
      },
    };

    const res: any = await this.dashboardService.getRecruiterPerformanceDashboardCount(obj);
    if (res.responsecode == '00') {
      const cardCount = res?.data?.dashboardCounts;
      const jobsList = res?.data?.assignments;

      this.cards = [
        {
          label: 'Assignments',
          value: cardCount?.totalAssignments,
          iconClass: 'fa-solid fa-briefcase',
          iconBgColor: '#DBEAFE',
          iconColor: '#3B82F6',
        },
        {
          label: 'Applications Added',
          value: cardCount?.applicationsAdded,
          iconClass: 'fa-solid fa-users',
          iconBgColor: '#F3E8FF',
          iconColor: '#9333EA',
        },
        {
          label: 'Offers Released',
          value: cardCount?.offersReleased,
          iconClass: 'fa-solid fa-gift',
          iconBgColor: '#FFEDD5',
          iconColor: '#F97316',
        },
        {
          label: 'Hired',
          value: cardCount?.hired ?? 0,
          iconClass: 'fa-solid fa-user',
          iconBgColor: '#DCFCE7',
          iconColor: '#22C55E',
        },
        {
          label: 'SLA Compliance',
          value: cardCount.slaCompliance,
          iconClass: 'fa-solid fa-shield-halved',
          iconBgColor: '#DBEAFE',
          iconColor: '#2563EB',
        },
      ];

      // Keep the SLA ring card in sync with the latest counts, when present.
      // Assignment Acceptance Rate = acceptedAssignments / totalAssignments —
      // both flat fields on cardCount (not a nested assignmentAcceptance object).
      if (cardCount?.totalAssignments != null || cardCount?.acceptedAssignments != null) {
        this.slaAssignmentAcceptance = {
          ...this.slaAssignmentAcceptance,
          completed: cardCount.acceptedAssignments ?? this.slaAssignmentAcceptance.completed,
          total: cardCount.totalAssignments ?? this.slaAssignmentAcceptance.total,
        };
      }
      if (cardCount?.onTimeFulfillment) {
        this.slaOnTimeFulfillment = {
          ...this.slaOnTimeFulfillment,
          completed: cardCount.onTimeFulfillment.completed ?? this.slaOnTimeFulfillment.completed,
          total: cardCount.onTimeFulfillment.total ?? this.slaOnTimeFulfillment.total,
        };
      }
      if (cardCount?.slaCompliance != null) {
        this.slaOverallCompliancePercent = parseFloat(cardCount.slaCompliance) || this.slaOverallCompliancePercent;
      }
      if (cardCount?.slaComplianceChangeVsLastMonth != null) {
        this.slaChangeVsLastMonth = cardCount.slaComplianceChangeVsLastMonth;
      }

      this.jobAssignments = this.jobAssignmentsList(jobsList);
      this.updateSlaBreakdown(this.jobAssignments);
      this.updateRequisitionFulfillment(this.jobAssignments);

      if (this.selectedJobId) {
        this.getRecruiterPerformanceDetail(this.selectedJobId);
      } else if (this.jobAssignments.length) {
        const firstJob = this.jobAssignments[0];
        this.selectedJobId = firstJob.jobId;
        this.selectedJobTitle = firstJob.jobTitle;
        this.getRecruiterPerformanceDetail(firstJob.jobId);
      }
    }
  }

  jobAssignmentsList(data: any) {
    return data.map((item: any) => ({
      jobTitle: item.jobTitle,
      assignmentStatus: item.assignmentStatus,
      acceptedOn: item.acceptedOn,
      priority: item.priority,
      requestedOpenings: item.requestedOpenings,
      filled: item.filled,
      remaining: item.remaining,
      targetDate: item.targetDate,
      daysDue: item.daysLeft,
      slaStatus: item.sla,
      jobId: item.jobId,
      srId: item.srId,
    }));
  }

  /** Counts each row's slaStatus into the three SLA-card buckets. "Completed"
   * rows aren't part of any of the three (they're already done, neither on a
   * clock nor overdue), so they're excluded from the total on purpose. */
  private updateSlaBreakdown(rows: JobAssignmentRow[]): void {
    this.slaOnTrackCount = rows.filter(r => r.slaStatus === 'On Track').length;
    this.slaAtRiskCount = rows.filter(r => r.slaStatus === 'At Risk').length;
    this.slaOverdueCount = rows.filter(r => r.slaStatus === 'Overdue').length;
  }

  /** Requisition Fulfillment Rate = total filled ÷ total (filled + remaining)
   * across every row in the Job Assignments table — same "filled"/"remaining"
   * columns already shown there, no separate API field for this one. */
  private updateRequisitionFulfillment(rows: JobAssignmentRow[]): void {
    const totalFilled = rows.reduce((sum, r: any) => sum + (Number(r.filled) || 0), 0);
    const totalRemaining = rows.reduce((sum, r: any) => sum + (Number(r.remaining) || 0), 0);

    this.slaRequisitionFulfillment = {
      ...this.slaRequisitionFulfillment,
      completed: totalFilled,
      total: totalFilled + totalRemaining,
    };
  }

  // ── Recruiter Performance Detail (drill-down on row click) ─────────────
  onJobRowClick(row: JobAssignmentRow): void {
    if (!row?.jobId) return;
    this.selectedJobId = row.jobId;
    this.selectedJobTitle = row.jobTitle;
    this.getRecruiterPerformanceDetail(row.jobId);
  }

  async getRecruiterPerformanceDetail(jobId: any): Promise<void> {
    if (!jobId) return;

    // Always send all four filters together — recruiter, job, and the full
    // date range — on every call, regardless of which one just changed.
    // `|| undefined` used to drop recruiterId from the JSON body entirely
    // whenever "All Recruiters" (empty string) was selected.
    const payload = {
      recruiterId: this.selectedRecruiterId || '',
      jobId,
      fromDate: this.fromDate,
      toDate: this.toDate,
    };

    try {
      const res: any = await this.dashboardService.getRecruiterPerformanceDetail(payload);
      if (res?.responsecode == '00') {
        const data = res?.data;

        this.sourceTiles = this.mapSourceTiles(data?.candidateSourcePerformance);

        const trend = this.mapHiringTrend(data?.hiringTrend);
        this.trendCategories = trend.categories;
        this.trendSeries = trend.series;

        this.pipelineConfig = {
          ...this.pipelineConfig,
          stages: this.mapFunnelStages(data?.recruitmentFunnel),
          overallConversionRate: this.computeOverallConversion(data?.recruitmentFunnel),
        };

        this.performanceDetailLoaded = true;
      } else {
        this.notificationService.error(res?.message || res?.responsemessage);
      }
    } catch (error) {
      console.error('Failed to load recruiter performance detail', error);
    }
  }

  private mapSourceTiles(sources: any[]): SourceTile[] {
    return (sources ?? []).map((s: any, index: number) => ({
      name: s.source,
      color: this.sourceColorPalette[index % this.sourceColorPalette.length],
      stats: [
        { label: 'Added', value: s.applicantsAdded ?? 0 },
        { label: 'Interviewed', value: s.interviewed ?? 0 },
        { label: 'Offered', value: s.offered ?? 0 },
        { label: 'Hired', value: s.hired ?? 0 },
      ],
    }));
  }

  private mapFunnelStages(funnel: any): PipelineStage[] {
    if (!funnel) return [];
    const steps = [
      { label: 'Applications Added', value: funnel.applications ?? 0, color: '#3B82F6' },
      { label: 'Screened', value: funnel.screening ?? 0, color: '#8B5CF6' },
      { label: 'Shortlisted', value: funnel.shortlisted ?? 0, color: '#F97316' },
      { label: 'Interviewed', value: funnel.interview ?? 0, color: '#22C55E' },
      { label: 'Offers Released', value: funnel.offersReleased ?? 0, color: '#EF4444' },
      { label: 'Offers Accepted', value: funnel.offersAccepted ?? 0, color: '#14B8A6' },
      { label: 'Hired', value: funnel.hired ?? 0, color: '#16A34A' },
    ];

    return steps.map((step, index) => ({
      label: step.label,
      value: step.value,
      conversionPct: index === 0 ? 100 : this.pct(step.value, steps[index - 1].value),
      iconClass: '',
      iconColor: step.color,
      iconBgColor: '',
    }));
  }

  private computeOverallConversion(funnel: any): number {
    if (!funnel?.applications) return 0;
    return this.pct(funnel.hired ?? 0, funnel.applications);
  }

  private pct(value: number, base: number): number {
    if (!base) return 0;
    return Math.round((value / base) * 1000) / 10;
  }

  /** Daily points get noisy on a line chart the longer the range gets, so:
   * <= 7 days → plotted per-day, <= 60 days (~2 months) → rolled up into
   * weekly buckets, beyond that → rolled up into monthly buckets. */
  private mapHiringTrend(days: any[]): { categories: string[]; series: LineSeriesInput[] } {
    const data = days ?? [];
    let buckets: { label: string; candidatesAdded: number; hired: number; offersReleased: number }[];

    if (data.length > 60) {
      buckets = this.bucketByMonth(data);
    } else if (data.length > 7) {
      buckets = this.bucketByWeek(data);
    } else {
      buckets = data.map((d: any) => ({
        label: this.formatDayLabel(d.date),
        candidatesAdded: Number(d.candidatesAdded) || 0,
        hired: Number(d.hired) || 0,
        offersReleased: Number(d.offersReleased) || 0,
      }));
    }

    return {
      categories: buckets.map(b => b.label),
      series: [
        { name: 'Hired', data: buckets.map(b => b.hired), color: '#16A34A' },
        { name: 'Offers Released', data: buckets.map(b => b.offersReleased), color: '#F97316' },
        { name: 'Candidates Added', data: buckets.map(b => b.candidatesAdded), color: '#8B5CF6' },
      ],
    };
  }

  private bucketByWeek(days: any[]): { label: string; candidatesAdded: number; hired: number; offersReleased: number }[] {
    const sorted = [...days].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const firstDate = new Date(sorted[0].date);

    const weeks: Record<string, { start: string; end: string; candidatesAdded: number; hired: number; offersReleased: number }> = {};

    sorted.forEach((d: any) => {
      const current = new Date(d.date);
      const diffDays = Math.floor((current.getTime() - firstDate.getTime()) / 86400000);
      const weekIndex = Math.floor(diffDays / 7);
      const key = `week-${weekIndex}`;

      if (!weeks[key]) {
        weeks[key] = { start: d.date, end: d.date, candidatesAdded: 0, hired: 0, offersReleased: 0 };
      }
      weeks[key].end = d.date;
      weeks[key].candidatesAdded += Number(d.candidatesAdded) || 0;
      weeks[key].hired += Number(d.hired) || 0;
      weeks[key].offersReleased += Number(d.offersReleased) || 0;
    });

    return Object.values(weeks).map(w => ({
      label: `${this.formatDayLabel(w.start)} - ${this.formatDayLabel(w.end)}`,
      candidatesAdded: w.candidatesAdded,
      hired: w.hired,
      offersReleased: w.offersReleased,
    }));
  }

  private bucketByMonth(days: any[]): { label: string; candidatesAdded: number; hired: number; offersReleased: number }[] {
    const sorted = [...days].sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const months: Record<string, { date: Date; candidatesAdded: number; hired: number; offersReleased: number }> = {};

    sorted.forEach((d: any) => {
      const current = new Date(d.date);
      const key = `${current.getFullYear()}-${current.getMonth()}`;

      if (!months[key]) {
        months[key] = { date: current, candidatesAdded: 0, hired: 0, offersReleased: 0 };
      }
      months[key].candidatesAdded += Number(d.candidatesAdded) || 0;
      months[key].hired += Number(d.hired) || 0;
      months[key].offersReleased += Number(d.offersReleased) || 0;
    });

    return Object.values(months).map(m => ({
      label: this.formatMonthLabel(m.date),
      candidatesAdded: m.candidatesAdded,
      hired: m.hired,
      offersReleased: m.offersReleased,
    }));
  }

  private formatDayLabel(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  private formatMonthLabel(date: Date): string {
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }
}