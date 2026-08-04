import { Component, EventEmitter, Input, Output } from '@angular/core';
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
 layout?: 'horizontal' | 'funnel';
}

@Component({
  selector: 'app-candidate-pipeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-pipeline.component.html',
  styleUrl: './candidate-pipeline.component.scss',
})
export class CandidatePipelineComponent {

  @Input() title: string = 'Candidate Pipeline (All Requisitions)';
  @Input() periods: string[] = ['This Month'];
  @Input() selectedPeriod: string = 'This Month';
  @Input() stages: PipelineStage[] = [];
  @Input() overallConversionLabel: string = 'Overall Conversion Rate';
  @Input() overallConversionRate: number = 0;
  @Input() layout: 'horizontal' | 'funnel' = 'horizontal';

  @Output() periodChange = new EventEmitter<string>();

  onPeriodChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = value;
    this.periodChange.emit(value);
  }
}
