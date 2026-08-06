import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SlaFractionMetric {
  label: string;
  completed: number;
  total: number;
  color: string;
}

interface GaugeViewModel extends SlaFractionMetric {
  percent: number;
  dashArray: string;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-sla-compilance-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sla-compilance-component.component.html',
  styleUrl: './sla-compilance-component.component.scss',
})
export class SlaCompilanceComponentComponent {

  @Input() assignmentAcceptance: SlaFractionMetric = {
    label: 'Assignment Acceptance Rate',
    completed: 0,
    total: 0,
    color: '#2F80ED',
  };

  @Input() requisitionFulfillment: SlaFractionMetric = {
    label: 'Requisition Fulfillment Rate',
    completed: 0,
    total: 0,
    color: '#8E44EC',
  };

  @Input() onTimeFulfillment: SlaFractionMetric = {
    label: 'On-Time Fulfillment Rate',
    completed: 0,
    total: 0,
    color: '#F2994A',
  };

  /** Overall SLA compliance, supplied by the parent as a percentage (0-100). */
  @Input() overallSlaCompliance = 0;

  /** Percentage-point change vs. last month, e.g. 8 or -3.5. Undefined hides the trend line. */
  @Input() changeVsLastMonth: number | null = null;

  // ── On Track / At Risk / Overdue breakdown — raw counts in, percentages
  // computed here (each count ÷ the sum of all three).
  @Input() onTrackCount = 0;
  @Input() atRiskCount = 0;
  @Input() overdueCount = 0;

  get slaBreakdownTotal(): number {
    return this.onTrackCount + this.atRiskCount + this.overdueCount;
  }

  get onTrackPercent(): number {
    return this.breakdownPct(this.onTrackCount);
  }

  get atRiskPercent(): number {
    return this.breakdownPct(this.atRiskCount);
  }

  get overduePercent(): number {
    return this.breakdownPct(this.overdueCount);
  }

  private breakdownPct(count: number): number {
    const total = this.slaBreakdownTotal;
    return total > 0 ? (count / total) * 100 : 0;
  }

  readonly radius = RADIUS;
  readonly circumference = CIRCUMFERENCE;

  // ── Overall SLA gauge — half circle (the 3 small rings above stay full
  // circles), using the same M/A arc-path technique as app-semi-circle-gauge.
  private readonly slaCx = 60;
  private readonly slaCy = 60;
  private readonly slaRadius = 50;

  get gauges(): GaugeViewModel[] {
    return [
      this.toViewModel(this.assignmentAcceptance),
      this.toViewModel(this.requisitionFulfillment),
      this.toViewModel(this.onTimeFulfillment),
    ];
  }

  get slaPercent(): number {
    return this.clamp(this.overallSlaCompliance);
  }

  /** Full 180°→0° sweep — the arc is always drawn as the complete red→green
   * scale (like a speedometer face); the marker below shows where the
   * current score sits on that fixed scale. */
  get slaTrackPath(): string {
    return this.slaArcPath(180, 0);
  }

  get slaMarkerPosition(): { x: number; y: number } {
    const endAngle = 180 - (this.slaPercent / 100) * 180;
    return this.slaToXY(endAngle);
  }

  /** Gradient endpoints in the same user-space coordinates as the arc, so
   * the red→green sweep runs left-to-right along the arc's actual span
   * instead of diagonally across its bounding box. */
  get slaGradientX1(): number {
    return this.slaCx - this.slaRadius;
  }

  get slaGradientX2(): number {
    return this.slaCx + this.slaRadius;
  }

  get slaGradientY(): number {
    return this.slaCy;
  }

  /** Percent text is color-coded by the same red/orange/yellow/green tiers
   * as the gauge's gradient, matching how the three small rings above use
   * their own metric color. */
  get slaTierColor(): string {
    const p = this.slaPercent;
    if (p >= 85) return '#27AE60';
    if (p >= 70) return '#F2C94C';
    if (p >= 50) return '#F2994A';
    return '#EB5757';
  }

  get trendDirection(): 'up' | 'down' | 'flat' {
    if (this.changeVsLastMonth === null || this.changeVsLastMonth === undefined) {
      return 'flat';
    }
    if (this.changeVsLastMonth > 0) return 'up';
    if (this.changeVsLastMonth < 0) return 'down';
    return 'flat';
  }

  private toViewModel(metric: SlaFractionMetric): GaugeViewModel {
    const percent = this.clamp(
      metric.total > 0 ? (metric.completed / metric.total) * 100 : 0
    );
    return {
      ...metric,
      percent,
      dashArray: this.dashArrayFor(percent),
    };
  }

  private dashArrayFor(percent: number): string {
    const filled = (percent / 100) * this.circumference;
    const remainder = this.circumference - filled;
    return `${filled} ${remainder}`;
  }

  /** angleDeg: 180 = left end of the half circle, 0 = right end, 90 = top. */
  private slaToXY(angleDeg: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: this.slaCx + this.slaRadius * Math.cos(rad),
      y: this.slaCy - this.slaRadius * Math.sin(rad),
    };
  }

  private slaArcPath(a1: number, a2: number): string {
    const p1 = this.slaToXY(a1);
    const p2 = this.slaToXY(a2);
    const largeArc = Math.abs(a1 - a2) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${this.slaRadius} ${this.slaRadius} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
