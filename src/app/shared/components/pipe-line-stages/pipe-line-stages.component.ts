import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StageColor =
  | 'purple' | 'blue' | 'teal' | 'amber' | 'green'
  | 'red' | 'pink' | 'indigo' | 'cyan' | 'orange';

export interface PipelineStage {
  id: string;
  label: string;
  icon: string;
  count: number;
  countColor?: StageColor;
 
  breakdown?: string;
  /** Optional caption under the number, e.g. "Candidates at hire stage". */
  caption?: string;
}

@Component({
  selector: 'app-pipeline-stages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stage-bar" role="tablist" aria-label="Interview pipeline stages">
      <div
        *ngFor="let stage of stages"
        class="stage-card"
        [class.active]="activeStageId === stage.id"
        role="tab"
        [attr.aria-selected]="activeStageId === stage.id"
        tabindex="0"
        (click)="selectStage(stage)"
        (keydown.enter)="selectStage(stage)"
        (keydown.space)="selectStage(stage)"
      >
        <span class="stage-icon-badge" [ngClass]="'badge-' + resolveColor(stage.countColor)">
          <i class="{{ stage.icon }}" aria-hidden="true"></i>
        </span>

        <div class="stage-body">
          <span class="stage-name">{{ stage.label }}</span>

          <span class="stage-count-row">
            <span class="stage-count">{{ stage.count }}</span>
            <span class="stage-breakdown" *ngIf="stage.breakdown">({{ stage.breakdown }})</span>
          </span>

          <span class="stage-caption" *ngIf="stage.caption">{{ stage.caption }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './pipe-line-stages.component.scss'
})
export class PipeLineStagesComponent {
  @Input() stages: PipelineStage[] = [];
  @Input() activeStageId: string | null = null;
  @Output() stageSelected = new EventEmitter<PipelineStage>();

  private readonly validColors: StageColor[] = [
    'purple', 'blue', 'teal', 'amber', 'green',
    'red', 'pink', 'indigo', 'cyan', 'orange'
  ];

  resolveColor(color?: StageColor): StageColor {
    return color && this.validColors.includes(color) ? color : 'blue';
  }

  selectStage(stage: PipelineStage): void {
    this.activeStageId = stage.id;
    this.stageSelected.emit(stage);
  }
}