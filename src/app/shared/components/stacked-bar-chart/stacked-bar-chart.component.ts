import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexChart,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexDataLabels,
  ApexTooltip,
  ApexGrid,
  ApexStroke,
  ApexMarkers,
} from 'ng-apexcharts';

/** A single stage of the offer funnel (e.g. "Offer Requests"). */
export interface StackedBarSegment {
  label: string;
  value: number;
  color: string;
}

export type StackedBarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  stroke: ApexStroke;
  markers: ApexMarkers;
};

/**
 * ApexCharts combo chart for "Offer Status" — one column per funnel stage
 * (colored to match the legend) plus a line series tracking the
 * cumulative Approval Rate across those stages on a secondary 0-100% axis.
 * ApexCharts doesn't support combining a *horizontal* bar with a line
 * series, so this renders as a vertical column + line combo instead.
 */
@Component({
  selector: 'app-stacked-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './stacked-bar-chart.component.html',
  styleUrl: './stacked-bar-chart.component.scss',
})
export class StackedBarChartComponent implements OnChanges {

  @Input() segments: StackedBarSegment[] = [];
  @Input() height = 280;

  @Input() approvalRateLabel = 'Approval Rate';
  /** Overrides the auto-computed final approval rate (cumulative % at the
   * last stage) if set. */
  @Input() approvalRate?: number;

  chartOptions?: StackedBarChartOptions;
  total = 0;
  computedApprovalRate = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['segments'] || changes['height']) {
      this.buildChart();
    }
    if (changes['approvalRate'] && this.chartOptions) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    this.total = this.segments.reduce((sum, s) => sum + s.value, 0);

    let running = 0;
    const cumulativePct = this.segments.map((s) => {
      running += s.value;
      return this.total ? Math.round((running / this.total) * 100) : 0;
    });
    this.computedApprovalRate = this.approvalRate ?? cumulativePct[cumulativePct.length - 1] ?? 0;

    this.chartOptions = {
      series: [
        {
          name: 'Count',
          type: 'column',
          data: this.segments.map((s) => ({ x: s.label, y: s.value, fillColor: s.color })),
        },
        {
          name: this.approvalRateLabel,
          type: 'line',
          data: cumulativePct,
        },
      ],
      chart: {
        type: 'line',
        height: this.height,
        toolbar: { show: false },
        animations: { enabled: true, speed: 250 },
      },
      colors: ['#94A3B8', '#111827'],
      plotOptions: {
        bar: {
          columnWidth: '55%',
          borderRadius: 4,
        },
      },
      stroke: {
        width: [0, 2.5],
        curve: 'straight',
      },
      markers: {
        size: [0, 4],
        colors: ['#111827'],
        strokeColors: '#fff',
        strokeWidth: 2,
      },
      xaxis: {
        categories: this.segments.map((s) => s.label),
        labels: {
          rotate: -35,
          style: { fontSize: '10px' },
          trim: true,
        },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          labels: { style: { fontSize: '11px' } },
        },
        {
          opposite: true,
          min: 0,
          max: 100,
          labels: {
            style: { fontSize: '11px' },
            formatter: (val: number) => `${Math.round(val)}%`,
          },
        },
      ],
      legend: { show: false },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0, 1],
        formatter: (val: number, opts: any) =>
          opts.seriesIndex === 1 ? `${Math.round(val)}%` : `${val}`,
        style: { fontSize: '11px', fontWeight: 600, colors: ['#374151'] },
        offsetY: -4,
      },
      tooltip: {
        shared: true,
        y: {
          formatter: (val: number, opts: any) =>
            opts?.seriesIndex === 1 ? `${val}%` : `${val}`,
        },
      },
      grid: {
        strokeDashArray: 3,
        padding: { left: 8, right: 8, top: 0, bottom: 0 },
      },
    };
  }

  percentageOf(value: number): number {
    return this.total ? Math.round((value / this.total) * 100) : 0;
  }

  trackByLabel(_index: number, segment: StackedBarSegment): string {
    return segment.label;
  }
}
