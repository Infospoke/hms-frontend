import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { DashboardCountCardComponent } from '../../../../shared/components/dashboard-count-card/dashboard-count-card.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { SemiCircleGaugeComponent } from '../../../../shared/components/semi-circle-gauge/semi-circle-gauge.component';
import { SankeyNode, SankeyLink } from '../../../../shared/components/sankey-diagram/sankey-diagram.component';
import { DonutPieChartComponent, DonutSegment } from '../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component';
import { NgxApexsankeyComponent } from 'ngx-apexsankey';
import type { GraphData, SankeyOptions } from 'ngx-apexsankey';
import { AuthService } from '../../../../core/auth/auth.service';
import { DateRangePickerComponent, DateRange } from '../../../../shared/components/date-range-picker/date-range-picker.component';
import { DashboardService } from '../../services/dashboard.service';

export interface KpiCard {
  label: string; value: string | number;
  iconClass: string; iconColor: string; iconBgColor: string;
}

export interface PipelineStage {
  label: string; value: number; color: string; conversionPct?: number;
}

export interface OfferStatusBar {
  label: string; count: number; color: string;
}

export interface HiringManagerAnalyticsResponse {
  candidatePipeline: {
    applied: number; screening: number; interview: number; offer: number; hired: number;
    screeningPercentage: number; interviewPercentage: number; offerPercentage: number;
    hiredPercentage: number; overallConversionRate: number;
  };
  candidateQuality: {
    excellent: number; good: number; average: number; needsReview: number; totalCandidates: number;
  };
  hiringHealth: {
    pipelineCoverage: number; offerProgress: number; candidateQuality: number;
    requisitionsOnTrack: number; agingRequisitions: number;
  };
  negotiationFlow: {
    negotiationRequest: number | null; hrReview: number | null; underReview: number | null;
    reReleaseOffer: number | null; candidateAccepted: number | null; candidateRejected: number | null;
  };
  offerStatusFlow: {
    offerRequestByHR: number; underReviewApproval: number; offerReleased: number;
    offerAccepted: number; offerRejected: number;
  };
}

@Component({
  selector: 'app-hiring-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DashboardLayoutComponent, DashboardCountCardComponent,
    ReusableTableComponent, SemiCircleGaugeComponent,
    DonutPieChartComponent,
    NgxApexsankeyComponent,
    DateRangePickerComponent
  ],
  templateUrl: './hiring-manager-dashboard.component.html',
  styleUrl: './hiring-manager-dashboard.component.scss',
})
export class HiringManagerDashboardComponent implements OnInit {

  @ViewChild('reqCellTpl') reqCellTpl!: TemplateRef<any>;
  @ViewChild('healthCellTpl') healthCellTpl!: TemplateRef<any>;
  selectedSrId: any = '';
  heading = `Good morning, Divya! 👋`;
  subHeading = "Here's what's happening with your hiring.";
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  pipelineFrom = ''; pipelineTo = '';
  offerStatusFrom = ''; offerStatusTo = '';
  negoFrom = ''; negoTo = '';

  // ── Analytics date range (from the date-range-picker) ────────────────────
  analyticsFromDate: string = '';
  analyticsToDate: string = '';
  isAnalyticsLoading = false;
  analyticsError: string | null = null;

  
  kpiCards: KpiCard[] = [
    { label: 'Open SRs', value: 0, iconClass: 'fa-solid fa-briefcase', iconColor: '#3B82F6', iconBgColor: '#DBEAFE' },
    { label: 'Total Candidates', value: 0, iconClass: 'fa-solid fa-users', iconColor: '#10B981', iconBgColor: '#D1FAE5' },
    { label: 'Interviews', value: 0, iconClass: 'fa-solid fa-user-check', iconColor: '#8B5CF6', iconBgColor: '#EDE9FE' },
    { label: 'Offers Released', value: 0, iconClass: 'fa-solid fa-file-signature', iconColor: '#F97316', iconBgColor: '#FFEDD5' },
    { label: 'Hired', value: 0, iconClass: 'fa-solid fa-clock', iconColor: '#6366F1', iconBgColor: '#E0E7FF' },
  ];
  reqData: any[] = [];
  reqColumns: TableColumn[] = [
    { key: 'position', label: 'Position', width: '110px' },
    { key: 'openings', label: 'Openings', width: '110px', align: 'center' },
    { key: 'hired', label: 'Hired', width: '50px', align: 'center' },
    { key: 'inProgress', label: 'In-Progress', width: '50px', align: 'center' },
    { key: 'targetStart', label: 'Target Start Date', width: '150px', align: 'center', custom: true },
    { key: 'priority', label: 'Priority', width: '50px', align: 'center', custom: true },
    { key: 'slaStatus', label: 'SLA Status', width: '50px', align: 'center', custom: true },
  ];
  async ngOnInit(): Promise<void> {
    this.handleHeading();
    await this.getHiringManagerDashboardCount();

    if (this.selectedSrId) {
      await this.loadDashboardAnalytics();
    }
  }

  handleHeading() {
    const date = new Date();
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) {
      this.heading = `Good morning, ${this.authService.getUserNameByToken()}! 👋`;
    }
    else if (hours >= 12 && hours < 17) {
      this.heading = `Good afternoon, ${this.authService.getUserNameByToken()}! 👋`;
    }
    else {
      this.heading = `Good evening, ${this.authService.getUserNameByToken()}! 👋`;
    }

  }
  async getHiringManagerDashboardCount() {
    const res: any = await this.dashboardService.getHiringManagerDashboardCount();
    if (res?.responsecode == '00') {
      const data = res.data;
      const cards = data?.cards;
      this.kpiCards[0].value = cards?.openSrs ?? 0;
      this.kpiCards[1].value = cards?.totalCandidates ?? 0;
      this.kpiCards[2].value = cards?.interviews ?? 0;
      this.kpiCards[3].value = cards?.offers ?? 0;
      this.kpiCards[4].value = cards?.averageHiringAge ?? 0;
      this.reqData = this.mapRequisitions(data?.myRequisitions);
      this.selectedSrId = data?.myRequisitions?.[0]?.srId ?? '';
    }
  }
  

  private mapRequisitions(list: any[]): any[] {
    return (list ?? []).map((item: any) => {
      const totalOpenings = item?.totalOpenings ?? 0;
      const yetToFill = item?.yetToFill ?? 0;
      const inProgress = item?.inProgress ?? 0;
      
      const hired = Math.max(totalOpenings - yetToFill - inProgress, 0);

      return {
        position: item?.position ?? '—',
        openings: totalOpenings,
        hired,
        inProgress,
        srId: item?.srId ?? '',
        jobId:item?.jobId??'',
        targetStart: this.formatDisplayDate(item?.targetStartDate),
        daysRemaining: item?.daysRemaining ?? 0,
        priority: item?.priority ?? '—',
        slaStatus: this.normalizeSlaStatus(item?.slaStatus),
      };
    });
  }

  // "2026-06-30" → "30 Jun 2026"
  private formatDisplayDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '—';
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // API returns "Over Due" (with a space); badge classes expect "Overdue".
  private normalizeSlaStatus(status: string | null | undefined): string {
    if (!status) return '—';
    return status === 'Over Due' ? 'Overdue' : status;
  }



  pipelineStages: PipelineStage[] = [
    { label: 'Applied', value: 0, color: '#3B82F6' },
    { label: 'Screening', value: 0, color: '#14B8A6', conversionPct: 50 },
    { label: 'Interview', value: 0, color: '#8B5CF6', conversionPct: 33 },
    { label: 'Offer', value: 0, color: '#F97316', conversionPct: 24 },
    { label: 'Hired', value: 0, color: '#22C55E', conversionPct: 40 },
  ];

  // Stages that have a conversion percentage (drives the ring row under the funnel)
  get pipelineConversions(): PipelineStage[] {
    return (this.pipelineStages ?? []).filter(s => s.conversionPct !== undefined);
  }


  getRingBackground(stage: PipelineStage): string {
    const pct = Math.max(0, Math.min(100, stage.conversionPct ?? 0));
    const deg = (pct / 100) * 360;
    return `conic-gradient(${stage.color} ${deg}deg, #E5E7EB ${deg}deg)`;
  }

  // ── Offer Status — Horizontal Bars ────────────────────────────────────────
  offerStatusBars: OfferStatusBar[] = [
    { label: 'Offer Requests', count: 0, color: '#3B82F6' },
    { label: 'Pending Approval', count: 0, color: '#F59E0B' },
    { label: 'Approved', count: 0, color: '#22C55E' },
    { label: 'Offer Released', count: 0, color: '#8B5CF6' },
    { label: 'Offer Accepted', count: 0, color: '#10B981' },
    { label: 'Declined', count: 0, color: '#EF4444' },
  ];

  get offerStatusMax(): number {
    return Math.max(...this.offerStatusBars.map(b => b.count), 1);
  }

  getOfferBarPct(count: number): number {
    return Math.round((count / this.offerStatusMax) * 100);
  }


  sankeyNodes: SankeyNode[] = [
    { id: 'released', label: 'Offer Released', value: 0, color: '#8B5CF6', column: 0 },
    { id: 'negotiating', label: 'In Negotiation', value: 0, color: '#3B82F6', column: 1 },
    { id: 'accepted_direct', label: 'Directly Accepted', value: 0, color: '#22C55E', column: 1 },
    { id: 'mgr_review', label: 'Manager Review', value:0, color: '#F59E0B', column: 2 },
    { id: 'counter', label: 'Counter Offered', value: 0, color: '#F97316', column: 2 },
    { id: 'closed_accepted', label: 'Closed (Accepted)', value: 0, color: '#16a34a', column: 3 },
    { id: 'closed_declined', label: 'Closed (Declined)', value:0, color: '#EF4444', column: 3 },
  ];

  sankeyLinks: SankeyLink[] = [
    { source: 'released', target: 'negotiating', value: 0 },
    { source: 'released', target: 'accepted_direct', value: 0 },
    { source: 'negotiating', target: 'mgr_review', value: 0 },
    { source: 'negotiating', target: 'counter', value: 0 },
    { source: 'mgr_review', target: 'closed_accepted', value: 0 },
    { source: 'mgr_review', target: 'closed_declined', value:0 },
    { source: 'counter', target: 'closed_accepted', value: 0 },
    { source: 'accepted_direct', target: 'closed_accepted', value: 0 },
    { source: 'accepted_direct', target: 'closed_declined', value: 0 },
  ];

  apexSankeyData: GraphData = {
    nodes: [
      { id: 'released', title: 'Offers Released', color: '#8B5CF6' },
      { id: 'neg_started', title: 'Negotiation Started', color: '#3B82F6' },
      { id: 'mgr_review', title: 'Manager Review', color: '#22C55E' },
      { id: 'counter', title: 'Counter Offered', color: '#7C3AED' },
      { id: 'fop', title: 'Final Offer Pending', color: '#F59E0B' },
      { id: 'closed_accepted', title: 'Closed (Accepted)', color: '#16a34a' },
      { id: 'closed_declined', title: 'Closed (Declined)', color: '#EF4444' },
    ],
    edges: [
      { source: 'released', target: 'neg_started', value: 0, type: 'flow' },
      { source: 'released', target: 'mgr_review', value: 0, type: 'flow' },
      { source: 'released', target: 'counter', value: 0, type: 'flow' },
      { source: 'neg_started', target: 'fop', value: 0, type: 'flow' },
      { source: 'neg_started', target: 'closed_accepted', value: 0, type: 'flow' },
      { source: 'neg_started', target: 'closed_declined', value: 0, type: 'flow' },
      { source: 'mgr_review', target: 'closed_accepted', value: 0, type: 'flow' },
      { source: 'counter', target: 'closed_declined', value: 0, type: 'flow' },
    ],
  };

  apexSankeyOptions: Partial<SankeyOptions> = {
    width: '100%',
    height: '100%',
    nodeWidth: 22,
    spacing: 24,
    edgeGradientFill: true,
    edgeOpacity: 0.52,
    edgeGap: 2,
    fontSize: '11px',
    fontFamily: 'Inter, sans-serif',
    fontColor: '#374151',
    enableToolbar: false,
    highlightOnHover: true,
    dimOnHover: true,
    enableAnimation: true,
    animationDuration: 800,
  };

  // ── Candidate Quality — Donut ─────────────────────────────────────────────
  candidateQualitySegments: DonutSegment[] = [
    { label: 'Excellent (90–100)', value: 0, color: '#10B981' },
    { label: 'Good (80–89)', value: 0, color: '#3B82F6' },
    { label: 'Average (70–79)', value: 0, color: '#F59E0B' },
    { label: 'Needs Review (<70)', value: 0, color: '#EF4444' },
  ];

  // ── Hiring Health — Gauge + Table ─────────────────────────────────────────
  hiringHealthScore = 0;

  healthColumns: TableColumn[] = [
    { key: 'metric', label: 'Metric', width: '52%' },
    { key: 'score', label: 'Score', width: '18%', align: 'center' },
    { key: 'status', label: 'Status', width: '30%', align: 'center', custom: true },
  ];

  healthData = [
    { metric: 'Pipeline Coverage', score: '0%', status: 'Excellent' },
    { metric: 'Offer Progress', score: '0%', status: 'Good' },
    { metric: 'Candidate Quality', score: '0%', status: 'Excellent' },
    { metric: 'Requisitions On Track', score: '0%', status: 'Good' },
    { metric: 'SLA Compliance', score: '0%', status: 'Fair' },
  ];



  
  onDateRangeChange(range: DateRange): void {
    this.analyticsFromDate = range.startDate;
    this.analyticsToDate = range.endDate;
    
    this.loadDashboardAnalytics();
  }

  async loadDashboardAnalytics(): Promise<void> {
    if (!this.selectedSrId) {
      return;
    }

    this.isAnalyticsLoading = true;
    this.analyticsError = null;

    try {
      const res: any = await this.dashboardService.getHiringManagerDashboardData(
        this.selectedSrId,
        this.analyticsFromDate,
        this.analyticsToDate
      );

      if (res?.responsecode === '00' && res?.data) {
        this.mapAnalyticsResponse(res.data);
      } else {
        this.analyticsError = res?.message || 'Failed to load analytics.';
      }
    } catch (err) {
      this.analyticsError = 'Something went wrong while loading analytics.';
      console.error('getHiringManagerDashboardAnalytics failed', err);
    } finally {
      this.isAnalyticsLoading = false;
    }
  }

  private mapAnalyticsResponse(data: HiringManagerAnalyticsResponse): void {
    this.mapCandidatePipeline(data.candidatePipeline);
    this.mapCandidateQuality(data.candidateQuality);
    this.mapHiringHealth(data.hiringHealth);
    this.mapOfferStatusFlow(data.offerStatusFlow);
    this.mapNegotiationFlow(data.negotiationFlow);
  }

  private mapCandidatePipeline(cp: HiringManagerAnalyticsResponse['candidatePipeline']): void {
    if (!cp) return;
    const applied = cp.applied ?? 0;
    const screening = cp.screening ?? 0;
    const interview = cp.interview ?? 0;
    const offer = cp.offer ?? 0;
    const hired = cp.hired ?? 0;

    this.pipelineStages = [
      { label: 'Applied', value: applied, color: '#3B82F6' },
      { label: 'Screening', value: screening, color: '#14B8A6', conversionPct: this.calcConversionPct(screening, applied) },
      { label: 'Interview', value: interview, color: '#8B5CF6', conversionPct: this.calcConversionPct(interview, screening) },
      { label: 'Offer', value: offer, color: '#F97316', conversionPct: this.calcConversionPct(offer, interview) },
      { label: 'Hired', value: hired, color: '#22C55E', conversionPct: this.calcConversionPct(hired, offer) },
    ];
  }

  // Stage-over-stage conversion %, e.g. Screening→Interview = interview/screening * 100.
  // Guards against divide-by-zero when the prior stage has no candidates.
  private calcConversionPct(current: number, previous: number): number {
    if (!previous) return 0;
    return Math.round((current / previous) * 100);
  }

  private mapCandidateQuality(cq: HiringManagerAnalyticsResponse['candidateQuality']): void {
    if (!cq) return;
    this.candidateQualitySegments = [
      { label: 'Excellent (90–100)', value: cq.excellent ?? 0, color: '#10B981' },
      { label: 'Good (80–89)', value: cq.good ?? 0, color: '#3B82F6' },
      { label: 'Average (70–79)', value: cq.average ?? 0, color: '#F59E0B' },
      { label: 'Needs Review (<70)', value: cq.needsReview ?? 0, color: '#EF4444' },
    ];
  }

  private mapHiringHealth(hh: HiringManagerAnalyticsResponse['hiringHealth']): void {
    if (!hh) return;

    const metrics: { metric: string; score: number }[] = [
      { metric: 'Pipeline Coverage', score: hh.pipelineCoverage ?? 0 },
      { metric: 'Offer Progress', score: hh.offerProgress ?? 0 },
      { metric: 'Candidate Quality', score: hh.candidateQuality ?? 0 },
      { metric: 'Requisitions On Track', score: hh.requisitionsOnTrack ?? 0 },
      { metric: 'Aging Requisitions', score: hh.agingRequisitions ?? 0 },
    ];

    this.healthData = metrics.map(m => ({
      metric: m.metric,
      score: `${m.score}%`,
      status: this.getHealthStatus(m.score),
    }));

    // Overall gauge score = average of the individual health metrics.
    const avg = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
    this.hiringHealthScore = Math.round(avg);
  }

  private getHealthStatus(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Critical';
  }

  private mapOfferStatusFlow(osf: HiringManagerAnalyticsResponse['offerStatusFlow']): void {
    if (!osf) return;
    this.offerStatusBars = [
      { label: 'Offer Requests', count: osf.offerRequestByHR ?? 0, color: '#3B82F6' },
      { label: 'Pending Approval', count: osf.underReviewApproval ?? 0, color: '#F59E0B' },
      { label: 'Offer Released', count: osf.offerReleased ?? 0, color: '#8B5CF6' },
      { label: 'Offer Accepted', count: osf.offerAccepted ?? 0, color: '#10B981' },
      { label: 'Declined', count: osf.offerRejected ?? 0, color: '#EF4444' },
    ];
  }

  
  private mapNegotiationFlow(nf: HiringManagerAnalyticsResponse['negotiationFlow']): void {
    if (!nf) return;

    const edges: GraphData['edges'] = [];

    if (nf.negotiationRequest) {
      edges.push({ source: 'released', target: 'neg_started', value: nf.negotiationRequest, type: 'flow' });
    }
    if (nf.hrReview) {
      edges.push({ source: 'neg_started', target: 'mgr_review', value: nf.hrReview, type: 'flow' });
    }
    if (nf.underReview) {
      edges.push({ source: 'mgr_review', target: 'fop', value: nf.underReview, type: 'flow' });
    }
    if (nf.reReleaseOffer) {
      edges.push({ source: 'fop', target: 'counter', value: nf.reReleaseOffer, type: 'flow' });
    }
    if (nf.candidateAccepted) {
      edges.push({ source: 'fop', target: 'closed_accepted', value: nf.candidateAccepted, type: 'flow' });
    }
    if (nf.candidateRejected) {
      edges.push({ source: 'fop', target: 'closed_declined', value: nf.candidateRejected, type: 'flow' });
    }

    // Keep the existing node list/colors; only swap edges if we actually got data,
    // so the chart doesn't render blank when the period has no negotiation activity.
    if (edges.length > 0) {
      this.apexSankeyData = { ...this.apexSankeyData, edges };
    }
  }
  handleData(data:any){
    console.log('data',data);
    this.selectedSrId = data?.srId ?? '';
    this.loadDashboardAnalytics();
  }
}