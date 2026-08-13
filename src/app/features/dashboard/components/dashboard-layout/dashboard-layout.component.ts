import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonModule } from '@angular/common';
import { DonutPieChartComponent, DonutSegment } from "../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component";
import { SemiCircleGaugeComponent } from '../../../../shared/components/semi-circle-gauge/semi-circle-gauge.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CandidatePipelineComponent, PipelineConfig } from '../../../../shared/components/candidate-pipeline/candidate-pipeline.component';
import { BubbleChartComponentComponent } from '../../../../shared/components/bubble-chart-component/bubble-chart-component.component';
import { DateRangePickerComponent } from '../../../../shared/components/date-range-picker/date-range-picker.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';

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
  imports: [HeadingComponent, DashboardCountCardComponent, CommonModule, DonutPieChartComponent, SemiCircleGaugeComponent, ReusableTableComponent, CandidatePipelineComponent,BubbleChartComponentComponent,DateRangePickerComponent,CommonFilterComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit{

  @Input() heading:any;
  @Input() subHeading:any;
  @Input() showingLayout: boolean = false;
  @Input() showFiltersBar: boolean = false;
  @Input() filterDropdowns: any[] = [];
  @Input() filterSearchPlaceholder: string = 'Search...';
  /** Passed straight through to app-common-filter — seeds its date-filter
   * From/To inputs when that dropdown defaults to "Custom Range". */
  @Input() filterDefaultFromDate: string = '';
  @Input() filterDefaultToDate: string = '';

  /** Preselects the standalone date-range-picker in the filters row above
   * (separate from common-filter's own "Custom Range" from/to fields). */
  @Input() dateRangeDefaultFrom: string = '';
  @Input() dateRangeDefaultTo: string = '';

  @Output() filterChange = new EventEmitter<any>();
  @Output() dateRangeChange = new EventEmitter<{ startDate: string; endDate: string }>();

  @Output() cardClick = new EventEmitter<any>();
  @Input() cards:any[]=[];



  @Input() table:boolean=false;
  @Input() tableConfig?: RequisitionsTableConfig;
  /** Highlights whichever row in the requisitions table drove the currently
   * shown drill-down (see cardClick) — pass the row's id and its key field. */
  @Input() activeRowKey: any = null;
  @Input() rowKeyField: string = 'id';

  @Input() pipeLine:boolean=false;
  @Input() pipelineConfig?: PipelineConfig;
  

  @Input() pipelineGraph: boolean = false;

  @Input() showSemiCircle:boolean=false;
  @Input() semiCircleConfig?: SemiCircleConfig;

  @Input() pieCharts: PieChartConfig[] = [];

  @Input() bubbleChart: any;
  @Input() dashboardType: string = '';


  ngOnInit(): void {
    console.log(this.pipeLine,this.pipelineConfig)
  }
  statusClass(status: string): string {
    return 'status-pill status-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  priorityClass(priority: string): string {
    return 'priority-pill priority-pill--' + (priority ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  slaClass(status: string): string {
    return 'sla-pill sla-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }
   onDateRangeChange(range:any): void {
    this.dateRangeChange.emit(range);
  }
  handleData(data:any){
    this.cardClick.emit(data);
  }
  onFilterChange(data:any){
    this.filterChange.emit(data);
  }
}