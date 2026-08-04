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

@Component({
  selector: 'app-hiring-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DashboardLayoutComponent, DashboardCountCardComponent,
    ReusableTableComponent, SemiCircleGaugeComponent,
    DonutPieChartComponent,
    NgxApexsankeyComponent,
  ],
  templateUrl: './hiring-manager-dashboard.component.html',
  styleUrl: './hiring-manager-dashboard.component.scss',
})
export class HiringManagerDashboardComponent implements OnInit {

  @ViewChild('reqCellTpl') reqCellTpl!: TemplateRef<any>;
  @ViewChild('healthCellTpl') healthCellTpl!: TemplateRef<any>;

  heading = `Good morning, Divya! 👋`;
  subHeading = "Here's what's happening with your hiring.";
  private authService = inject(AuthService);
  pipelineFrom = ''; pipelineTo = '';
  offerStatusFrom = ''; offerStatusTo = '';
  negoFrom = ''; negoTo = '';

  ngOnInit(): void {
    this.handleHeading();
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
  kpiCards: KpiCard[] = [
    { label: 'Open SRs', value: 6, iconClass: 'fa-solid fa-briefcase', iconColor: '#3B82F6', iconBgColor: '#DBEAFE' },
    { label: 'Total Candidates', value: 141, iconClass: 'fa-solid fa-users', iconColor: '#10B981', iconBgColor: '#D1FAE5' },
    { label: 'Interviews', value: 18, iconClass: 'fa-solid fa-user-check', iconColor: '#8B5CF6', iconBgColor: '#EDE9FE' },
    { label: 'Offers Released', value: 8, iconClass: 'fa-solid fa-file-signature', iconColor: '#F97316', iconBgColor: '#FFEDD5' },
    { label: 'Hired', value: '21 Days', iconClass: 'fa-solid fa-clock', iconColor: '#6366F1', iconBgColor: '#E0E7FF' },
  ];


  reqColumns: TableColumn[] = [
    { key: 'position', label: 'Position', width: '15%' },
    { key: 'openings', label: 'Openings', width: '8%', align: 'center' },
    { key: 'offersReleased', label: 'Offers Released', width: '9%', align: 'center' },
    { key: 'offersPending', label: 'Offers Pending', width: '9%', align: 'center' },
    { key: 'targetStart', label: 'Target Start Date', width: '13%', align: 'center', custom: true },
    { key: 'daysRemaining', label: 'Days Remaining', width: '8%', align: 'center', custom: true },
    { key: 'priority', label: 'Priority', width: '12%', align: 'center', custom: true },
    { key: 'slaStatus', label: 'SLA Status', width: '12%', align: 'center', custom: true },

  ];

  reqData = [
    {
      position: 'Backend Engineer',
      openings: 5,
      offersReleased: 3,
      offersPending: 1,
      targetStart: '15 Aug 2026',
      daysRemaining: 11,
      priority: 'High',
      slaStatus: 'On Track',
    },
    {
      position: 'QA Lead',
      openings: 2,
      offersReleased: 1,
      offersPending: 0,
      targetStart: '08 Aug 2026',
      daysRemaining: 4,
      priority: 'Critical',
      slaStatus: 'At Risk',
    },
    {
      position: 'HR Executive',
      openings: 3,
      offersReleased: 2,
      offersPending: 1,
      targetStart: '20 Aug 2026',
      daysRemaining: 16,
      priority: 'Medium',
      slaStatus: 'On Track',
    },
    {
      position: 'Data Analyst',
      openings: 2,
      offersReleased: 1,
      offersPending: 0,
      targetStart: '05 Aug 2026',
      daysRemaining: 1,
      priority: 'High',
      slaStatus: 'At Risk',
    },
    {
      position: 'SAP Consultant',
      openings: 2,
      offersReleased: 1,
      offersPending: 0,
      targetStart: '01 Aug 2026',
      daysRemaining: -3,
      priority: 'Critical',
      slaStatus: 'Overdue',
    },
    {
      position: 'Frontend Developer',
      openings: 3,
      offersReleased: 0,
      offersPending: 2,
      targetStart: '25 Aug 2026',
      daysRemaining: 21,
      priority: 'Low',
      slaStatus: 'On Track',
    },
  ];

  // ── Candidate Pipeline — Chevron Funnel ───────────────────────────────────
  pipelineStages: PipelineStage[] = [
    { label: 'Applied', value: 128, color: '#3B82F6' },
    { label: 'Screening', value: 64, color: '#14B8A6', conversionPct: 50 },
    { label: 'Interview', value: 21, color: '#8B5CF6', conversionPct: 33 },
    { label: 'Offer', value: 5, color: '#F97316', conversionPct: 24 },
    { label: 'Hired', value: 2, color: '#22C55E', conversionPct: 40 },
  ];

  // ── Offer Status — Horizontal Bars ────────────────────────────────────────
  offerStatusBars: OfferStatusBar[] = [
    { label: 'Offer Requests', count: 22, color: '#3B82F6' },
    { label: 'Pending Approval', count: 14, color: '#F59E0B' },
    { label: 'Approved', count: 10, color: '#22C55E' },
    { label: 'Offer Released', count: 8, color: '#8B5CF6' },
    { label: 'Offer Accepted', count: 6, color: '#10B981' },
    { label: 'Declined', count: 2, color: '#EF4444' },
  ];

  get offerStatusMax(): number {
    return Math.max(...this.offerStatusBars.map(b => b.count), 1);
  }

  getOfferBarPct(count: number): number {
    return Math.round((count / this.offerStatusMax) * 100);
  }


  sankeyNodes: SankeyNode[] = [
    { id: 'released', label: 'Offer Released', value: 8, color: '#8B5CF6', column: 0 },
    { id: 'negotiating', label: 'In Negotiation', value: 3, color: '#3B82F6', column: 1 },
    { id: 'accepted_direct', label: 'Directly Accepted', value: 5, color: '#22C55E', column: 1 },
    { id: 'mgr_review', label: 'Manager Review', value: 2, color: '#F59E0B', column: 2 },
    { id: 'counter', label: 'Counter Offered', value: 1, color: '#F97316', column: 2 },
    { id: 'closed_accepted', label: 'Closed (Accepted)', value: 6, color: '#16a34a', column: 3 },
    { id: 'closed_declined', label: 'Closed (Declined)', value: 2, color: '#EF4444', column: 3 },
  ];

  sankeyLinks: SankeyLink[] = [
    { source: 'released', target: 'negotiating', value: 3 },
    { source: 'released', target: 'accepted_direct', value: 5 },
    { source: 'negotiating', target: 'mgr_review', value: 2 },
    { source: 'negotiating', target: 'counter', value: 1 },
    { source: 'mgr_review', target: 'closed_accepted', value: 1 },
    { source: 'mgr_review', target: 'closed_declined', value: 1 },
    { source: 'counter', target: 'closed_accepted', value: 1 },
    { source: 'accepted_direct', target: 'closed_accepted', value: 4 },
    { source: 'accepted_direct', target: 'closed_declined', value: 1 },
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
      { source: 'released', target: 'neg_started', value: 3, type: 'flow' },
      { source: 'released', target: 'mgr_review', value: 2, type: 'flow' },
      { source: 'released', target: 'counter', value: 1, type: 'flow' },
      { source: 'neg_started', target: 'fop', value: 1, type: 'flow' },
      { source: 'neg_started', target: 'closed_accepted', value: 1, type: 'flow' },
      { source: 'neg_started', target: 'closed_declined', value: 1, type: 'flow' },
      { source: 'mgr_review', target: 'closed_accepted', value: 2, type: 'flow' },
      { source: 'counter', target: 'closed_declined', value: 1, type: 'flow' },
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
    { label: 'Excellent (90–100)', value: 12, color: '#10B981' },
    { label: 'Good (80–89)', value: 18, color: '#3B82F6' },
    { label: 'Average (70–79)', value: 9, color: '#F59E0B' },
    { label: 'Needs Review (<70)', value: 3, color: '#EF4444' },
  ];

  // ── Hiring Health — Gauge + Table ─────────────────────────────────────────
  hiringHealthScore = 87;

  healthColumns: TableColumn[] = [
    { key: 'metric', label: 'Metric', width: '52%' },
    { key: 'score', label: 'Score', width: '18%', align: 'center' },
    { key: 'status', label: 'Status', width: '30%', align: 'center', custom: true },
  ];

  healthData = [
    { metric: 'Pipeline Coverage', score: '95%', status: 'Excellent' },
    { metric: 'Offer Progress', score: '88%', status: 'Good' },
    { metric: 'Candidate Quality', score: '91%', status: 'Excellent' },
    { metric: 'Requisitions On Track', score: '82%', status: 'Good' },
    { metric: 'SLA Compliance', score: '75%', status: 'Fair' },
  ];
}
