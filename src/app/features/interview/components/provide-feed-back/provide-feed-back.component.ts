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
    // InterviewCandidateInfoComponent,
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

  isReadonly = false;
  roundId:any;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);
  interiviewMode:string|null=null;
  competencies: CompetencyRow[] = DEFAULT_COMPETENCIES.map(c => ({ ...c }));
  jobId:any|null=null;
  private readonly DECISION_LABEL: Record<string, string> = {
    next: 'Move to next round',
    hold: 'On Hold',
    rejected: 'Rejected',
    null: ''
  };
  isHolded:boolean=false;
  constructor() {

    const navState = this.router.getCurrentNavigation()?.extras?.state;
    this.currentStageId =
      navState?.['currentStageId'] ??
      history.state?.currentStageId ??
      null;
    this.isHolded=navState?.['type']??history.state?.type??false;
  }

  ngOnInit(): void {
    const applicantId = this.route.snapshot.params['id'];
    this.getInterviewSummary(applicantId);
    if(this.isHolded){
      this.loadFeedBackDetails(applicantId, this.currentStageId);
    }
  }

  private async getInterviewSummary(scheduleId: number) {
    const res: any = await this.interviewService.candidateSummaryDetails(scheduleId);
    if (res?.responsecode === '00') {
      const data = res.data;
      this.interiviewMode=data.interviewMode;
      this.interview = {
        type: data.interviewType,
        jobApplied: data.jobTitle,
        jobBadge: data.round,
        completedOn: data?.interviewCompletedOn ?? '',          // API doesn't provide this
        time: new Date(data?.interviewCompletedOn).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),                // API doesn't provide this
        venue: data.interviewMode,
        interviewId: scheduleId.toString(),
      };
      this.jobId=data.jobId;
      this.roundId=data?.roundId;
      this.candidate = {
        candidateId: scheduleId, // or applicantId if your API returns it
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
  async onFeedbackSubmit(value: any): Promise<void> {
    if (this.isSubmitting) return;

    // Helper: pull a competency rating by key, default 0 if missing
    const rating = (key: string): number =>
      value.competencies?.find((c: any) => c.key === key)?.rating ?? 0;

    const payload = {
      applicantId: this.candidate?.candidateId ?? 1,           // replace with real id from route/state
      interviewType: this.interview.type,
      roundType: this.interview.jobBadge,
      decision: this.DECISION_LABEL[value.decision] ?? value.decision,
      overallRating: value.overallRating,
      technicalKnowledge: rating('technical'),
      culturalFit: rating('cultural'),
      analyticalThinking: rating('analytical'),
      problemSolving: rating('problem'),
      communication: rating('communication'),
      strengths: value.strengths ?? '',
      areasOfImprovemnets: value.areasOfImprovement ?? '',   // note: backend typo kept intentionally
      additionalComments: value.additionalComments ?? '',
      interviewMode:this.interiviewMode,
      jobId:this.jobId,
      currentStageId:this.currentStageId,
      stageTypeId:this.roundId
    };

    this.isSubmitting = true;

    try {
      const res: any = await this.interviewService.submitTheInterviewFeedBack(payload);

      if (res?.responsecode === '00') {
        this.notificationService.success(res?.data || res?.message || 'Feedback submitted successfully.');
        this.router.navigate(['/candidate-management/in-person-interview'], { state: { activeType: 'fp' } });
      } else {
        this.notificationService.error(
          res?.message ?? res?.data ?? 'Failed to submit feedback. Please try again.',
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

 
  async handleDecision(decisionKey: 'next' | 'hold' | 'rejected'): Promise<void> {
    if (this.isSubmitting) return;

    const payload = {
      decision: this.DECISION_LABEL[decisionKey],
      jobId: this.jobId,
      stageTypeId: this.currentStageId,
      applicantId: this.candidate?.candidateId ?? null,
    };

    this.isSubmitting = true;

    try {
      const res: any = await this.interviewService.updateInterviewFeedBack(payload);

      if (res?.responsecode === '00') {
        this.notificationService.success(res?.data || res?.message || 'Decision updated successfully.');
        this.router.navigate(['/candidate-management/in-person-interview'], { state: { activeType: 'fp' } });
      } else {
        this.notificationService.error(
          res?.message ?? res?.data ?? 'Failed to update decision. Please try again.',
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

        // Fields that don't count as "feedback has been given" on their own
        const metaKeys = ['applicantId', 'currentStageId', 'interviewMode', 'interviewType'];
        const hasFeedback = Object.entries(data).some(
          ([key, value]) => !metaKeys.includes(key) && value !== null && value !== '' && value !== undefined,
        );

        if (hasFeedback) {
          this.existingFeedback = data;
          this.isReadonly = true;
          this.populateCompetencies(data);
        }
      }
    } catch (err) {
      console.error('[loadFeedBackDetails]', err);
    }
  }

  /** Maps the API's flat feedback fields onto the competency rows the form expects. */
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