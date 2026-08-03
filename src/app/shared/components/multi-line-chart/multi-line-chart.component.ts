import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  ApexTooltip,
  ApexGrid,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexMarkers,
} from 'ng-apexcharts';

export interface LineSeriesInput {
  name: string;
  data: number[];
  color: string;
}

/**
 * Generic ApexCharts multi-line chart with markers — reusable for any
 * "trend over time" panel (Hiring Trend here, but works for any set of
 * named series over shared categories).
 */
@Component({
  selector: 'app-multi-line-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './multi-line-chart.component.html',
  styleUrl: './multi-line-chart.component.scss',
})
export class MultiLineChartComponent implements OnChanges {
  @Input() title: string = 'Hiring Trend';
  @Input() subTitle: string = '';
  @Input() categories: string[] = [];
  @Input() series: LineSeriesInput[] = [];
  @Input() height: number = 300;

  chartSeries: ApexAxisChartSeries = [];
  colors: string[] = [];
  chart: ApexChart = {
    type: 'line',
    toolbar: { show: false },
    animations: { enabled: true, speed: 500 },
    zoom: { enabled: false },
  };
  dataLabels: ApexDataLabels = { enabled: false };
  stroke: ApexStroke = { curve: 'smooth', width: 2.5 };
  markers: ApexMarkers = { size: 4, strokeWidth: 2, strokeColors: '#fff', hover: { size: 6 } };
  tooltip: ApexTooltip = { theme: 'light', shared: true, intersect: false };
  grid: ApexGrid = { borderColor: '#F1F5F9', strokeDashArray: 3 };
  xaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#9ca3af', fontSize: '11px' } },
  };
  yaxis: ApexYAxis = { labels: { style: { colors: '#9ca3af', fontSize: '11px' } } };
  legend: ApexLegend = { show: true, position: 'top', horizontalAlign: 'right', fontSize: '12px', markers: { size: 6 } };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['categories']) {
      this.build();
    }
  }

  private build(): void {
    this.colors = this.series.map(s => s.color);
    this.chartSeries = this.series.map(s => ({ name: s.name, data: s.data }));
    this.xaxis = { ...this.xaxis, categories: this.categories };
    this.chart = { ...this.chart, height: this.height };
  }
}
