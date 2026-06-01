import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ConfigureRoundsComponent, EvaluationSettings, InterviewRound } from '../configure-rounds/configure-rounds.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';

export interface InterviewPlanForm {
  planName: string;
  description: string;
  rounds: InterviewRound[];
  evaluation: EvaluationSettings;
}

interface CreateInterviewPlanPayload {
  planName: string;
  description: string;
  rounds: {
    roundOrder: number;
    stageName: string;
    stageType: string;
    interviewMode: string;
    mandatory: boolean;
  }[];
}

interface CreateInterviewPlanResponse {
  data: string;
  message: string;
  responsecode: string;
}

@Component({
  selector: 'app-interview-plan-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfigureRoundsComponent, HeadingComponent],
  templateUrl: './interview-plan-create.component.html',
  styleUrl: './interview-plan-create.component.scss',
})
export class InterviewPlanCreateComponent implements OnInit {
  isEditMode = false;
  isSaving = false;
  saveError: string | null = null;

  planForm!: FormGroup;

  rounds: InterviewRound[] = [];
  evaluation: EvaluationSettings = {
    gradingScale: '1 - 5 (1 = Poor, 5 = Exceptional)',
    minimumPercentage: 60,
  };

  /** Tracks whether the user tried to save without rounds */
  roundsSubmitAttempted = false;

  readonly MAX_DESC = 500;
  readonly MAX_PLAN_NAME = 100;

  breadcrumbs = ['Home', 'Interview Plan', 'Create Plan'];

  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.planForm = this.fb.group({
      planName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(this.MAX_PLAN_NAME),
          Validators.pattern(/^[a-zA-Z0-9 _\-().]+$/),
        ],
      ],
      description: ['', [Validators.maxLength(this.MAX_DESC)]],
    });
  }

  // ── Convenience getters ───────────────────────────────────────────────────
  get planName(): AbstractControl { return this.planForm.get('planName')!; }
  get description(): AbstractControl { return this.planForm.get('description')!; }
  get descLength(): number { return this.description.value?.length ?? 0; }

  getPlanNameError(): string | null {
    const ctrl = this.planName;
    if (!ctrl.touched && !ctrl.dirty) return null;
    if (ctrl.hasError('required'))   return 'Plan name is required.';
    if (ctrl.hasError('minlength'))  return `Minimum ${ctrl.errors?.['minlength'].requiredLength} characters required.`;
    if (ctrl.hasError('maxlength'))  return `Maximum ${this.MAX_PLAN_NAME} characters allowed.`;
    if (ctrl.hasError('pattern'))    return 'Only letters, numbers, spaces, and _ - ( ) . are allowed.';
    return null;
  }

  getDescriptionError(): string | null {
    const ctrl = this.description;
    if (!ctrl.touched && !ctrl.dirty) return null;
    if (ctrl.hasError('maxlength')) return `Description cannot exceed ${this.MAX_DESC} characters.`;
    return null;
  }

  // ── Called by <app-configure-rounds> (savePlan) output ───────────────────
  async handleRoundsSaved(
    data: { rounds: InterviewRound[]; evaluation: EvaluationSettings }
  ): Promise<void> {
    this.roundsSubmitAttempted = true;

    // Mark all fields touched to trigger validation UI
    this.planForm.markAllAsTouched();

    if (this.planForm.invalid) {
      this.saveError = 'Please fix the errors above before saving.';
      // Scroll to the top of the page so the user sees the errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.rounds = data.rounds;
    this.evaluation = data.evaluation;

    if (this.rounds.length === 0) {
      this.saveError = 'Please add at least one interview round before saving.';
      return;
    }

    const payload: CreateInterviewPlanPayload = {
      planName: this.planForm.value.planName.trim(),
      description: this.planForm.value.description?.trim() ?? '',
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
      const response: CreateInterviewPlanResponse =
        await this.interviewService.createInterviewPlan(payload);

      if (response?.responsecode === '00') {
        this.notificationService.success(response?.data || response?.message);
        this.router.navigateByUrl('/interview/interview-plan');
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
    this.router.navigateByUrl('/interview/interview-plan');
  }
}