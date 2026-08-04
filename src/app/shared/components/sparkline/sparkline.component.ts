import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tiny inline SVG line-chart — no ApexCharts overhead, just a polyline.
 * Used for the little trend squiggle under KPI cards (see
 * dashboard-count-card's `sparklineData` input, which renders this).
 */
@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sparkline.component.html',
  styleUrl: './sparkline.component.scss',
})
export class SparklineComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() color: string = '#3B82F6';
  @Input() width: number = 96;
  @Input() height: number = 26;
  @Input() strokeWidth: number = 1.6;
  /** Fill under the line with a soft gradient of `color`. */
  @Input() filled: boolean = false;

  points = '';
  areaPoints = '';
  gradientId = `spark-grad-${Math.random().toString(36).slice(2, 9)}`;

  ngOnChanges(changes: SimpleChanges): void {
    this.build();
  }

  private build(): void {
    const values = this.data ?? [];
    if (!values.length) {
      this.points = '';
      this.areaPoints = '';
      return;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padY = this.strokeWidth;
    const usableH = this.height - padY * 2;
    const step = values.length > 1 ? this.width / (values.length - 1) : this.width;

    const coords = values.map((v, i) => {
      const x = Math.round(i * step * 100) / 100;
      const y = Math.round((padY + usableH - ((v - min) / range) * usableH) * 100) / 100;
      return `${x},${y}`;
    });

    this.points = coords.join(' ');
    this.areaPoints = `0,${this.height} ${coords.join(' ')} ${this.width},${this.height}`;
  }
}
