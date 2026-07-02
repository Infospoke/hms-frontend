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
  ],
  templateUrl: './provide-feed-back.component.html',
  styleUrl: './provide-feed-back.component.scss',
})
export class ProvideFeedBackComponent implements OnInit {

  // ── Submission state ───────────────────────────────────────────────────────
  isSubmitting = false;

  interview: any;

  candidate: any;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);

  competencies: CompetencyRow[] = DEFAULT_COMPETENCIES.map(c => ({ ...c }));

  private readonly DECISION_LABEL: Record<string, string> = {
    next: 'Move to next round',
    hold: 'On Hold',
    rejected: 'Rejected',
    null: ''
  };
  ngOnInit(): void {
    const applicantId = this.route.snapshot.params['id'];
    this.getInterviewSummary(applicantId);
  }

  private async getInterviewSummary(scheduleId: number) {
    const res: any = await this.interviewService.candidateSummaryDetails(scheduleId);
    if (res?.responsecode === '00') {
      const data = res.data;

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
    };

    this.isSubmitting = true;

    try {
      const res: any = await this.interviewService.submitTheInterviewFeedBack(payload);

      if (res?.responsecode === '00') {
        this.notificationService.success(res?.data || res?.message || 'Feedback submitted successfully.');
        this.router.navigate(['/supply/my-interview-requests'], { state: { activeType: 'fp' } });
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

  handleBack(): void {
    this.router.navigate(['/supply/my-interview-requests'], { state: { activeType: 'fp' } });
  }
}