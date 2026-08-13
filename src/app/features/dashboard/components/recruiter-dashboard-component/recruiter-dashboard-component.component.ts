import { Component, inject, OnInit } from '@angular/core';
import { DashboardLayoutComponent, RequisitionsTableConfig } from '../dashboard-layout/dashboard-layout.component';
import { TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { DashboardService } from '../../services/dashboard.service';

interface DateRange {
  fromDate: string; // 'YYYY-MM-DD'
  toDate: string;   // 'YYYY-MM-DD'
}

@Component({
  selector: 'app-recruiter-dashboard-component',
  imports: [DashboardLayoutComponent],
  templateUrl: './recruiter-dashboard-component.component.html',
  styleUrl: './recruiter-dashboard-component.component.scss',
})
export class RecruiterDashboardComponentComponent implements OnInit {

  ngOnInit(): void {
    this.getDashboardCount();
  }

  private dashboardService = inject(DashboardService)


  selectedJobId: any = null;

  dateRange: DateRange = this.getDefaultDateRange();

  private getDefaultDateRange(): DateRange {
    return {
      fromDate: '',
      toDate: ''
    };
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onDateRangeChange(data: any) {
    this.dateRange = {
      fromDate: data?.startDate,
      toDate: data.endDate || this.dateRange.toDate
    };

    if (this.selectedJobId) {
      this.getDashboardCharts(this.selectedJobId);
    }
  }

  cards = [
    {
      label: 'My Assigned SRs',
      value: 0,
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#E8F8EE',
      iconColor: '#16A34A',
      trend: 'up' as const,
    },
    {
      label: 'Active Candidates',
      value: 0,
      iconClass: 'fa-solid fa-user-group',
      iconBgColor: '#E8F8EE',
      iconColor: '#16A34A',
    },
    {
      label: 'Total Openings',
      value: 0,
      iconClass: 'fa-regular fa-clipboard',
      iconBgColor: '#F3E8FF',
      iconColor: '#7C3AED',
      trend: 'up' as const,
    },
    {
      label: 'Filled (My vs Team)',
      value: '0/0',
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#E8F0FF',
      iconColor: '#2563EB',
      trend: 'up' as const,
    },
    {
      label: 'Yet to Fill',
      value: 0,
      iconClass: 'fa-regular fa-clock',
      iconBgColor: '#FFF4E5',
      iconColor: '#F59E0B',
      trend: 'down' as const,
    },
    {
      label: 'In Progress',
      value: 0,
      iconClass: 'fa-solid fa-chart-line',
      iconBgColor: '#E6FFFB',
      iconColor: '#0F9D9A',
      trend: 'down' as const,
    }
  ];

  showTable = true;

  requisitionsColumns: TableColumn[] = [
    { key: 'srName', label: 'SR Name', width: '10%' },
    { key: 'priority', label: 'Priority', width: '12%', align: 'center', custom: true },
    { key: 'targetStartDate', label: 'Target Start Date', width: '12%', custom: true },
    { key: 'openings', label: 'Openings', width: '14%', align: 'center' },
    { key: 'my', label: 'My', width: '14%', align: 'center', group: 'Filled' },
    { key: 'team', label: 'Team', width: '10%', align: 'center', group: 'Filled' },
    { key: 'inProgress', label: 'In Progress', width: '14%', align: 'center' },
    { key: 'daysRemaining', label: 'Days Remaining', width: '14%', align: 'center', custom: true },
    { key: 'slaStatus', label: 'SLA Status', width: '12%', align: 'center', custom: true }
  ];

  requisitionsData: any[] = [];
  tableConfig: RequisitionsTableConfig = {
    title: 'My Assigned SRs',
    columns: this.requisitionsColumns,
    data: this.requisitionsData,
  };

  pipelineConfig = {
    layout: 'funnel' as const,
    title: 'My Conversion Funnel',
    stages: [
      { label: 'Applications', value: 0, conversionPct: 0, iconClass: '', iconColor: '#2563EB', iconBgColor: '' },
      { label: 'Screening', value: 0, conversionPct: 0, iconClass: '', iconColor: '#0EA5E9', iconBgColor: '' },
      { label: 'Shortlisted', value: 0, conversionPct: 0, iconClass: '', iconColor: '#10B981', iconBgColor: '' },
      { label: 'Interview', value: 0, conversionPct: 0, iconClass: '', iconColor: '#F59E0B', iconBgColor: '' },
      { label: 'Offer', value: 0, conversionPct: 0, iconClass: '', iconColor: '#8B5CF6', iconBgColor: '' },
      { label: 'Hired', value: 0, conversionPct: 0, iconClass: '', iconColor: '#3B82F6', iconBgColor: '' }
    ],
    overallConversionLabel: 'Overall Conversion Rate',
    overallConversionRate: 0
  };

  offerStatusChart = {
    title: 'Offer Status Flow',
    centerLabel: 'Total',
    size: 300,
    segments: [
      { label: 'Offer Requests by HR', value: 0, color: '#2563EB', percentage: 0 },
      { label: 'Under Review & Approval', value: 0, color: '#22C1C3', percentage: 0 },
      { label: 'Offer Released', value: 0, color: '#F59E0B', percentage: 0 },
      { label: 'Offer Accepted', value: 0, color: '#7C3AED', percentage: 0 },
      { label: 'Offer Rejected', value: 0, color: '#EF4444', percentage: 0 }
    ]
  };

  negotiationChart = {
    title: 'Negotiation Flow',
    centerLabel: 'Total',
    size: 250,
    segments: [
      { label: 'Negotiation Request', value: 0, color: '#2563EB', percentage: 0 },
      { label: 'HR Review', value: 0, color: '#22C1C3', percentage: 0 },
      { label: 'Under Review & Approval', value: 0, color: '#22C1C3', percentage: 0 },
      { label: 'Re-release Offer', value: 0, color: '#6CC24A', percentage: 0 },
      { label: 'Candidate Accepted', value: 0, color: '#7C3AED', percentage: 0 },
      { label: 'Candidate Rejected', value: 0, color: '#F59E0B', percentage: 0 }
    ]
  };

  pieCharts = [
    this.offerStatusChart,
    this.negotiationChart
  ];

  bubbleChart = {
    title: 'Source Performance (This Month)',
    bubbles: [] as { label: string; value: number; color: string; size: number; percentage: number }[],
    tableData: [] as { source: string; hires: number; cost: string }[]
  };

  /** Shared percentage helper — used everywhere below */
  private calcPercentage(value: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.round((value / total) * 100);
  }

  async getDashboardCount() {

    const res: any = await this.dashboardService.getRecruiterManagerDashboardCount();
    if (res.responsecode == '00') {
      const cardCount = res?.data?.cards;
      const jobsList = res?.data?.myAssignedJobsDto;

      this.cards = [
        {
          label: 'My Assigned SRs',
          value: cardCount.myApprovedSRs,
          iconClass: 'fa-solid fa-users',
          iconBgColor: '#E8F8EE',
          iconColor: '#16A34A',
          trend: 'up' as const,
        },
        {
          label: 'Active Candidates',
          value: cardCount.activeCandidates,
          iconClass: 'fa-solid fa-user-group',
          iconBgColor: '#E8F8EE',
          iconColor: '#16A34A',
        },
        {
          label: 'Total Openings',
          value: cardCount.totalOpenings,
          iconClass: 'fa-regular fa-clipboard',
          iconBgColor: '#F3E8FF',
          iconColor: '#7C3AED',
          trend: 'up' as const,
        },
        {
          label: 'Filled (My vs Team)',
          value: `${cardCount.my ?? 0}/${cardCount.team ?? 0}`,
          iconClass: 'fa-solid fa-users',
          iconBgColor: '#E8F0FF',
          iconColor: '#2563EB',
          trend: 'up' as const,
        },
        {
          label: 'Yet to Fill',
          value: cardCount.yetToFill,
          iconClass: 'fa-regular fa-clock',
          iconBgColor: '#FFF4E5',
          iconColor: '#F59E0B',
          trend: 'down' as const,
        },
        {
          label: 'In Progress',
          value: cardCount.inProgress,
          iconClass: 'fa-solid fa-chart-line',
          iconBgColor: '#E6FFFB',
          iconColor: '#0F9D9A',
          trend: 'down' as const,
        }
      ];

      this.tableConfig = {
        ...this.tableConfig,
        data: this.mapApiListResponse(jobsList)
      };

      this.selectedJobId = jobsList?.[0]?.jobId;
      if (this.selectedJobId) {
        this.getDashboardCharts(this.selectedJobId);
      }
    }
  }

  async getDashboardCharts(id: any) {
    this.selectedJobId = id;

    const res: any = await this.dashboardService.getRecruriterDashboardAnalytics(
      id,
      this.dateRange.fromDate,
      this.dateRange.toDate
    );
    const data = res?.data ?? res;
    if (!data) return;

    this.mapConversionFunnel(data.conversionFunnel);
    this.offerStatusFlow(data.offerStatusFlow);
    this.mapNegotiationFlow(data.negotiationFlow);
    this.mapSourcePerformance(data.sourcePerformance);

    this.pieCharts = [this.offerStatusChart, this.negotiationChart];
  }

  private mapApiListResponse(data: any) {
    return data?.map((item: any) => ({
      srName: item.position,
      priority: item.priority,
      targetStartDate: item.targetStartDate,
      openings: item.totalOpenings,
      my: item.my,
      team: item.team,
      inProgress: item.inProgress,
      daysRemaining: item.daysRemaining,
      slaStatus: item.slaStatus,
      srId: item.srId,
      jobId: item.jobId,
    }));
  }

  private mapConversionFunnel(funnel: any) {
    if (!funnel) return;

    const applications = funnel.applications ?? 0;
    const screening = funnel.screening ?? 0;
    const shortlisted = funnel.shortlisted ?? 0;
    const interview = funnel.interview ?? 0;
    const offers = funnel.offers ?? 0;
    const hired = funnel.hired ?? 0;

    this.pipelineConfig = {
      ...this.pipelineConfig,
      stages: [
        { label: 'Applications', value: applications, conversionPct: this.calcPercentage(applications, applications), iconClass: '', iconColor: '#2563EB', iconBgColor: '' },
        { label: 'Screening', value: screening, conversionPct: this.calcPercentage(screening, applications), iconClass: '', iconColor: '#0EA5E9', iconBgColor: '' },
        { label: 'Shortlisted', value: shortlisted, conversionPct: this.calcPercentage(shortlisted, applications), iconClass: '', iconColor: '#10B981', iconBgColor: '' },
        { label: 'Interview', value: interview, conversionPct: this.calcPercentage(interview, applications), iconClass: '', iconColor: '#F59E0B', iconBgColor: '' },
        { label: 'Offer', value: offers, conversionPct: this.calcPercentage(offers, applications), iconClass: '', iconColor: '#8B5CF6', iconBgColor: '' },
        { label: 'Hired', value: hired, conversionPct: this.calcPercentage(hired, applications), iconClass: '', iconColor: '#3B82F6', iconBgColor: '' }
      ],
      overallConversionRate: this.calcPercentage(hired, applications)
    };
  }

  private offerStatusFlow(flow: any) {
    if (!flow) return;  

    const values = {
      offerRequestByHR: flow.offerRequestByHR ?? 0,
      underReviewApproval: flow.underReviewApproval ?? 0,
      offerReleased: flow.offerReleased ?? 0,
      offerAccepted: flow.offerAccepted ?? 0,
      offerRejected: flow.offerRejected ?? 0,
    };

    const total = Object.values(values).reduce((sum, v) => sum + v, 0);

    this.offerStatusChart = {
      ...this.offerStatusChart,
      segments: [
        { label: 'Offer Requests by HR', value: values.offerRequestByHR, color: '#2563EB', percentage: this.calcPercentage(values.offerRequestByHR, total) },
        { label: 'Under Review & Approval', value: values.underReviewApproval, color: '#22C1C3', percentage: this.calcPercentage(values.underReviewApproval, total) },
        { label: 'Offer Released', value: values.offerReleased, color: '#F59E0B', percentage: this.calcPercentage(values.offerReleased, total) },
        { label: 'Offer Accepted', value: values.offerAccepted, color: '#7C3AED', percentage: this.calcPercentage(values.offerAccepted, total) },
        { label: 'Offer Rejected', value: values.offerRejected, color: '#EF4444', percentage: this.calcPercentage(values.offerRejected, total) }
      ]
    };
  }

  private mapNegotiationFlow(flow: any) {
    if (!flow) return;

    const values = {
      negotiationRequest: flow.negotiationRequest ?? 0,
      hrReview: flow.hrReview ?? 0,
      underReview: flow.underReview ?? 0,
      reReleaseOffer: flow.reReleaseOffer ?? 0,
      candidateAccepted: flow.candidateAccepted ?? 0,
      candidateRejected: flow.candidateRejected ?? 0,
    };

    const total = Object.values(values).reduce((sum, v) => sum + v, 0);

    this.negotiationChart = {
      ...this.negotiationChart,
      segments: [
        { label: 'Negotiation Request', value: values.negotiationRequest, color: '#2563EB', percentage: this.calcPercentage(values.negotiationRequest, total) },
        { label: 'HR Review', value: values.hrReview, color: '#22C1C3', percentage: this.calcPercentage(values.hrReview, total) },
        { label: 'Under Review & Approval', value: values.underReview, color: '#22C1C3', percentage: this.calcPercentage(values.underReview, total) },
        { label: 'Re-release Offer', value: values.reReleaseOffer, color: '#6CC24A', percentage: this.calcPercentage(values.reReleaseOffer, total) },
        { label: 'Candidate Accepted', value: values.candidateAccepted, color: '#7C3AED', percentage: this.calcPercentage(values.candidateAccepted, total) },
        { label: 'Candidate Rejected', value: values.candidateRejected, color: '#F59E0B', percentage: this.calcPercentage(values.candidateRejected, total) }
      ]
    };
  }

  private mapSourcePerformance(source: any) {
    if (!source) return;

    const raw = [
      { label: 'LinkedIn', hires: source.linkedIn ?? 0, color: '#2563eb' },
      { label: 'Naukri', hires: source.naukri ?? 0, color: '#14b8a6' },
      { label: 'Referral', hires: source.employeeReferral ?? 0, color: '#22c55e' },
      { label: 'Career Portal', hires: source.companyCareerPortal ?? 0, color: '#f59e0b' },
      { label: 'Indeed', hires: source.indeed ?? 0, color: '#8b5cf6' },
      { label: 'Others', hires: source.others ?? 0, color: '#ec4899' }
    ];

    const total = raw.reduce((sum, r) => sum + r.hires, 0);
    const maxHires = Math.max(...raw.map(r => r.hires), 1);
    const minSize = 60, maxSize = 120;

    this.bubbleChart = {
      ...this.bubbleChart,
      bubbles: raw
        .filter(r => r.hires > 0)
        .map(r => ({
          label: r.label,
          value: r.hires,
          color: r.color,
          size: minSize + Math.round((r.hires / maxHires) * (maxSize - minSize)),
          percentage: this.calcPercentage(r.hires, total)
        })),
      tableData: raw
        .filter(r => r.hires > 0)
        .map(r => ({
          source: r.label,
          hires: r.hires,
          cost: `${this.calcPercentage(r.hires, total)}%`
        }))
    };
  }

  cardClick(data: any) {
    this.getDashboardCharts(data?.jobId)
  }
}