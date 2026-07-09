import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../job/services/job.service';

interface EvalDetail {
  relevance: number | null;
  completeness: number | null;
  accuracy: number | null;
  clarity: number | null;
}

interface EvalBreakdown {
  domainKnowledge: number | null;
  communicationClarity: number | null;
  problemSolving: number | null;
  jobRelevance: number | null;
}

interface QuestionVm {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  aiScore: number | null;
  maxScore: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Poor' | null;
  expanded: boolean;
  type: string;
  time: string;
  idealAnswer: string;
  candidateAnswer: string;
  aiEvaluation: string;
  evalDetail: EvalDetail;
  confidenceScore: number | null;
  confidenceLevel: string | null;
  breakdown: EvalBreakdown;
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
  averageAiScore: number | null;
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

  evalMetrics(q: any): { label: string; val: number | null }[] {
    if (!q.evalDetail) return [];
    return [
      { label: 'Relevance',    val: q.evalDetail.relevance },
      { label: 'Completeness', val: q.evalDetail.completeness },
      { label: 'Accuracy',     val: q.evalDetail.accuracy },
      { label: 'Clarity',      val: q.evalDetail.clarity },
    ];
  }

  /** The per-criterion 0-100 breakdown behind the overall score. */
  breakdownMetrics(q: any): { label: string; val: number | null }[] {
    if (!q.breakdown) return [];
    return [
      { label: 'Domain Knowledge',      val: q.breakdown.domainKnowledge },
      { label: 'Communication Clarity', val: q.breakdown.communicationClarity },
      { label: 'Problem Solving',       val: q.breakdown.problemSolving },
      { label: 'Job Relevance',         val: q.breakdown.jobRelevance },
    ];
  }

  confidenceClass(level: string | null): string {
    const l = (level ?? '').toLowerCase();
    if (l.includes('high')) return 'pass';
    if (l.includes('medium') || l.includes('moderate')) return 'hold';
    if (l.includes('low')) return 'reject';
    return '';
  }

}