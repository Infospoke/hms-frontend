import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashboardLayoutComponent } from "../dashboard-layout/dashboard-layout.component";
import { CommonModule } from '@angular/common';
import { DonutSegment } from '../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component';
import { PieChartConfig, SemiCircleConfig, RequisitionsTableConfig, StackedBarConfig, SankeyChartConfig } from '../dashboard-layout/dashboard-layout.component';
import { TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { PipelineConfig, PipelineStage } from '../../../../shared/components/candidate-pipeline/candidate-pipeline.component';
import { SankeyNode, SankeyLink } from '../../../../shared/components/sankey-diagram/sankey-diagram.component';

@Component({
  selector: 'app-hiring-manager-dashboard',
  imports: [DashboardLayoutComponent, CommonModule],
  templateUrl: './hiring-manager-dashboard.component.html',
  styleUrl: './hiring-manager-dashboard.component.scss',
})
export class HiringManagerDashboardComponent implements OnInit, OnChanges {

  ngOnInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  heading = 'Good morning, Divya! 👋';
  subHeading = "Here's what's happening with your hiring.";

  cards = [
  {
    label: 'Open SRs',
    value: 6,
    subLabel: '1 this week',
    iconClass: 'fa-solid fa-briefcase',
    iconBgColor: '#DBEAFE',
    iconColor: '#3B82F6',
    trend: 'up' as const,
  },
  {
    label: 'Total Candidates',
    value: 141,
    subLabel: 'In pipeline',
    iconClass: 'fa-solid fa-users',
    iconBgColor: '#D1FAE5',
    iconColor: '#10B981',
  },
  {
    label: 'Interviews',
    value: 18,
    subLabel: '2 this week',
    iconClass: 'fa-solid fa-user-check',
    iconBgColor: '#EDE9FE',
    iconColor: '#8B5CF6',
    trend: 'up' as const,
  },
  {
    label: 'Offers',
    value: 8,
    subLabel: '1 this week',
    iconClass: 'fa-solid fa-file-signature',
    iconBgColor: '#FFEDD5',
    iconColor: '#F97316',
    trend: 'up' as const,
  },
  {
    label: 'Average Hiring Age',
    value: '21 Days',
    subLabel: '3 days vs last month',
    iconClass: 'fa-solid fa-clock',
    iconBgColor: '#E0E7FF',
    iconColor: '#6366F1',
    trend: 'down' as const,
  },
];

  table = true;

requisitionColumns = [
  { key: 'position', label: 'Position' },
  { key: 'openings', label: 'Openings' },
  { key: 'offersReleased', label: 'Offers Released' },
  { key: 'offersPending', label: 'Offers Pending' },
  { key: 'targetStartDate', label: 'Target Start Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'slaStatus', label: 'SLA Status' },
  {key: 'daysRemaining', label:'Days Remaining' }
];

requisitionData = [
  {
    position: 'Backend Engineer',
    openings: 5,
    offersReleased: 3,
    offersPending: 1,
    targetStartDate: '30 Jun 2026',
    priority: 'High',
    slaStatus: 'On Track',
    daysRemaining: '5 Days'

  },
  {
    position: 'QA Lead',
    openings: 2,
    offersReleased: 1,
    offersPending: 0,
    targetStartDate: '15 Jul 2026',
    priority: 'Medium',
    slaStatus: 'At Risk',
    daysRemaining: '3 Days'
  },
  {
    position: 'HR Executive',
    openings: 3,
    offersReleased: 2,
    offersPending: 1,
    targetStartDate: '01 Jul 2026',
    priority: 'High',
    slaStatus: 'Overdue',
     daysRemaining: '6 Days'
  },
  {
    position: 'Data Analyst',
    openings: 2,
    offersReleased: 1,
    offersPending: 0,
    targetStartDate: '20 Jul 2026',
    priority: 'Medium',
    slaStatus: 'At Risk',
     daysRemaining: '3 Days'
  },
  {
    position: 'SAP Consultant',
    openings: 2,
    offersReleased: 1,
    offersPending: 0,
    targetStartDate: '10 Aug 2026',
    priority: 'Low',
    slaStatus: 'On Track',
    daysRemaining: '3 Days'
  }
];



  offerStatusSegments: DonutSegment[] = [
    {
      label: 'Offer Requests',
      value: 5,
      color: '#3B82F6',
    },
    {
      label: 'Pending Approval',
      value: 3,
      color: '#F59E0B',
    },
    {
      label: 'Approved',
      value: 3,
      color: '#22C55E',
    },
    {
      label: 'Offer Released',
      value: 8,
      color: '#8B5CF6',
    },
    {
      label: 'Offer Accepted',
      value: 2,
      color: '#10B981',
    },
    {
      label: 'Declined',
      value: 1,
      color: '#EF4444',
    },
  ];

  // Offer Negotiation Flow's data now lives directly in
  // offerNegotiationNodes/offerNegotiationLinks below (same 6 stages/colors,
  // reshaped for the sankey diagram) — this donut-era array is no longer
  // needed.

  candidateQualitySegments: DonutSegment[] = [
    {
      label: 'Excellent (90 - 100)',
      value: 12,
      color: '#10B981',
    },
    {
      label: 'Good (80 - 89)',
      value: 18,
      color: '#3B82F6',
    },
    {
      label: 'Average (70 - 79)',
      value: 9,
      color: '#F59E0B',
    },
    {
      label: 'Needs Review (<70)',
      value: 3,
      color: '#EF4444',
    },
  ];
  pieCharts: PieChartConfig[] = [
    {
      title:"Candidate Quality Distribution",
      segments: this.candidateQualitySegments,
      centerLabel: 'Total Candidates',
      size: 170,
    }
  ];

  // Offer Status is now a 100%-stacked bar instead of a donut — same
  // segments, just re-rendered. "Approval Rate" = cases that reached
  // Approved or further along (Approved + Offer Released + Offer Accepted)
  // out of all 22 cases: (3+8+2)/22 ≈ 59%.
  offerStatusConfig: StackedBarConfig = {
    title: 'Offer Status (Offer Requests & Approvals)',
    segments: this.offerStatusSegments,
    approvalRateLabel: 'Approval Rate',
    approvalRate: 59,
  };

  // Offer Negotiation Flow is now a sankey diagram instead of a donut —
  // same 6 stages/colors, reshaped into flow nodes + links. Links are
  // flow-conserving: each node's outgoing total matches its incoming total
  // (or its own value, for source nodes).
  offerNegotiationNodes: SankeyNode[] = [
    { id: 'started', label: 'Negotiation Started', value: 3, color: '#3B82F6', column: 0 },
    { id: 'managerReview', label: 'Manager Review', value: 2, color: '#F59E0B', column: 1 },
    { id: 'counterOffered', label: 'Counter Offered', value: 2, color: '#8B5CF6', column: 1 },
    { id: 'finalPending', label: 'Final Offer Pending', value: 1, color: '#F97316', column: 2 },
    { id: 'closedAccepted', label: 'Closed (Accepted)', value: 2, color: '#22C55E', column: 2 },
    { id: 'closedDeclined', label: 'Closed (Declined)', value: 1, color: '#EF4444', column: 2 },
  ];

  offerNegotiationLinks: SankeyLink[] = [
    { source: 'started', target: 'managerReview', value: 2 },
    { source: 'started', target: 'counterOffered', value: 1 },
    { source: 'managerReview', target: 'finalPending', value: 1 },
    { source: 'managerReview', target: 'closedAccepted', value: 1 },
    { source: 'counterOffered', target: 'closedAccepted', value: 1 },
    { source: 'counterOffered', target: 'closedDeclined', value: 1 },
  ];

  offerNegotiationConfig: SankeyChartConfig = {
    title: 'Offer Negotiation Flow',
    nodes: this.offerNegotiationNodes,
    links: this.offerNegotiationLinks,
  };

  showSemiCircle = true;

  // Status needs more room than 30% for "Needs Attention" — that's what
  // was forcing the horizontal scrollbar / clipped pill.
  hiringHealthColumns: TableColumn[] = [
    { key: 'metric', label: 'Metric', width: '32%' },
    { key: 'score', label: 'Score', width: '15%' },
    { key: 'status', label: 'Status', width: '33%', custom: true },
    { key: 'trend', label: 'Trend (vs last month)', width: '20%', custom: true, align: 'center' },
  ];

  hiringHealthData = [
    { metric: 'Pipeline Coverage', score: '95%', status: 'Excellent', trend: 'up' as const },
    { metric: 'Offer Progress', score: '88%', status: 'Good', trend: 'up' as const },
    { metric: 'Candidate Quality', score: '91%', status: 'Excellent', trend: 'up' as const },
    { metric: 'Requisitions On Track', score: '90%', status: 'Excellent', trend: 'up' as const },
    { metric: 'Aging Requisitions', score: '75%', status: 'Needs Attention', trend: 'down' as const },
  ];

  semiCircleConfig: SemiCircleConfig = {
    title: 'Hiring Health',
    score: 92,
    columns: this.hiringHealthColumns,
    data: this.hiringHealthData,
  };

  pipelineStages: PipelineStage[] = [
    {
      label: 'Applied',
      value: 128,
      iconClass: 'fa-solid fa-users',
      iconColor: '#3B82F6',
      iconBgColor: '#DBEAFE',
    },
    {
      label: 'Screening',
      value: 64,
      iconClass: 'fa-solid fa-user-check',
      iconColor: '#10B981',
      iconBgColor: '#D1FAE5',
      conversionPct: 50,
    },
    {
      label: 'Interview',
      value: 21,
      iconClass: 'fa-solid fa-user-tie',
      iconColor: '#8B5CF6',
      iconBgColor: '#EDE9FE',
      conversionPct: 33,
    },
    {
      label: 'Offer',
      value: 5,
      iconClass: 'fa-solid fa-file-signature',
      iconColor: '#F97316',
      iconBgColor: '#FFEDD5',
      conversionPct: 24,
    },
    {
      label: 'Hired',
      value: 2,
      iconClass: 'fa-solid fa-user-plus',
      iconColor: '#22C55E',
      iconBgColor: '#DCFCE7',
      conversionPct: 40,
    },
  ];

  showPipeline = true;

  pipelineConfig: PipelineConfig = {
    title: 'Candidate Pipeline (All Requisitions)',
    periods: ['This Month', 'This Quarter', 'This Year'],
    selectedPeriod: 'This Month',
    stages: this.pipelineStages,
    overallConversionLabel: 'Overall Conversion Rate',
    overallConversionRate: 1.6,
    trendData: [1.1, 1.3, 1.2, 1.4, 1.6],
    trendLabel: 'vs last month',
    trendDelta: 0.4,
    trendDirection: 'up',
  };

  showTable = true;

  // "Openings" is a single unbreakable word — it needs enough width to
  // render on its own without bleeding into the next header (that bleed is
  // what caused the OPENINGS/OFFERS RELEASED collision), so it gets more
  // room here than the other narrow numeric columns.
  // SLA Status is now a 3-column heatmap group (On Track / At Risk /
  // Overdue) instead of a single pill — each row's openings count lands in
  // whichever column matches its status, colour-intensity coded.
  requisitionsColumns: TableColumn[] = [
    { key: 'position', label: 'Position', width: '22%' },
    { key: 'openings', label: 'Openings', width: '14%' },
    { key: 'offersReleased', label: 'Offers Released', width: '16%', align: 'center' },
    { key: 'offersPending', label: 'Offers Pending', width: '16%', align: 'center' },
    { key: 'onTrack', label: 'On Track', width: '11%', align: 'center', custom: true, group: 'SLA Status' },
    { key: 'atRisk', label: 'At Risk', width: '11%', align: 'center', custom: true, group: 'SLA Status' },
    { key: 'overdue', label: 'Overdue', width: '10%', align: 'center', custom: true, group: 'SLA Status' },
  ];

  // Each row's openings land in the column matching its current SLA
  // status; the other two heatmap columns are 0 for that row.
  requisitionsData = [
    { position: 'Backend Engineer', openings: 5, offersReleased: 3, offersPending: 1, onTrack: 5, atRisk: 0, overdue: 0 },
    { position: 'QA Lead', openings: 2, offersReleased: 1, offersPending: 0, onTrack: 0, atRisk: 2, overdue: 0 },
    { position: 'HR Executive', openings: 3, offersReleased: 2, offersPending: 1, onTrack: 0, atRisk: 0, overdue: 3 },
    { position: 'Data Analyst', openings: 2, offersReleased: 1, offersPending: 0, onTrack: 0, atRisk: 2, overdue: 0 },
    { position: 'SAP Consultant', openings: 2, offersReleased: 1, offersPending: 0, onTrack: 2, atRisk: 0, overdue: 0 },
    { position: 'Frontend Developer', openings: 3, offersReleased: 0, offersPending: 0, onTrack: 3, atRisk: 0, overdue: 0 },
  ];

  tableConfig: RequisitionsTableConfig = {
    title: 'My Requisitions',
    columns: this.requisitionsColumns,
    data: this.requisitionsData,
  };

}