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


  competencies = [
    { key: 'technical', label: 'Technical Knowledge', description: 'Core technical concepts and depth', rating: 5 },
    { key: 'problem', label: 'Problem Solving', description: 'Analytical and debugging approach', rating: 4 },
    { key: 'communication', label: 'Communication', description: 'Clarity and articulation', rating: 4 },
    { key: 'analytical', label: 'Analytical Thinking', description: 'Critical and logical thinking', rating: 4 },
    { key: 'cultural', label: 'Cultural Fit', description: 'Alignment with team values', rating: 5 },
  ]

  private interviewService = inject(InterviewServiceService);
  ngOnInit(): void {
   
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
