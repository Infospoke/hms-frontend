import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../job/services/job.service';

interface EvalDetail {
  relevance: number;
  completeness: number;
  accuracy: number;
  clarity: number;
}

interface QuestionVm {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  aiScore: number;
  maxScore: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Poor';
  expanded: boolean;
  type: string;
  time: string;
  idealAnswer: string;
  candidateAnswer: string;
  aiEvaluation: string;
  evalDetail: EvalDetail;
}

interface ProctoringViolationVm {
  time: string;
  violation: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  snapshots: string[];
}

interface ProctoringVm {
  totalViolations: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  overallRisk: 'High' | 'Medium' | 'Low';
  violations: ProctoringViolationVm[];
}

interface AiInterviewVm {
  totalQuestions: number;
  attempted: number;
  averageAiScore: number;
  recommendation?: string;
  questions: QuestionVm[];
  proctoring: ProctoringVm;
}

@Component({
  selector: 'app-ai-interview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-interview.component.html',
  styleUrl: './ai-interview.component.scss'
})
export class AiInterviewComponent implements OnInit {
  @Input() data!: AiInterviewVm;
  @Input() applicationId!: any;


  loading = false;
  error: string | null = null;

  ngOnInit(): void {
   
  }

 

  toggle(q: any): void {
    q.expanded = !q.expanded;
  }

  riskClass(risk: string): string {
    const map: Record<string, string> = { High: 'reject', Medium: 'hold', Low: 'pass' };
    return map[risk] ?? 'pass';
  }

  evalMetrics(q: any): { label: string; val: number }[] {
    if (!q.evalDetail) return [];
    return [
      { label: 'Relevance',    val: q.evalDetail.relevance },
      { label: 'Completeness', val: q.evalDetail.completeness },
      { label: 'Accuracy',     val: q.evalDetail.accuracy },
      { label: 'Clarity',      val: q.evalDetail.clarity },
    ];
  }

}