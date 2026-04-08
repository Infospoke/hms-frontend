import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../shared/constants/candidate.modal';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss']
})
export class CandidateDetailComponent implements OnChanges {
  @Input() candidate: any = null;
  @Output() action = new EventEmitter<{ type: string; candidate: any }>();

  viewMode: 'default' | 'screening' | 'interview' = 'default';
  expandedQuestion: number | null = null;

  ngOnChanges(): void {
    this.expandedQuestion = null;
    if (!this.candidate) { this.viewMode = 'default'; return; }
    const s = this.candidate.status?.toLowerCase();
    if (s === 'screened') this.viewMode = 'screening';
    else if (s === 'interview') this.viewMode = 'interview';
    else this.viewMode = 'default';
  }

  onViewResume(): void {
    if (this.candidate) this.action.emit({ type: 'viewResume', candidate: this.candidate });
  }

  onAction(type: string): void {
    if (this.candidate) this.action.emit({ type, candidate: this.candidate });
  }

  toggleQuestion(index: number): void {
    this.expandedQuestion = this.expandedQuestion === index ? null : index;
  }

  get screeningData(): any {
    if (!this.candidate) return null;
    if (this.candidate.screeningData) return this.candidate.screeningData;
    return {
      finalScore: 0,
      skillMatch: 0,
      experience: 0,
      education: 0,
      keywords: 0,
      growth: 0,
      recommendation: { level: 'N/A', action: 'N/A' },
      summary: 'No screening data available.',
      skillsAnalysis: { matchPercentage: '0%', matched: [], missing: 'N/A' },
      educationAnalysis: { level: 'N/A', highlights: '', matched: '' },
      assessment: { strengths: [], weaknesses: [] },
      jobAnalysis: { fresher: 'N/A', firstJobStartYear: 'N/A', lastJobEndYear: 'N/A', totalJobsCount: 0 }
    };
  }

  get interviewData(): any {
    if (!this.candidate) return null;
    if (this.candidate.interviewData) return this.candidate.interviewData;
    return {
      finalScore: 0,
      skillMatch: 0,
      experience: 0,
      education: 0,
      keywords: 0,
      growth: 0,
      overallScore: 0,
      questionsAttempted: '0/0',
      proctoringViolations: 0,
      proctoringResults: [],
      questions: []
    };
  }
}