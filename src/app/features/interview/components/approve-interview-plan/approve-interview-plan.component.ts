import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { InterviewServiceService } from '../../service/interview-service.service';

export interface InterviewRoundResponse {
  roundOrder: number;
  stageName: string;
  stageType: string;
  interviewMode: string;
  mandatory: boolean;
}

export interface PlanDetailApiResponse {
  planName: string;
  status: string;
  description: string;
  createdBy: string;
  createdOn: string;
  interviewRoundsResponse: InterviewRoundResponse[];
}

export interface ApiResponse {
  data: PlanDetailApiResponse;
  message: string;
  responsecode: string;
}

// ── View Model Interfaces ──────────────────────────────────────────────────────

export interface InterviewRound {
  order: number;
  stageName: string;
  stageType: string;
  interviewMode: string;
  mandatory: boolean;
}

export interface PlanDetails {
  planName: string;
  numberOfRounds: number;
  status: string;
  description: string;
  descriptionMaxLength: number;
  createdBy: string;
  createdOn: Date;
}

export interface RequestedDetails {
  requestedFor: string;
  requestedOn: Date;
  comments: string;
}

@Component({
  selector: 'app-approve-interview-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, HeadingComponent],
  templateUrl: './approve-interview-plan.component.html',
  styleUrl: './approve-interview-plan.component.scss',
})
export class ApproveInterviewPlanComponent implements OnInit, OnDestroy {

  readonly commentsMaxLength = 500;

  planId: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  planDetails: PlanDetails = {
    planName: '',
    numberOfRounds: 0,
    status: '',
    description: '',
    descriptionMaxLength: 500,
    createdBy: '',
    createdOn: new Date(),
  };

  interviewRounds: InterviewRound[] = [];

  requestedDetails: RequestedDetails = {
    requestedFor: '',
    requestedOn: new Date(),
    comments: '',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private interviewPlanService: InterviewServiceService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.planId = params.get('id');
        if (this.planId) {
          this.loadPlanDetails(this.planId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data Loading ─────────────────────────────────────────────────────────────

  private async loadPlanDetails(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const response: ApiResponse = await this.interviewPlanService.planDetailsByID(id);

      if (response?.responsecode === '00' && response.data) {
        this.mapApiResponseToViewModel(response.data);
      } else {
        this.errorMessage = response?.message ?? 'Failed to load plan details.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred while fetching plan details.';
      console.error('loadPlanDetails error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapApiResponseToViewModel(data: PlanDetailApiResponse): void {
    const rounds = data.interviewRoundsResponse ?? [];

    this.planDetails = {
      planName: data.planName,
      numberOfRounds: rounds.length,
      status: data.status,
      description: data.description,
      descriptionMaxLength: 500,
      createdBy: data.createdBy,
      createdOn: new Date(data.createdOn),
    };

    this.interviewRounds = rounds.map(r => ({
      order: r.roundOrder,
      stageName: r.stageName,
      stageType: r.stageType,
      interviewMode: r.interviewMode,
      mandatory: r.mandatory,
    }));

    this.requestedDetails = {
      requestedFor: data.planName,
      requestedOn: new Date(data.createdOn),
      comments: '',
    };
  }

  // ── Computed Getters ──────────────────────────────────────────────────────────

  get commentsLength(): number {
    return this.requestedDetails.comments?.length ?? 0;
  }

  get descriptionLength(): number {
    return this.planDetails.description?.length ?? 0;
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  onApprovePlan(): void {
    if (!this.planId) return;

    console.log('Plan approved', {
      id: this.planId,
      planName: this.planDetails.planName,
      comments: this.requestedDetails.comments,
    });
    // TODO: call approval service endpoint
    // this.interviewPlanService.approvePlan(this.planId, this.requestedDetails.comments)
  }

  onRejectPlan(): void {
    if (!this.planId) return;

    console.log('Plan rejected', {
      id: this.planId,
      planName: this.planDetails.planName,
      comments: this.requestedDetails.comments,
    });
    // TODO: call rejection service endpoint
    // this.interviewPlanService.rejectPlan(this.planId, this.requestedDetails.comments)
  }
}