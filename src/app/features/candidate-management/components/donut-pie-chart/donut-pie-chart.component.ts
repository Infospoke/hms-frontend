import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexPlotOptions,
} from 'ng-apexcharts';

/**
 * A single wedge of the donut. `color` should be a hex/rgb string so it
 * can be reused consistently between the chart and any legend/table
 * that reads from the same data source.
 */
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
};


@Component({
  selector: 'app-donut-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './donut-pie-chart.component.html',
  styleUrls: ['./donut-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutPieChartComponent implements OnChanges {

  @Input() segments: DonutSegment[] = [];

  @Input() centerLabel = 'Total';
 
  @Input() size = 190;

  @Input() showLegend = true;

  @Input() formatValue: (n: number) => string = (n) =>
    n.toLocaleString('en-IN');

  @Input() currencyPrefix = '₹';

  @Input() showCount = false;

  
  @Input() valueFontSize = '18px';
  @Input() centerLabelFontSize = '11px';

  @ViewChild('chartRef') chartRef?: ChartComponent;

  chartOptions?: DonutChartOptions;
  total = 0;
  /** Formatted big number shown in the donut's center overlay. */
  centerValueText = '';

  ngOnChanges(changes: SimpleChanges): void {
  
    if (
      changes['segments'] ||
      changes['centerLabel'] ||
      changes['size'] ||
      changes['showCount'] ||
      changes['valueFontSize'] ||
      changes['centerLabelFontSize']
    ) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    this.total = this.segments.reduce((sum, s) => sum + s.value, 0);
    const prefix = this.showCount ? '' : this.currencyPrefix;
    this.centerValueText = `${prefix}${this.formatValue(this.total)}`;

    this.chartOptions = {
      series: this.segments.map((s) => s.value),
      chart: {
        type: 'donut',
        width: this.size,
        height: this.size,
        fontFamily: 'inherit',
        
        animations: {
          enabled: true,
          speed: 250,
          dynamicAnimation: { enabled: true, speed: 200 },
        },
      },
      labels: this.segments.map((s) => s.label),
      colors: this.segments.map((s) => s.color),
      stroke: { show: true, width: 2, colors: ['#ffffff'] },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: {
        y: {
          formatter: (val: number) => `${prefix}${this.formatValue(val)}`,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            
            labels: {
              show: false,
            },
          },
        },
      },
    };
  }

  percentageOf(value: number): number {
    return this.total ? Math.round((value / this.total) * 100) : 0;
  }

  trackByLabel(_index: number, segment: DonutSegment): string {
    return segment.label;
  }
}