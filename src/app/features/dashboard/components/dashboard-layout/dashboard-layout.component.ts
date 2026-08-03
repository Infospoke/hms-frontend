import { Component, Input } from '@angular/core';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonModule } from '@angular/common';
import { DonutPieChartComponent, DonutSegment } from "../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component";
import { SemiCircleGaugeComponent } from '../../../../shared/components/semi-circle-gauge/semi-circle-gauge.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CandidatePipelineComponent, PipelineConfig } from '../../../../shared/components/candidate-pipeline/candidate-pipeline.component';
import { CandidatePipelineGraphComponent } from '../../../../shared/components/candidate-pipeline-graph/candidate-pipeline-graph.component';

export interface PieChartConfig {
  title?: string;
  segments: DonutSegment[];
  size?: any;
  centerLabel?: any;
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
  imports: [HeadingComponent, DashboardCountCardComponent, CommonModule, DonutPieChartComponent, SemiCircleGaugeComponent, ReusableTableComponent, CandidatePipelineComponent, CandidatePipelineGraphComponent],
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
  /** When true, renders app-candidate-pipeline-graph (ApexCharts funnel +
   * conversion-rate circles, currently self-contained dummy data) instead
   * of the plain app-candidate-pipeline funnel in the pipeline slot. */
  @Input() pipelineGraph: boolean = false;

  @Input() showSemiCircle:boolean=false;
  @Input() semiCircleConfig?: SemiCircleConfig;

  @Input() pieCharts: PieChartConfig[] = [];

  statusClass(status: string): string {
    return 'status-pill status-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  priorityClass(priority: string): string {
    return 'priority-pill priority-pill--' + (priority ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  slaClass(status: string): string {
    return 'sla-pill sla-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }

}