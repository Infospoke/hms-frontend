import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalStage, STAGE_STATUS_CONFIG, StageStatus, StageStatusDef } from '../../../../shared/constants/approval.stage.modal';

@Component({
  selector: 'app-approval-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './approval-timeline.component.html',
  styleUrl: './approval-timeline.component.scss',
})
export class ApprovalTimelineComponent {
  /** Ordered list of stages to render top→bottom (usually excludes the "creator" stage — pass what you want shown). */
  @Input({ required: true }) stages: ApprovalStage[] = [];

  /** Card title, e.g. "Approval Timeline" / "Comments Timeline". */
  @Input() title = 'Approval Timeline';

  /** Font Awesome icon class shown next to the title. */
  @Input() titleIcon = 'fa-regular fa-clock';

  /**
   * When true, shows the "use Approve/Reject buttons below" hint on the
   * IN_PROGRESS card. Set false for read-only / view-only pages.
   */
  @Input() isActionMode = true;

  /** Empty-state copy shown when there is no approver chain configured yet. */
  @Input() emptyStateTitle = 'No approval chain configured yet';
  @Input() emptyStateSub =
    'No approvers have been assigned yet. Click Approve or Reject below to add your comment and take action.';

  @Input() stageStatusCfg: Record<StageStatus, StageStatusDef> = STAGE_STATUS_CONFIG;

  get hasStages(): boolean {
    return this.stages.length > 0;
  }

  getStatusBadgeStyle(status: StageStatus) {
    const c = this.stageStatusCfg[status];
    return { color: c.color, background: c.bg, border: `1px solid ${c.border}` };
  }

  getAvatarStyle(status: StageStatus) {
    return { background: this.stageStatusCfg[status].color };
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  isActioned(status: StageStatus): boolean {
    return status === 'APPROVED' || status === 'REJECTED' || status === 'CREATED';
  }

  /** Strips HTML/markdown image noise out of rich-text comment fields before display. */
  sanitizeComment(raw: string | undefined): string {
    if (!raw) return '';
    return raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, '[image removed]')
      .replace(/<img[^>]*>/gi, '[image removed]')
      .replace(/data:image\/[^;]+;base64,[^\s"')]+/gi, '[image removed]')
      .replace(/\s+/g, ' ')
      .trim();
  }
}