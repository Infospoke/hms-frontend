import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PipelineStage {
  id: string;
  label: string;
  icon: string;         // Tabler icon name e.g. 'ti-file-text'
  count: number;
  countColor?: 'purple' | 'blue' | 'teal' | 'amber';
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
        <i class="{{ stage.icon }} stage-icon" aria-hidden="true"></i>
        <div class="stage-body">
          <span class="stage-name">{{ stage.label }}</span>
          <span class="stage-count" [ngClass]="'count-' + (stage.countColor || 'purple')">
            {{ stage.count }} Candidates
          </span>
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

  selectStage(stage: PipelineStage): void {
    this.activeStageId = stage.id;
    this.stageSelected.emit(stage);
  }
}