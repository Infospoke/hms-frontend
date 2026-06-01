import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConfigureRoundsComponent, InterviewRound, EvaluationSettings } from '../configure-rounds/configure-rounds.component';
import { InterviewServiceService } from '../../service/interview-service.service';

export type PlanStatus = 'Active' | 'Inactive' | 'Pending' | 'Approved' | 'Rejected' | 'InProgress';

export type TimelineEventType =
  | 'created' | 'submitted' | 'approved'
  | 'rejected' | 'activated' | 'deactivated' | 'edited';

export interface TimelineEvent {
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  by: string;
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
  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly interviewPlanSvc  = inject(InterviewServiceService);

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
    this.isLoading    = true;
    this.errorMessage = null;

    try {
      const res:any= await this.interviewPlanSvc.planDetailsByID(id);
      const response=res?.data;
      const plan: InterviewPlanDetail = {
        planName:    response.planName   ?? response.plan_name   ?? '',
        status:      response.status                              ?? 'Pending',
        createdBy:   response.createdBy  ?? response.created_by  ?? '',
        createdOn:   response.createdOn  ?? response.created_on  ?? '',
        description: response.description                         ?? '',
        rounds:      response.interviewRoundsResponse                              ?? [],
        evaluation:  response.evaluation                          ?? { gradingScale: '', minimumPercentage: 0 },
        timeline:    response.timeline                            ?? [],
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
    this.displayPlan    = plan;
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
      this.router.navigate(['/interview/interview-plan'], { relativeTo: this.route });
    }
  }

  onEdit(): void {
    if (this.displayPlan) {
      this.edit.emit(this.displayPlan);
    }
  }

  // ── Timeline helpers ──────────────────────────────────────────────────────
  timelineIcon(type: TimelineEventType): string {
    const map: Record<TimelineEventType, string> = {
      created:     'fas fa-file-lines',
      submitted:   'fas fa-paper-plane',
      approved:    'fas fa-circle-check',
      rejected:    'fas fa-circle-xmark',
      activated:   'fas fa-toggle-on',
      deactivated: 'fas fa-toggle-off',
      edited:      'fas fa-pen-to-square',
    };
    return map[type] ?? 'fas fa-circle';
  }

  timelineColor(type: TimelineEventType): string {
    const map: Record<TimelineEventType, string> = {
      created:     '#2563eb',
      submitted:   '#f59e0b',
      approved:    '#22c55e',
      rejected:    '#ef4444',
      activated:   '#2563eb',
      deactivated: '#94a3b8',
      edited:      '#8b5cf6',
    };
    return map[type] ?? '#94a3b8';
  }
}