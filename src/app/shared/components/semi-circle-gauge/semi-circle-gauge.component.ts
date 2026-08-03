import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GaugeColorStop {
  /** Minimum score (inclusive) at which this color/label kicks in. */
  min: number;
  label: string;
  color: string;
}

const DEFAULT_COLOR_STOPS: GaugeColorStop[] = [
  { min: 85, label: 'Excellent', color: '#1E9E5A' },
  { min: 70, label: 'Good', color: '#2E9E5A' },
  { min: 50, label: 'Fair', color: '#E08B1D' },
  { min: 0, label: 'Needs Attention', color: '#DC2626' },
];

@Component({
  selector: 'app-semi-circle-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semi-circle-gauge.component.html',
  styleUrl: './semi-circle-gauge.component.scss',
})
export class SemiCircleGaugeComponent implements OnChanges {

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() score: number = 0;
  @Input() size: number = 180;
  @Input() strokeWidth: number = 16;
  /** Overrides the auto-computed tier label (e.g. "Excellent") if set. */
  @Input() label?: string;
  /** Override the score → color/label tiers. Must be sorted by `min` descending. */
  @Input() colorStops: GaugeColorStop[] = DEFAULT_COLOR_STOPS;
  @Input() trackColor: string = '#EDEDED';
  @Input() suffix: string = '%';

  // ── Derived render values ────────────────────────────────────────────────
  clampedScore = 0;
  trackPath = '';
  valuePath = '';
  radius = 0;
  activeColor = '';
  activeLabel = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.recalculate();
  }

  private recalculate(): void {
    this.clampedScore = Math.max(0, Math.min(100, this.score ?? 0));
    this.radius = (this.size - this.strokeWidth) / 2;

    const tier = this.resolveTier(this.clampedScore);
    this.activeColor = tier.color;
    this.activeLabel = this.label ?? tier.label;

    this.trackPath = this.arcPath(180, 0, this.radius);
    const angleForScore = 180 - (this.clampedScore / 100) * 180;
    this.valuePath = this.arcPath(180, angleForScore, this.radius);
  }

  private resolveTier(score: number): GaugeColorStop {
    const stops = [...this.colorStops].sort((a, b) => b.min - a.min);
    return stops.find(s => score >= s.min) ?? stops[stops.length - 1];
  }

  private toXY(angleDeg: number, r: number) {
    const cx = this.size / 2;
    const cy = this.size / 2;
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  }

  private arcPath(a1: number, a2: number, r: number): string {
    const p1 = this.toXY(a1, r);
    const p2 = this.toXY(a2, r);
    const largeArc = Math.abs(a1 - a2) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  }
}