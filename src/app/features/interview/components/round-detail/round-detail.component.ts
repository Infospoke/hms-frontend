import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InterviewFeedbackFormComponent,
  CompetencyRow,
} from '../interview-feedback-form/interview-feedback-form.component';

@Component({
  selector: 'app-round-detail',
  standalone: true,
  imports: [CommonModule, InterviewFeedbackFormComponent],
  templateUrl: './round-detail.component.html',
  styleUrl:'./round-detail.component.scss'
})
export class RoundDetailComponent {
  @Input() data!: any;
  @Input() roundTitle = 'Round';

  pillClass(rec: string): string {
    const map: Record<string, string> = {
      'Pass':        'pass',
      'Strong Hire': 'strong-hire',
      'Hold':        'hold',
      'Reject':      'reject',
    };
    return map[rec] ?? 'pass';
  }

  decisionLabel(decision: string | null): string {
    const map: Record<string, string> = {
      next:   'Move to Next Round',
      hold:   'Hold',
      reject: 'Reject',
    };
    return decision ? (map[decision] ?? decision) : '';
  }

  get feedbackCompetencies(): CompetencyRow[] {
    return (this.data?.feedback?.competencies ?? []) as CompetencyRow[];
  }
}
