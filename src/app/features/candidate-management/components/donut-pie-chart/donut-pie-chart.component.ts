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

/**
 * Reusable donut/pie chart component.
 *
 * Usage:
 *   <app-donut-pie-chart
 *     [segments]="donutSegments"
 *     centerLabel="Total CTC"
 *     [formatValue]="formatINR"
 *   ></app-donut-pie-chart>
 *
 * Drop this component anywhere a labeled donut breakdown is needed —
 * it doesn't know anything about "compensation" specifically, it just
 * renders whatever segments it's given.
 *
 * PERFORMANCE NOTE:
 * This component is OnPush. It only rebuilds the chart when the
 * `segments` array reference actually changes. That means callers
 * MUST pass a stable array reference (build it once / on real data
 * changes) rather than a getter or an inline `.map()` in the
 * template, which creates a new array on every change-detection
 * cycle and forces a full chart rebuild + re-render on every tick.
 */
@Component({
  selector: 'app-donut-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './donut-pie-chart.component.html',
  styleUrls: ['./donut-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutPieChartComponent implements OnChanges {
  /** Data driving both the chart and the built-in legend. */
  @Input() segments: DonutSegment[] = [];
  /** Small label shown under the total in the center of the donut. */
  @Input() centerLabel = 'Total';
  /** Chart width/height in pixels (it's a square). */
  @Input() size = 190;
  /** Set to false if you're rendering your own legend elsewhere. */
  @Input() showLegend = true;
  /** Formatter applied to every displayed number (center, tooltip, legend). */
  @Input() formatValue: (n: number) => string = (n) =>
    n.toLocaleString('en-IN');
  /** Currency symbol/prefix shown before formatted values. */
  @Input() currencyPrefix = '₹';

  @ViewChild('chartRef') chartRef?: ChartComponent;

  chartOptions?: DonutChartOptions;
  total = 0;

  ngOnChanges(changes: SimpleChanges): void {
    // Only rebuild for inputs that actually affect the chart. Combined
    // with OnPush this means genuinely-unchanged input references never
    // reach this method in the first place, but we still guard here in
    // case a parent passes segments alongside unrelated input churn.
    if (changes['segments'] || changes['centerLabel'] || changes['size']) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    this.total = this.segments.reduce((sum, s) => sum + s.value, 0);
    const prefix = this.currencyPrefix;

    this.chartOptions = {
      series: this.segments.map((s) => s.value),
      chart: {
        type: 'donut',
        width: this.size,
        height: this.size,
        fontFamily: 'inherit',
        // Keep the entry animation but make redraws (which now only
        // happen on genuine data changes) feel snappy rather than
        // laggy.
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
              show: true,
              name: { show: false },
              value: {
                show: true,
                fontSize: '20px',
                fontWeight: 700,
                color: '#1a1f2b',
                offsetY: -4,
                formatter: () => `${prefix}${this.formatValue(this.total)}`,
              },
              total: {
                show: true,
                showAlways: true,
                label: this.centerLabel,
                fontSize: '12px',
                fontWeight: 500,
                color: '#9aa1b1',
                formatter: () => this.centerLabel,
              },
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