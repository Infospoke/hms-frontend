import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  effect,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { Candidate, TabKey } from '../../../../shared/constants/candidate.modal';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-applied-candidates',
  imports: [CommonModule, FormsModule, NzDatePickerModule],
  templateUrl: './applied-candidates.component.html',
  styleUrl: './applied-candidates.component.scss',
})
export class AppliedCandidatesComponent implements OnChanges {
  @Input() jobId: any = null;
  @Output() candidateSelected = new EventEmitter<Candidate>();
  @Output() statusSelected = new EventEmitter<any>();

  private job = inject(JobService);

  tabs = [
    { label: 'Applied', key: 'applied', value: 'APPLIED' },
    { label: 'Screening', key: 'screening', value: 'SCREENED' },
    { label: 'Interview', key: 'interview', value: 'INTERVIEW' },
    { label: 'Offer', key: 'offer', value: 'OFFER' },
    { label: 'Hired', key: 'hired', value: 'HIRED' }
  ];

  activeTab: TabKey = 'applied';
  searchQuery = '';
  dateRange: Date[] = [];
  selectedCandidate: Candidate | null = null;
  filteredCandidates: Candidate[] = [];

  allApplicants = computed(() => this.job.applicants$());
  allAnalysis = computed(() => this.job.analysis$()?.resume_analysis || []);

  candidates = computed(() => {
    const applicants = this.allApplicants();
    const analysisList = this.allAnalysis();
    if (!applicants?.length) return [];

    return applicants.map((app: any) => {
      const analysis = analysisList.find((a: any) => a.application_id === app.id);
      const createdDate = app.createdDate ? new Date(app.createdDate) : null;

      return {
        id: app.id,
        jobId: app.jobId,
        name: `${app.firstName} ${app.lastName}`,
        initials: this.getInitials(app.firstName, app.lastName),
        avatarBg: this.getAvatarColor(app.id),
        role: analysis?.job_title || 'Candidate',
        appliedDate: createdDate ? this.formatDate(createdDate) : 'N/A',
        createdDateRaw: createdDate,
        skills: analysis?.matching_skills || [],
        skillsIdentified: analysis?.matching_skills || [],
        experience: analysis?.experience_level || 'N/A',
        source: 'Portal',
        location: analysis?.location || 'N/A',
        status: app.status,
        displayStatus: app.screenedStatus || app.status,
        matchScore: `${analysis?.final_score ?? 0}`,
        email: app.email,
        phone: app.phNo,
        recruiterNote: analysis?.recommendation_reason || '',
        keywordMatch: analysis?.keywords_match ?? 0,
        experienceMatch: analysis?.experience_score ?? 0,
        portfolioQuality: analysis?.education_score ?? 0,
        skillScore: analysis?.skills_match ?? 0,
        experienceScore: analysis?.experience_score ?? 0,
        keywordScore: analysis?.keywords_match ?? 0,
        screeningData: analysis ? this.mapScreeningData(analysis) : null,
        interviewData: analysis ? this.mapInterviewData(analysis, app) : null
      };
    });
  });

  private candidateEffect = effect(() => {
    const list = this.candidates();
    this.applyFilter(list);
    if (this.filteredCandidates.length) {
      this.selectCandidate(this.filteredCandidates[0]);
    }
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobId'] && this.jobId) {
      this.activeTab = 'applied';
      this.searchQuery = '';
      this.dateRange = [];
      this.selectedCandidate = null;
      this.statusSelected.emit('APPLIED');
    }
  }

  mapScreeningData(analysis: any): any {
    return {
      finalScore: analysis.final_score ?? 0,
      skillMatch: analysis.skills_match ?? 0,
      experience: analysis.experience_score ?? 0,
      education: analysis.education_score ?? 0,
      keywords: analysis.keywords_match ?? 0,
      growth: analysis.growth_score ?? 0,
      recommendation: {
        level: analysis.recommendation_level || 'Medium',
        action: analysis.recommendation_action || 'Review'
      },
      summary: analysis.recommendation_reason || '',
      skillsAnalysis: {
        matchPercentage: `${analysis.skills_match ?? 0}%`,
        matched: analysis.matching_skills || [],
        missing: analysis.missing_skills?.join(', ') || 'NA'
      },
      educationAnalysis: {
        level: analysis.education_level || 'N/A',
        highlights: analysis.education_highlights || '',
        matched: analysis.matched_education || ''
      },
      assessment: {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || []
      },
      jobAnalysis: {
        fresher: analysis.is_fresher ? 'True' : 'False',
        firstJobStartYear: analysis.first_job_start_year || 'N/A',
        lastJobEndYear: analysis.last_job_end_year || 'N/A',
        totalJobsCount: analysis.total_jobs_count ?? 0
      }
    };
  }

  mapInterviewData(analysis: any, app: any): any {
    const interview = app.interviewResult || analysis.interview || {};
    return {
      finalScore: interview.final_score ?? analysis.final_score ?? 0,
      skillMatch: interview.skills_match ?? analysis.skills_match ?? 0,
      experience: interview.experience_score ?? analysis.experience_score ?? 0,
      education: interview.education_score ?? analysis.education_score ?? 0,
      keywords: interview.keywords_match ?? analysis.keywords_match ?? 0,
      growth: interview.growth_score ?? analysis.growth_score ?? 0,
      overallScore: interview.overall_score ?? 0,
      questionsAttempted: interview.questions_attempted || '0/0',
      proctoringViolations: interview.proctoring_violations ?? 0,
      proctoringResults: interview.proctoring_results || [],
      questions: interview.questions || []
    };
  }

  getInitials(first: string, last: string) {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  }

  getAvatarColor(id: number) {
    const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];
    return colors[id % colors.length];
  }

  formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  private tabFilterMap: Record<TabKey, string[]> = {
    applied: [],
    screening: ['SCREENED'],
    interview: ['INTERVIEW'],
    offer: ['OFFER'],
    hired: ['HIRED']
  };

  setActiveTab(tab: any): void {
    this.activeTab = tab;
    this.statusSelected.emit(this.tabs.find(t => t.key === tab)?.value || 'APPLIED');
    this.applyFilter(this.candidates());

    if (this.filteredCandidates.length) {
      this.selectCandidate(this.filteredCandidates[0]);
    } else {
      this.selectedCandidate = null;
      this.candidateSelected.emit(undefined as any);
    }
  }

  selectCandidate(candidate: Candidate): void {
    this.selectedCandidate = candidate;
    this.candidateSelected.emit(candidate);
  }

  getFilteredCandidates(list: Candidate[], tab: TabKey): Candidate[] {
    const statuses = this.tabFilterMap[tab];
    if (!statuses.length) return list;
    return list.filter(c => statuses.includes(c.status));
  }

  applyFilter(sourceList: Candidate[]): void {
    let result = this.getFilteredCandidates(sourceList, this.activeTab);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }

    if (this.dateRange?.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      const from = new Date(this.dateRange[0]);
      from.setHours(0, 0, 0, 0);
      const to = new Date(this.dateRange[1]);
      to.setHours(23, 59, 59, 999);

      result = result.filter((c: any) => {
        if (!c.createdDateRaw) return false;
        const d = new Date(c.createdDateRaw);
        return d >= from && d <= to;
      });
    }

    this.filteredCandidates = result;
  }

  trackById(_: number, candidate: Candidate): number {
    return candidate.id;
  }

  onAddApplicant(): void {
    console.log('Add applicant triggered');
  }
}