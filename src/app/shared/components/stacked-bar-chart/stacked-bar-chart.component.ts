import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexDataLabels,
  ApexTooltip,
  ApexGrid,
} from 'ng-apexcharts';

/** A single segment of the 100%-stacked bar (e.g. "Offer Requests"). */
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
  yaxis: ApexYAxis;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  grid: ApexGrid;
};

/**
 * Single-row 100%-stacked horizontal bar — each segment's share of the
 * whole rendered as one proportional colored strip, with a legend below
 * and an "Approval Rate" summary badge.
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
  @Input() height = 90;

  @Input() approvalRateLabel = 'Approval Rate';
  /** Overrides the auto-computed approval rate (share of segments that
   * aren't the "Declined" one) if set. */
  @Input() approvalRate?: number;

  chartOptions?: StackedBarChartOptions;
  total = 0;
  computedApprovalRate = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['segments'] || changes['height']) {
      this.buildChart();
    }
    if (changes['approvalRate']) {
      this.computedApprovalRate = this.approvalRate ?? this.computedApprovalRate;
    }
  }

  private buildChart(): void {
    this.total = this.segments.reduce((sum, s) => sum + s.value, 0);

    const declined = this.segments.find((s) => s.label.toLowerCase().includes('declin'));
    const autoRate = this.total ? ((this.total - (declined?.value ?? 0)) / this.total) * 100 : 0;
    this.computedApprovalRate = this.approvalRate ?? Math.round(autoRate);

    this.chartOptions = {
      series: this.segments.map((s) => ({ name: s.label, data: [s.value] })),
      chart: {
        type: 'bar',
        height: this.height,
        stacked: true,
        stackType: '100%',
        toolbar: { show: false },
        animations: { enabled: true, speed: 250 },
      },
      colors: this.segments.map((s) => s.color),
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '55%',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: [''],
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: { show: false },
      },
      legend: { show: false },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val >= 8 ? `${Math.round(val)}%` : ''),
        style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}`,
        },
      },
      grid: {
        show: false,
        padding: { left: 0, right: 0, top: -10, bottom: -10 },
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
