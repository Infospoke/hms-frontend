import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import {
  ConfigureRoundsComponent,
  EvaluationSettings,
  InterviewRound,
} from '../configure-rounds/configure-rounds.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import {
  CommentModalAction,
  CommentModalConfig,
  CommentModalResult,
  CommonModalComponent,
} from '../../../../shared/components/common-modal/common-modal.component';

export interface InterviewPlanForm {
  planName: string;
  description: string;
  rounds: InterviewRound[];
  evaluation: EvaluationSettings;
}

interface CreateInterviewPlanPayload {
  planName: string;
  description: string;
  // active: boolean;
  status: string,
  rounds: {
    roundOrder: number;
    stageName: string;
    stageType: string;
    interviewMode: string;
    mandatory: boolean;
  }[];
}

interface UpdateInterviewPlanPayload extends CreateInterviewPlanPayload {
  id: string | number;
  comment?: string;
}

interface CreateInterviewPlanResponse {
  data: string;
  message: string;
  responsecode: string;
}

@Component({
  selector: 'app-interview-plan-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfigureRoundsComponent,
    HeadingComponent,
    CommonModalComponent,
  ],
  templateUrl: './interview-plan-create.component.html',
  styleUrl: './interview-plan-create.component.scss',
})
export class InterviewPlanCreateComponent implements OnInit {

  // ── Mode & state ──────────────────────────────────────────────────────────
  isEditMode = false;
  planId: string | number | null = null;
  isSaving = false;
  saveError: string | null = null;

  planForm!: FormGroup;

  rounds: InterviewRound[] = [];
  evaluation: EvaluationSettings = {
    gradingScale: '1 - 5 (1 = Poor, 5 = Exceptional)',
    minimumPercentage: 60,
  };

  roundsSubmitAttempted = false;

  readonly MAX_DESC = 500;
  readonly MAX_PLAN_NAME = 100;

  breadcrumbs = ['Home', 'Interview Plan', 'Create Plan'];

  // ── Comment modal state (mirrors create-new-chain pattern) ───────────────
  showCommentModal = false;
  commentModalAction: CommentModalAction | null = null;
  submittingModal = false;

  /** Dynamically derived config — mirrors create-new-chain's modalConfig getter */
  get modalConfig(): Partial<CommentModalConfig> | null {
    if (!this.commentModalAction) return null;
    const map: Record<CommentModalAction, Partial<CommentModalConfig>> = {
      approve: { title: 'Approve Plan', description: 'Please provide a comment for approving this plan.' },
      reject: { title: 'Reject Plan', description: 'Please provide a reason for rejecting this plan.' },
      deactivate: { title: 'Deactivate Plan', description: 'Please provide a reason for deactivating this interview plan.' },
      activate: { title: 'Activate Plan', description: 'Please provide a reason for activating this interview plan.' },
    };
    return map[this.commentModalAction] ?? null;
  }

  /** Holds the latest status-change comment until the plan is saved */
  private _pendingComment: string | null = null;

  // ── DI ────────────────────────────────────────────────────────────────────
  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const state = history.state as { id?: any; plan?: any };

    if (state?.id) {
      this.isEditMode = true;
      this.planId = state.id;
      this.breadcrumbs = ['Home', 'Interview Plan', 'Edit Plan'];
    }

    this.buildForm();

    if (this.isEditMode && state?.id) {
      this.loadPlan(state.id);
    }
  }

  // ── Form builder ──────────────────────────────────────────────────────────
  private buildForm(): void {
    this.planForm = this.fb.group({
      // In edit mode these are read-only — only the active toggle is editable
      planName: [
        { value: '', disabled: this.isEditMode },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(this.MAX_PLAN_NAME),
          Validators.pattern(/^[a-zA-Z0-9 _\-().]+$/),
        ],
      ],
      description: [
        { value: '', disabled: this.isEditMode },
        [Validators.maxLength(this.MAX_DESC)],
      ],
      // Disabled on create (always false); enabled only in edit mode
      active: [{ value: false, disabled: !this.isEditMode }],
    });
  }

  private patchFormFromPlan(plan: any): void {
    this.planForm.patchValue({
      planName: plan.planName ?? '',
      description: plan.description ?? '',
      active: plan.active ?? false,
    });
    this.rounds = plan.rounds ?? [];
    this.evaluation = plan.evaluation ?? this.evaluation;
  }

  private async loadPlan(id: string): Promise<void> {
  try {
    const res: any = await this.interviewService.planDetailsByID(id);

    const plan = res?.data;

    this.patchFormFromPlan({
      planName: plan.planName,
      description: plan.description,
      active: plan.status === 'ACTIVE',
      rounds: plan.interviewRoundsResponse || [],
      evaluation: plan.evaluation
    });

  } catch (err) {
    console.error(err);
    this.notificationService.error('Failed to load interview plan');
  }
}

  // ── Convenience getters ───────────────────────────────────────────────────
  get planName(): AbstractControl { return this.planForm.get('planName')!; }
  get description(): AbstractControl { return this.planForm.get('description')!; }
  get descLength(): number { return this.description.value?.length ?? 0; }
  get activeValue(): boolean { return this.planForm.get('active')?.value ?? false; }

  getPlanNameError(): string | null {
    const ctrl = this.planName;
    if (!ctrl.touched && !ctrl.dirty) return null;
    if (ctrl.hasError('required')) return 'Plan name is required.';
    if (ctrl.hasError('minlength')) return `Minimum ${ctrl.errors?.['minlength'].requiredLength} characters required.`;
    if (ctrl.hasError('maxlength')) return `Maximum ${this.MAX_PLAN_NAME} characters allowed.`;
    if (ctrl.hasError('pattern')) return 'Only letters, numbers, spaces, and _ - ( ) . are allowed.';
    return null;
  }

  getDescriptionError(): string | null {
    const ctrl = this.description;
    if (!ctrl.touched && !ctrl.dirty) return null;
    if (ctrl.hasError('maxlength')) return `Description cannot exceed ${this.MAX_DESC} characters.`;
    return null;
  }

  // ── Toggle (edit mode only) — mirrors create-new-chain toggleActive() ─────
  toggleActive(): void {
    if (!this.isEditMode) return;
    const ctrl = this.planForm.get('active')!;
    const newVal = !ctrl.value;
    // Optimistically flip the value; revert in closeCommentModal() if cancelled
    ctrl.setValue(newVal);
    this.openCommentModal(newVal ? 'activate' : 'deactivate');
  }

  // ── Comment modal — mirrors create-new-chain open/close/confirmed ─────────
  openCommentModal(action: CommentModalAction): void {
    this.commentModalAction = action;
    this.submittingModal = false;
    this.showCommentModal = true;
  }

  closeCommentModal(): void {
    // Revert optimistic toggle on cancel (same pattern as create-new-chain)
    if (this.commentModalAction === 'deactivate') { this.planForm.get('active')!.setValue(true); }
    if (this.commentModalAction === 'activate') { this.planForm.get('active')!.setValue(false); }
    this.showCommentModal = false;
    this.commentModalAction = null;
    this.submittingModal = false;
  }

  async onModalConfirmed(result: CommentModalResult): Promise<void> {
    if (!result?.comment) return;

    this.submittingModal = true;

    try {
      // Build status-change payload for edit mode
      const payload = {
        id: this.planId,
        status: result.action === 'activate' ? 'ACTIVE' : 'DEACTIVE',
        description: result.comment,
      };

      const res: any = await this.interviewService.updateInterviewPlanStatus(payload);

      if (res?.responsecode === '00') {
        // Store comment to include in the full save payload if the user later saves
        this._pendingComment = result.comment;
        this.showCommentModal = false;
        this.commentModalAction = null;
        this.notificationService.success(res?.data || res?.message || 'Status updated successfully.');
      } else {
        this.notificationService.error(
          res?.message ?? res?.data ?? 'Action failed. Please try again.',
        );
        // Revert the toggle on API failure
        this.closeCommentModal();
      }
    } catch (err: any) {
      console.error('[onModalConfirmed]', err);
      this.notificationService.error(
        err?.error?.message ?? err?.message ?? 'Failed to update status.',
      );
      this.closeCommentModal();
    } finally {
      this.submittingModal = false;
    }
  }


  async handleRoundsSaved(
    data: { rounds: InterviewRound[]; evaluation: EvaluationSettings }
  ): Promise<void> {
    this.roundsSubmitAttempted = true;
    this.planForm.markAllAsTouched();

    if (this.planForm.invalid) {
      this.saveError = 'Please fix the errors above before saving.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.rounds = data.rounds;
    this.evaluation = data.evaluation;

    if (this.rounds.length === 0) {
      this.saveError = 'Please add at least one interview round before saving.';
      return;
    }

    const basePayload: CreateInterviewPlanPayload = {
      planName: this.planForm.getRawValue().planName.trim(),
      description: this.planForm.getRawValue().description?.trim() ?? '',
      status: "DEACTIVE",
      rounds: this.rounds.map(r => ({
        roundOrder: r.order,
        stageName: r.stageName,
        stageType: r.stageType,
        interviewMode: r.interviewMode,
        mandatory: r.mandatory,
      })),
    };

    this.isSaving = true;
    this.saveError = null;

    try {
      let response: CreateInterviewPlanResponse;


      response = await this.interviewService.createInterviewPlan(basePayload);


      if (response?.responsecode === '00') {
        this.notificationService.success(response?.data || response?.message);
        this.router.navigateByUrl('/demand/interview-plan-config');
      } else {
        this.saveError = response?.data ?? 'An unexpected error occurred. Please try again.';
      }
    } catch (err: any) {
      this.saveError =
        err?.error?.message ??
        err?.message ??
        'Failed to save the interview plan. Please check your connection.';
    } finally {
      this.isSaving = false;
    }
  }

  onDiscard(): void {
    this.router.navigateByUrl('/demand/interview-plan-config');
  }
}