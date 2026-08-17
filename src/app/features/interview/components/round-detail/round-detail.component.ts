import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InterviewFeedbackFormComponent,
  CompetencyRow,
} from '../interview-feedback-form/interview-feedback-form.component';
import { InterviewServiceService } from '../../service/interview-service.service';

@Component({
  selector: 'app-round-detail',
  standalone: true,
  imports: [CommonModule, InterviewFeedbackFormComponent],
  templateUrl: './round-detail.component.html',
  styleUrl: './round-detail.component.scss'
})
export class RoundDetailComponent implements OnInit {
  @Input() data!: any;
  @Input() roundTitle = 'Round';

  
  competencies:any[] = []

  private interviewService = inject(InterviewServiceService);
  ngOnInit(): void {
   this.competencies=this.data?.feedback?.competencies ?? []
  

  }

  
  private mapDecision(decision: string): string {
    switch (decision?.toLowerCase()) {
      case 'selected':
        return 'next';
      case 'hold':
        return 'hold';
      case 'rejected':
      case 'reject':
        return 'reject';
      default:
        return '';
    }
  }
  pillClass(rec: string): string {
    const map: Record<string, string> = {
      'Pass': 'pass',
      'Strong Hire': 'strong-hire',
      'Hold': 'hold',
      'Reject': 'reject',
    };
    return map[rec] ?? 'pass';
  }

  decisionLabel(decision: string | null): string {
    const map: Record<string, string> = {
      next: 'Move to Next Round',
      hold: 'Hold',
      reject: 'Reject',
    };
    return decision ? (map[decision] ?? decision) : '';
  }
}
