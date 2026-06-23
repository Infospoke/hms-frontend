import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConfigureRoundsComponent, InterviewRound, EvaluationSettings } from '../configure-rounds/configure-rounds.component';
import { InterviewServiceService } from '../../service/interview-service.service';

export type PlanStatus = 'ACTIVE' | 'DEACTIVE' | 'Pending' | 'Approved' | 'Rejected' | 'INPROGRESS';

export type TimelineEventType =
  | 'CREATED'
  | 'SUBMITTED'
  | 'APPROVE'
  | 'REJECTED'
  | 'ACTIVATE'
  | 'DEACTIVE'
  | 'EDITED' | 'Created' | 'Submitted' | 'Approve' | 'Rejected' | 'Activate' | 'Deactive' | 'Edited';
export interface TimelineEvent {
  action: TimelineEventType;
  title: string;
  description: string;
  comments: string,
  createdAt: string;
  by: string;
  createdBy: string,
  badge?: string;
  badgeType?: 'approved' | 'rejected' | 'pending';
}

export interface InterviewPlanDetail {
  planName: string;
  status: PlanStatus;
  createdBy: string;
  createdOn: string;
  description: string;
  rounds: InterviewRound[];
  evaluation: EvaluationSettings;
  timeline: TimelineEvent[];
}

@Component({
  selector: 'app-interview-plan-view',
  standalone: true,
  imports: [CommonModule, ConfigureRoundsComponent],
  templateUrl: './interview-plan-view.component.html',
  styleUrl: './interview-plan-view.component.scss',
})
export class InterviewPlanViewComponent implements OnInit {

  /** Optional: parent can still pass a plan directly (e.g. in a dialog). */
  @Input() plan: InterviewPlanDetail | null = null;

  @Output() back = new EventEmitter<void>();
  @Output() edit = new EventEmitter<InterviewPlanDetail>();

  // ── State ────────────────────────────────────────────────────────────────
  displayPlan: InterviewPlanDetail | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  breadcrumbs = ['Interview Plan Configuration', 'Interview Plans', '', 'Manage Plan'];

  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviewPlanSvc = inject(InterviewServiceService);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {

    if (this.plan) {
      this.setDisplayPlan(this.plan);
      return;
    }

    // Otherwise read the :id param from the route and fetch from the API.
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'No plan ID found in route.';
      return;
    }

    await this.loadPlan(id);
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private async loadPlan(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const res: any = await this.interviewPlanSvc.planDetailsByID(id);
      const response = res?.data;
      const plan: InterviewPlanDetail = {
        planName: response.planName ?? response.plan_name ?? '',
        status: response.status ?? 'Pending',
        createdBy: response.createdBy ?? response.created_by ?? '',
        createdOn: response.createdOn ?? response.created_on ?? '',
        description: response.description ?? '',
        rounds: response.interviewRoundsResponse ?? [],
        evaluation: response.evaluation ?? { gradingScale: '', minimumPercentage: 0 },
        timeline: response.commentTimeline ?? [],
      };

      this.setDisplayPlan(plan);
    } catch (err: any) {
      console.error('Failed to load interview plan:', err);
      this.errorMessage = err?.message ?? 'Failed to load plan details. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private setDisplayPlan(plan: InterviewPlanDetail): void {
    console.log(plan);
    this.displayPlan = plan;
    this.breadcrumbs[2] = plan.planName;
  }


  get descLength(): number {
    return this.displayPlan?.description?.length ?? 0;
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  onBack(): void {
    if (this.back.observed) {
      this.back.emit();
    } else {
      this.router.navigate(['/demand/interview-plan-config'], { relativeTo: this.route });
    }
  }

  onEdit(): void {
    if (this.displayPlan) {
      this.edit.emit(this.displayPlan);
    }
  }

  timelineIcon(type: TimelineEventType): string {
    const map: Record<TimelineEventType, string> = {
      CREATED: 'fas fa-file-lines',
      SUBMITTED: 'fas fa-paper-plane',
      APPROVE: 'fas fa-circle-check',
      REJECTED: 'fas fa-circle-xmark',
      ACTIVATE: 'fas fa-toggle-on',
      DEACTIVE: 'fas fa-toggle-off',
      EDITED: 'fas fa-pen-to-square',
      Created: 'fas fa-file-lines',
      Submitted: 'fas fa-paper-plane',
      Approve: 'fas fa-circle-check',
      Rejected: 'fas fa-circle-xmark',
      Activate: 'fas fa-toggle-on',
      Deactive: 'fas fa-toggle-off',
      Edited: 'fas fa-pen-to-square',
    };

    return map[type] ?? 'fas fa-circle';
  }

  timelineColor(type: TimelineEventType): string {
    const map: Record<TimelineEventType, string> = {
      CREATED: '#2563eb',
      SUBMITTED: '#f59e0b',
      APPROVE: '#22c55e',
      REJECTED: '#ef4444',
      ACTIVATE: '#2563eb',
      DEACTIVE: '#94a3b8',
      EDITED: '#8b5cf6',
      Created: '#2563eb',
      Submitted: '#f59e0b',
      Approve: '#22c55e',
      Rejected: '#ef4444',
      Activate: '#2563eb',
      Deactive: '#f59e0b',
      Edited: '#8b5cf6',
    };

    return map[type] ?? '#94a3b8';
  }
}