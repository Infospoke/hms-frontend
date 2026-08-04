import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FunnelStageData {
  label: string;
  value: number;
  color: string;
}

interface FunnelRow {
  stage: FunnelStageData;
  clipPath: string | null;
  topPercent: number;
  /** Last stage renders as a straight-sided rectangle (not tapered) so its
   * bottom-left/right corners can actually be rounded — border-radius has
   * no effect on the clip-path'd trapezoid rows above it. */
  isLast: boolean;
  widthPercent: number;
}

/**
 * Hand-rolled CSS trapezoid funnel (no ApexCharts) — each stage is a
 * `clip-path` polygon row, so the taper is always a clean, predictable
 * pyramid regardless of how skewed the values are (ApexCharts' `isFunnel`
 * bar can render a spiky/irregular shape when the last value is tiny
 * relative to the first). A "Conversion %" column on the right lists the
 * step-by-step conversion (value[i] / value[i-1]), row-aligned with the
 * stage it leads into — same pattern as the reference funnel image.
 */
@Component({
  selector: 'app-funnel-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funnel-chart.component.html',
  styleUrl: './funnel-chart.component.scss',
})
export class FunnelChartComponent implements OnChanges {
  @Input() title: string = 'Recruitment Funnel';
  @Input() subTitle: string = '';
  @Input() stages: FunnelStageData[] = [];
  @Input() showTopPercent: boolean = true;
  @Input() height: number = 300;

  rows: FunnelRow[] = [];
  conversions: number[] = [];

  /** Minimum width a band can taper to, as a fraction of the top band's
   * full width — keeps the last (usually tiny) stage's text legible
   * instead of collapsing to a sliver or a sharp point. Raised from 0.34
   * so the bottom-most rows (e.g. "Offers Accepted", "Hired") have enough
   * room that their text doesn't crowd the trapezoid's slanted edges. */
  private readonly minWidthFrac = 0.5;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stages']) {
      this.build();
    }
  }

  private build(): void {
    const top = this.stages[0]?.value || 1;

    // sqrt scaling compresses the range a bit so mid/late stages don't
    // collapse too fast, then floor it so the funnel never gets illegibly
    // thin at the bottom.
    const widthFrac = (v: number) => Math.max(this.minWidthFrac, Math.sqrt(v / top));

    this.rows = this.stages.map((stage, i) => {
      const isLast = i === this.stages.length - 1;
      const topFrac = i === 0 ? 1 : widthFrac(this.stages[i - 1].value);
      // Last row keeps the same width top-to-bottom (a straight rectangle)
      // instead of tapering further, so its bottom corners can be rounded.
      const botFrac = isLast ? topFrac : widthFrac(stage.value);

      const leftTop = 50 - topFrac * 50;
      const rightTop = 50 + topFrac * 50;
      const leftBot = 50 - botFrac * 50;
      const rightBot = 50 + botFrac * 50;

      return {
        stage,
        clipPath: isLast ? null : `polygon(${leftTop}% 0%, ${rightTop}% 0%, ${rightBot}% 100%, ${leftBot}% 100%)`,
        topPercent: Math.round((stage.value / top) * 1000) / 10,
        isLast,
        widthPercent: topFrac * 100,
      };
    });

    this.conversions = [];
    for (let i = 1; i < this.stages.length; i++) {
      const prev = this.stages[i - 1].value;
      const curr = this.stages[i].value;
      this.conversions.push(prev > 0 ? Math.round((curr / prev) * 1000) / 10 : 0);
    }
  }
}
