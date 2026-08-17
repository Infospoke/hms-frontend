import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import {
  InterviewCandidateInfoComponent,
  CandidateData,
} from '../interview-candidate-info/interview-candidate-info.component';
import {
  InterviewFeedbackFormComponent,
  FeedbackFormValue,
  DEFAULT_COMPETENCIES,
  CompetencyRow,
} from '../interview-feedback-form/interview-feedback-form.component';
import { Router, ActivatedRoute } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-provide-feed-back',
  standalone: true,
  imports: [
    CommonModule,
    HeadingComponent,
    InterviewFeedbackFormComponent,
    InterviewCandidateInfoComponent
  ],
  templateUrl: './provide-feed-back.component.html',
  styleUrl: './provide-feed-back.component.scss',
})
export class ProvideFeedBackComponent implements OnInit {

  // ── Submission state ───────────────────────────────────────────────────────
  isSubmitting = false;

  interview: any;
  candidate: any;

  // ── Existing-feedback state ────────────────────────────────────────────────
  currentStageId: number | null = null;
  existingFeedback: any = null;
  /** true once we know feedback already exists for this applicant/stage */
  isReadonly = false;
  roundId: any;

  /** Comes from router state (row.status === 'Hold'). Only fetch existing feedback when true. */
  shouldFetchExistingFeedback = false;

  /** Normalized current decision from the GET-by-id response, e.g. 'Hold' -> 'hold'. Used to highlight the active button. */
  currentDecisionKey: 'next' | 'hold' | 'rejected' | null = null;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);
  interiviewMode: string | null = null;
  competencies: CompetencyRow[] = DEFAULT_COMPETENCIES.map(c => ({ ...c }));
  jobId: any | null = null;

  readonly DECISION_LABEL: Record<string, string> = {
    next: 'Move to Next Round',
    hold: 'Hold',
    rejected: 'Rejected',
    null: ''
  };

  /** Reverse lookup: API's stored decision string -> our internal key (case-insensitive, tolerant of old/alternate labels). */
  private readonly DECISION_KEY_BY_LABEL: Record<string, 'next' | 'hold' | 'rejected'> = {
    'move to next round': 'next',
    'move to interview': 'next',
    'hold': 'hold',
    'on hold': 'hold',
    'rejected': 'rejected',
    'reject': 'rejected',
  };

  /** Maps the reusable form's decision key ('next'|'hold'|'reject') -> the label the API expects. Used on first-time submit. */
  private readonly FORM_DECISION_LABEL: Record<string, string> = {
    next: 'Move to Next Round',
    hold: 'Hold',
    reject: 'Rejected',
  };

  /** Maps our internal decision key ('rejected') to the reusable form's key ('reject') for [initialDecision]. */
  get feedbackFormDecision(): 'next' | 'hold' | 'reject' | null {
    if (this.currentDecisionKey === 'rejected') return 'reject';
    return this.currentDecisionKey;
  }

  /** Human-readable label for the candidate's current decision, shown once feedback already exists. */
  get currentDecisionLabel(): string {
    return this.currentDecisionKey ? this.DECISION_LABEL[this.currentDecisionKey] : '';
  }

  constructor() {
    const navState = this.router.getCurrentNavigation()?.extras?.state;

    this.currentStageId =
      navState?.['currentStageId'] ??
      history.state?.currentStageId ??
      null;

    this.shouldFetchExistingFeedback =
      navState?.['type'] ??
      history.state?.['type'] ??
      false;
  }
     applicantId:any;
  ngOnInit(): void {
     this.applicantId = this.route.snapshot.params['id'];

    this.getInterviewSummary(this.applicantId);

    if (this.shouldFetchExistingFeedback) {
      this.loadFeedBackDetails(this.applicantId, this.currentStageId);
    }
  }

  private async getInterviewSummary(scheduleId: number) {
    const res: any = await this.interviewService.candidateSummaryDetails(scheduleId);
    if (res?.responsecode === '00') {
      const data = res.data;
      this.interiviewMode = data.interviewMode;
      this.interview = {
        type: data.interviewType,
        jobApplied: data.jobTitle,
        jobBadge: data.round,
        completedOn: data?.interviewCompletedOn ?? '',
        time: new Date(data?.interviewCompletedOn).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        venue: data.interviewMode,
        interviewId: scheduleId.toString(),
      };
      this.jobId = data.jobId;
      this.roundId = data?.roundId;
      this.candidate = {
        candidateId: data?.candidateId,
        firstName: data.candidateName?.split(' ')[0] || '',
        lastName: data.candidateName?.split(' ').slice(1).join(' ') || '',
        currentRole: data.jobTitle,
        email: data.email,
        phone: data.phone,
        currentLocation: data.currentLocation,
        stage: data.currentStage,
      };
    }
  }

  /** Handles the reusable feedback form's submit — includes the decision picked in the form's own "Decision" step (first-time submit only; [showDecision]="!isReadonly"). */
  async onFeedbackSubmit(value: any): Promise<void> {
    if (this.isSubmitting) return;

    const rating = (key: string): number =>
      value.competencies?.find((c: any) => c.key === key)?.rating ?? 0;

    const payload = {
      decision: value.decision ? (this.FORM_DECISION_LABEL[value.decision] ?? '') : '',
      applicantId: this.applicantId?? 1,
      interviewType: this.interview.type,
      roundType: this.interview.jobBadge,
      overallRating: value.overallRating,
      technicalKnowledge: rating('technical'),
      culturalFit: rating('cultural'),
      analyticalThinking: rating('analytical'),
      problemSolving: rating('problem'),
      communication: rating('communication'),
      strengths: value.strengths ?? '',
      areasOfImprovemnets: value.areasOfImprovement ?? '',
      additionalComments: value.additionalComments ?? '',
      interviewMode: this.interiviewMode,
      jobId: this.jobId,
      currentStageId: this.currentStageId,
      stageTypeId: this.roundId
    };

    this.isSubmitting = true;

    try {
      const res: any = await this.interviewService.submitTheInterviewFeedBack(payload);

      if (res?.responsecode === '00') {
        this.notificationService.success(res?.data || res?.message || 'Feedback submitted successfully.');
        this.router.navigate(['/candidate-management/in-person-interview'], { state: { activeType: 'fp' } });
      } else {
        this.notificationService.error(
          res?.errors?.[0] ?? res?.message ?? res?.data ?? 'Failed to submit feedback. Please try again.',
        );
      }
    } catch (err: any) {
      console.error('[onFeedbackSubmit]', err);
      this.notificationService.error(
        err?.error?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.',
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  onFeedbackCancel(): void {
    this.handleBack();
  }

  /** Old decision buttons (Move to Next Round / On Hold / Reject) — this is the only path for decision updates. */
  async handleDecision(decisionKey: 'next' | 'hold' | 'rejected'): Promise<void> {
    if (this.isSubmitting) return;

    if (!this.candidate?.candidateId || !this.jobId) {
      this.notificationService.error('Candidate details are still loading. Please try again in a moment.');
      return;
    }

    const payload = {
      applicantId: this.candidate?.candidateId ?? null,
      decision: this.DECISION_LABEL[decisionKey],
      jobId: this.jobId,
      currentStageId: this.currentStageId,
      // stageTypeId: this.roundId,
      // interviewMode: this.interiviewMode,
    };

    this.isSubmitting = true;

    try {
      const res: any = await this.interviewService.updateInterviewFeedBack(payload);

      if (res?.responsecode === '00') {
        this.notificationService.success(res?.data || res?.message || 'Decision updated successfully.');
        this.router.navigate(['/candidate-management/in-person-interview'], { state: { activeType: 'fp' } });
      } else {
        this.notificationService.error(
          res?.errors?.[0] ?? res?.message ?? res?.data ?? 'Failed to update decision. Please try again.',
        );
      }
    } catch (err: any) {
      console.error('[handleDecision]', err);
      this.notificationService.error(
        err?.error?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.',
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  handleBack(): void {
    this.router.navigate(['/candidate-management/in-person-interview'], { state: { activeType: 'fp' } });
  }

  private async loadFeedBackDetails(applicantId: number, currentStageId: number | null) {
    try {
      const res: any = await this.interviewService.getInterviewFeedBackById({
        applicantId,
        currentStageId,
      });

      if (res?.responsecode === '00' && res?.data) {
        const data = res.data;

        const metaKeys = ['applicantId', 'currentStageId', 'interviewMode', 'interviewType'];
        const hasFeedback = Object.entries(data).some(
          ([key, value]) => !metaKeys.includes(key) && value !== null && value !== '' && value !== undefined,
        );

        if (hasFeedback) {
          this.existingFeedback = data;
          this.isReadonly = true;
          this.populateCompetencies(data);

          if (data.decision) {
            this.currentDecisionKey = this.DECISION_KEY_BY_LABEL[String(data.decision).toLowerCase()] ?? null;
          }
        }
      }
    } catch (err) {
      console.error('[loadFeedBackDetails]', err);
    }
  }

  private populateCompetencies(data: any): void {
    const ratingByKey: Record<string, number> = {
      technical: data.technicalKnowledge,
      cultural: data.culturalFit,
      analytical: data.analyticalThinking,
      problem: data.problemSolving,
      communication: data.communication,
    };

    this.competencies = this.competencies.map(c => ({
      ...c,
      rating: ratingByKey[c.key] ?? c.rating,
    }));
  }
}