import { Component } from '@angular/core';
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

@Component({
  selector: 'app-provide-feed-back',
  standalone: true,
  imports: [
    CommonModule,
    HeadingComponent,
    InterviewCandidateInfoComponent,
    InterviewFeedbackFormComponent,
  ],
  templateUrl: './provide-feed-back.component.html',
  styleUrl: './provide-feed-back.component.scss',
})
export class ProvideFeedBackComponent {

  interview = {
    type: 'Technical Interview',
    jobApplied: 'Quality Assurance Engineer - L2',
    jobBadge: 'Round 1 - R1',
    completedOn: 'May 20, 2025',
    time: '11:00 AM – 12:00 PM',
    venue: 'Google Meet',
    interviewId: 'INT-2025-4512',
  };

  candidate: CandidateData = {
    firstName: 'Sneha',
    lastName: 'Priya',
    currentRole: 'QA Engineer',
    email: 'sneha@example.com',
    phone: '+91 98765 43210',
    currentLocation: 'Bangalore, Karnataka, India',
    stage: 'Round 1',
  };

  // Pass a fresh copy so mutations inside the form don't touch the original array
  competencies: CompetencyRow[] = DEFAULT_COMPETENCIES.map(c => ({ ...c }));

  onFeedbackSubmit(value: FeedbackFormValue): void {
    console.log('Feedback submitted:', value);
    // call your API / service here
  }

  onFeedbackCancel(): void {
    // navigate back
  }
}