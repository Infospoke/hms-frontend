import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/** A single stage in the candidate pipeline funnel (e.g. "Applied", "Hired"). */
export interface PipelineStage {
  label: string;
  value: number;
  iconClass: string;
  iconColor: string;
  iconBgColor: string;
  /** Conversion % from the previous stage. Leave undefined for the first stage. */
  conversionPct?: number;
}

/** Config for the reusable candidate pipeline funnel widget. */
export interface PipelineConfig {
  title?: string;
  /** Options shown in the period dropdown, e.g. ['This Month', 'This Quarter']. */
  periods?: string[];
  selectedPeriod?: string;
  stages: PipelineStage[];
  overallConversionLabel?: string;
  overallConversionRate?: number;
  /** Recent conversion-rate history (oldest first) rendered as a small
   * sparkline next to the rate, e.g. [1.1, 1.3, 1.2, 1.4, 1.6]. */
  trendData?: number[];
  trendLabel?: string;
  trendDelta?: number;
  trendDirection?: 'up' | 'down';
}

@Component({
  selector: 'app-candidate-pipeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-pipeline.component.html',
  styleUrl: './candidate-pipeline.component.scss',
})
export class CandidatePipelineComponent implements OnChanges {

  @Input() title: string = 'Candidate Pipeline (All Requisitions)';
  @Input() periods: string[] = ['This Month'];
  @Input() selectedPeriod: string = 'This Month';
  @Input() stages: PipelineStage[] = [];
  @Input() overallConversionLabel: string = 'Overall Conversion Rate';
  @Input() overallConversionRate: number = 0;

  @Input() trendData?: number[];
  @Input() trendLabel: string = 'vs last month';
  @Input() trendDelta?: number;
  @Input() trendDirection: 'up' | 'down' = 'up';

  @Output() periodChange = new EventEmitter<string>();

  readonly sparklineWidth = 100;
  readonly sparklineHeight = 28;
  sparklinePoints = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trendData']) {
      this.buildSparkline();
    }
  }

  private buildSparkline(): void {
    const data = this.trendData ?? [];
    if (data.length < 2) {
      this.sparklinePoints = '';
      return;
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = this.sparklineWidth / (data.length - 1);
    this.sparklinePoints = data
      .map((v, i) => {
        const x = i * stepX;
        const y = this.sparklineHeight - ((v - min) / range) * this.sparklineHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  onPeriodChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = value;
    this.periodChange.emit(value);
  }
}
