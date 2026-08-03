import { Component, Input } from '@angular/core';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonModule } from '@angular/common';
import { DonutPieChartComponent, DonutSegment } from "../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component";
import { SemiCircleGaugeComponent } from '../../../../shared/components/semi-circle-gauge/semi-circle-gauge.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CandidatePipelineComponent, PipelineConfig } from '../../../../shared/components/candidate-pipeline/candidate-pipeline.component';
import { StackedBarChartComponent, StackedBarSegment } from '../../../../shared/components/stacked-bar-chart/stacked-bar-chart.component';
import { SankeyDiagramComponent, SankeyNode, SankeyLink } from '../../../../shared/components/sankey-diagram/sankey-diagram.component';

export interface PieChartConfig {
  title?: string;
  segments: DonutSegment[];
  size?: any;
  centerLabel?: any;
}

/** Config for the 100%-stacked bar panel (e.g. "Offer Status"). */
export interface StackedBarConfig {
  title?: string;
  segments: StackedBarSegment[];
  approvalRateLabel?: string;
  approvalRate?: number;
}

/** Config for the sankey flow panel (e.g. "Offer Negotiation Flow"). */
export interface SankeyChartConfig {
  title?: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/** Config for the gauge + metrics table panel (e.g. "Hiring Health"). */
export interface SemiCircleConfig {
  title?: string;
  score: number;
  columns: TableColumn[];
  data: any[];
}

/** Config for the plain data table panel (e.g. "My Requisitions"). */
export interface RequisitionsTableConfig {
  title?: string;
  columns: TableColumn[];
  data: any[];
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [HeadingComponent, DashboardCountCardComponent, CommonModule, DonutPieChartComponent, SemiCircleGaugeComponent, ReusableTableComponent, CandidatePipelineComponent, StackedBarChartComponent, SankeyDiagramComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {

  @Input() heading:any;
  @Input() subHeading:any;

  @Input() cards:any[]=[];

  @Input() table:boolean=false;
  @Input() tableConfig?: RequisitionsTableConfig;

  @Input() pipeLine:boolean=false;
  @Input() pipelineConfig?: PipelineConfig;

  @Input() showSemiCircle:boolean=false;
  @Input() semiCircleConfig?: SemiCircleConfig;

  @Input() pieCharts: PieChartConfig[] = [];

  @Input() offerStatusConfig?: StackedBarConfig;
  @Input() offerNegotiationConfig?: SankeyChartConfig;

  statusClass(status: string): string {
    return 'status-pill status-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  /** Heat-map cell background/text color for the My Requisitions SLA
   * Status group (On Track / At Risk / Overdue) — intensity scales with
   * the openings count sitting in that cell. */
  heatCellStyle(value: number, col: 'onTrack' | 'atRisk' | 'overdue'): { background: string; color: string } {
    if (!value) {
      return { background: '#F3F4F6', color: '#9CA3AF' };
    }
    const shades: Record<string, { bg: string[]; text: string }> = {
      onTrack: { bg: ['#DCFCE7', '#86EFAC', '#16A34A'], text: '#065F46' },
      atRisk: { bg: ['#FEF3C7', '#FDE68A', '#D97706'], text: '#92400E' },
      overdue: { bg: ['#FEE2E2', '#FCA5A5', '#DC2626'], text: '#7F1D1D' },
    };
    const cfg = shades[col] ?? shades['onTrack'];
    const idx = value >= 5 ? 2 : value >= 3 ? 1 : 0;
    return { background: cfg.bg[idx], color: idx === 2 ? '#ffffff' : cfg.text };
  }

}