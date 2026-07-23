import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalStage, STAGE_STATUS_CONFIG, StageStatus, StageStatusDef } from '../../../../shared/constants/approval.stage.modal';

@Component({
  selector: 'app-approval-pipeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './approval-pipeline.component.html',
  styleUrl: './approval-pipeline.component.scss',
})
export class ApprovalPipelineComponent {
  /** Ordered list of stages to render left→right. */
  @Input({ required: true }) stages: ApprovalStage[] = [];

  /** Card title, e.g. "Approval Pipeline". */
  @Input() title = 'Approval Pipeline';

  /** Font Awesome icon class shown next to the title. */
  @Input() titleIcon = 'fa-solid fa-diagram-project';

  /** Override the status→visuals mapping if a consumer ever needs custom colors/labels. */
  @Input() stageStatusCfg: Record<StageStatus, StageStatusDef> = STAGE_STATUS_CONFIG;

  get progressPercent(): number {
    if (!this.stages.length) return 0;
    const done = this.stages.filter(s => this.isDone(s.status)).length;
    return Math.round((done / this.stages.length) * 100);
  }

  get progressStep(): string {
    const done = this.stages.filter(s => this.isDone(s.status)).length;
    return `Step ${done} of ${this.stages.length}`;
  }

  private isDone(status: StageStatus): boolean {
    return status === 'APPROVED' || status === 'REJECTED' || status === 'CREATED';
  }

  isActiveStage(status: StageStatus): boolean {
    return status === 'IN_PROGRESS';
  }

  getStageCircleStyle(status: StageStatus) {
    const c = this.stageStatusCfg[status];
    return { background: c.bg, border: `2px solid ${c.border}` };
  }
}