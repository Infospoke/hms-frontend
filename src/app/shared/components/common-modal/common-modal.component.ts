import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
export type CommentModalAction =
  | 'approve'
  | 'reject'
  | 'deactivate'
  | 'activate';
 
// ─── Per-action display config (icon, button CSS class, labels) ───────────────
export interface CommentModalConfig {
  /** Modal title text */
  title: string;
  /** Helper text shown above the textarea */
  description: string;
  /** Font Awesome icon class for the title */
  iconClass: string;
  /** CSS modifier appended to .cm-btn--confirm  e.g. 'approve' | 'reject' | 'activate' */
  confirmVariant: 'approve' | 'reject' | 'activate';
  /** Label on the confirm button */
  confirmLabel: string;
  /** Icon inside the confirm button */
  confirmIconClass: string;
}
 
/** Default configuration map — consumers can override via [config] input */
export const DEFAULT_MODAL_CONFIGS: Record<CommentModalAction, CommentModalConfig> = {
  approve: {
    title: 'Approve',
    description: 'Please provide a comment for approving.',
    iconClass: 'fa-solid fa-circle-check cm-icon--approve',
    confirmVariant: 'approve',
    confirmLabel: 'Approve',
    confirmIconClass: 'fa-solid fa-check',
  },
  reject: {
    title: 'Reject',
    description: 'Please provide a reason for rejecting.',
    iconClass: 'fa-solid fa-circle-xmark cm-icon--reject',
    confirmVariant: 'reject',
    confirmLabel: 'Reject',
    confirmIconClass: 'fa-solid fa-xmark',
  },
  deactivate: {
    title: 'Deactivate',
    description: 'Please provide a reason for deactivating.',
    iconClass: 'fa-solid fa-circle-minus cm-icon--deactivate',
    confirmVariant: 'reject',
    confirmLabel: 'Deactivate',
    confirmIconClass: 'fa-solid fa-ban',
  },
  activate: {
    title: 'Activate',
    description: 'Please provide a reason for activating.',
    iconClass: 'fa-solid fa-circle-check cm-icon--approve',
    confirmVariant: 'activate',
    confirmLabel: 'Activate',
    confirmIconClass: 'fa-solid fa-check',
  },
};
 
/** Payload emitted by (confirmed) */
export interface CommentModalResult {
  action: CommentModalAction;
  comment: string;
}
@Component({
  selector: 'app-common-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './common-modal.component.html',
  styleUrl: './common-modal.component.scss',
})
export class CommonModalComponent implements OnChanges {
 
  // ── Inputs ────────────────────────────────────────────────────────────────
 
  /** Whether the modal is visible */
  @Input() visible = false;
 
  /** Which action this modal represents */
  @Input() action: CommentModalAction | null = null;
 
  /**
   * Optional override config. If omitted the component derives config
   * automatically from DEFAULT_MODAL_CONFIGS[action].
   * Consumers can pass a partial or full CommentModalConfig to customise
   * titles / descriptions per-use-case (e.g. "Approve Chain" vs "Approve SR").
   */
  @Input() config: Partial<CommentModalConfig> | null = null;
 
  /** While true the confirm button shows a spinner and both buttons are disabled */
  @Input() submitting = false;
 
  // ── Outputs ───────────────────────────────────────────────────────────────
 
  /** Fires when the user clicks Cancel or the backdrop */
  @Output() cancelled = new EventEmitter<void>();
 
  /**
   * Fires when the user clicks the confirm button with a valid comment.
   * The parent is responsible for the actual API call and setting [submitting].
   */
  @Output() confirmed = new EventEmitter<CommentModalResult>();
 
  // ── Internal state ────────────────────────────────────────────────────────
  commentText = '';
  commentError = '';
 
  /** Resolved config (defaults merged with [config] override) */
  get resolvedConfig(): CommentModalConfig {
    const base =
      DEFAULT_MODAL_CONFIGS[this.action ?? 'approve'] ??
      DEFAULT_MODAL_CONFIGS['approve'];
    return { ...base, ...(this.config ?? {}) };
  }
 
  get commentLength(): number {
    return this.commentText.length;
  }
 
  // ── Lifecycle ─────────────────────────────────────────────────────────────
 
  ngOnChanges(changes: SimpleChanges): void {
    // Reset internal state whenever the modal is opened (visible flips to true)
    if (changes['visible'] && this.visible) {
      this.commentText = '';
      this.commentError = '';
    }
  }
 
  // ── Handlers ─────────────────────────────────────────────────────────────
 
  onBackdropClick(): void {
    if (!this.submitting) {
      this.cancelled.emit();
    }
  }
 
  onCancelClick(): void {
    if (!this.submitting) {
      this.cancelled.emit();
    }
  }
 
  onConfirmClick(): void {
    // Validate
    const trimmed = this.commentText.trim();
    if (!trimmed) {
      this.commentError = 'Comment is required.';
      return;
    }
    if (trimmed.length < 6) {
      this.commentError = 'Comment must be at least 6 characters.';
      return;
    }
 
    this.commentError = '';
    this.confirmed.emit({
      action: this.action!,
      comment: trimmed,
    });
  }
}