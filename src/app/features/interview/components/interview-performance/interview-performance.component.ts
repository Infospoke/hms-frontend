import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EvaluationSummaryComponent } from '../evaluation-summary/evaluation-summary.component';
import { AiInterviewComponent } from '../ai-interview/ai-interview.component';
import { RoundDetailComponent } from '../round-detail/round-detail.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { JobService } from '../../../job/services/job.service';

// Dummy data for development/testing
const DUMMY_DATA = {
  candidate: {
    avatarInitials: 'AK',
    name: 'Arjun Kumar',
    tag: 'Strong Hire',
    email: 'arjun.kumar@example.com',
    phone: '+91 98765 43210',
    location: 'Hyderabad, India',
    jobTitle: 'Senior Frontend Developer',
    jobId: 'JOB-2024-0042',
    interviewType: 'AI Technical Interview',

    interviewDate: '14 Jun 2025',
    experience: '4 - 7 Yrs',
    department: 'Engineering',
    interviewDuration: '60 Minutes',

    aiScore: 82,
  },

  evaluationData: {
    averageAiScore: 82,
    totalRoundsCompleted: 4,
    totalRounds: 4,
    totalQuestionsAttempted: 15,
    averageScoreAcrossRounds: 82,
    status: 'Cleared',
    minimumPassScore: 60,
    overallScore: 82,
    rounds: [
      {
        round: 1,
        roundType: 'AI Interview',
        interviewerName: 'AI System',
        interviewerTitle: 'Automated Evaluation',
        score: 82,
        recommendation: 'Pass',
        expanded: false,
        evalSummary: {
          skills: [
            { label: 'Technical Knowledge', score: '4.1' },
            { label: 'Problem Solving', score: '4.0' },
            { label: 'Communication', score: '4.2' },
          ],
          totalScore: '82/100',
        },
        interviewerFeedback: 'Strong overall performance. Demonstrated solid Angular knowledge and clear problem-solving ability.',
      },
      {
        round: 2,
        roundType: 'Technical Round',
        interviewerName: 'Ravi Shankar',
        interviewerTitle: 'Principal Engineer',
        score: 85,
        recommendation: 'Pass',
        expanded: false,
        evalSummary: {
          skills: [
            { label: 'Technical Knowledge', score: '4.5' },
            { label: 'Problem Solving', score: '4.0' },
            { label: 'Analytical Thinking', score: '4.0' },
            { label: 'Communication', score: '4.0' },
            { label: 'Cultural Fit', score: '5.0' },
          ],
          totalScore: '85/100',
        },
        interviewerFeedback: 'Excellent Angular knowledge, clean code practices, and ability to explain complex concepts clearly.',
      },
      {
        round: 3,
        roundType: 'Managerial Round',
        interviewerName: 'Priya Reddy',
        interviewerTitle: 'Engineering Manager',
        score: 78,
        recommendation: 'Pass',
        expanded: false,
        evalSummary: {
          skills: [
            { label: 'Leadership & Ownership', score: '4.0' },
            { label: 'Strategic Thinking', score: '3.5' },
            { label: 'Problem Solving & Decision', score: '4.0' },
            { label: 'Communication', score: '4.0' },
            { label: 'People Management', score: '3.5' },
          ],
          totalScore: '78/100',
        },
        interviewerFeedback: 'Good ownership mindset, team-oriented, and proactive in communication.',
      },
      {
        round: 4,
        roundType: 'HR Round',
        interviewerName: 'Neha Gupta',
        interviewerTitle: 'HR Business Partner',
        score: 84,
        recommendation: 'Strong Hire',
        expanded: false,
        evalSummary: null,
        interviewerFeedback: 'Very professional, great attitude, and strong alignment with company values.',
      },
    ],
    keyStrengths: [
      'Strong Angular fundamentals and modern framework patterns',
      'Excellent problem-solving with structured thinking',
      'Clear and confident communication skills',
      'High cultural fit and ownership mindset',
    ],
    areasOfImprovement: [
      'Could deepen backend and system design knowledge',
      'Improve estimation skills for complex projects',
      'More exposure to large-scale distributed systems',
    ],
    aiRecommendation: 'Arjun demonstrated strong technical skills, cultural alignment, and excellent communication. Recommended for the role with high confidence.',
    aiRecommendationScore: 82,
  },

  aiInterviewData: {
    totalQuestions: 5,
    attempted: 5,
    averageAiScore: 8.2,
    questions: [
      {
        id: 1,
        question: 'Explain the difference between Angular services and components.',
        type: 'Technical',
        difficulty: 'Easy',
        time: '2m 15s',
        aiScore: 9,
        maxScore: 10,
        rating: 'Excellent',
        expanded: false,
        idealAnswer: 'Angular services are singleton classes managed by the DI container. They handle business logic, HTTP calls, and data sharing across components. Components are tree-node UI elements with a template, lifecycle hooks, and a change-detection cycle. The key distinction is that services have no view, while components own a template and are tied to the DOM.',
        candidateAnswer: 'Services are singleton classes used for business logic and data sharing across components. Components handle the view layer with templates and lifecycle hooks.',
        aiEvaluation: 'The candidate clearly distinguished services from components. Mentioned singleton pattern and lifecycle hooks. A well-structured answer.',
        evalDetail: { relevance: 5, completeness: 4, accuracy: 5, clarity: 5 },
      },
      {
        id: 2,
        question: 'How do you optimize performance in a large Angular application?',
        type: 'Technical',
        difficulty: 'Medium',
        time: '3m 40s',
        aiScore: 8,
        maxScore: 10,
        rating: 'Good',
        expanded: false,
        idealAnswer: 'Key strategies: (1) Lazy-load feature modules so initial bundle is minimal. (2) Use OnPush change detection to limit rerender scope. (3) Use trackBy in *ngFor to avoid full list re-renders. (4) Virtual scrolling with CdkVirtualScrollViewport for large lists. (5) Unsubscribe from Observables using async pipe or takeUntilDestroyed. (6) Pre-load critical routes with a PreloadingStrategy.',
        candidateAnswer: 'Use lazy loading, OnPush change detection strategy, trackBy in ngFor, and avoid unnecessary subscriptions.',
        aiEvaluation: 'Good coverage of key strategies. Mentioned lazy loading and OnPush which are high-impact. Could have elaborated on virtual scrolling and RxJS cleanup patterns.',
        evalDetail: { relevance: 5, completeness: 3, accuracy: 5, clarity: 4 },
      },
      {
        id: 3,
        question: 'Describe a challenging project and how you handled it.',
        type: 'Behavioural',
        difficulty: 'Medium',
        time: '4m 05s',
        aiScore: 8,
        maxScore: 10,
        rating: 'Good',
        expanded: false,
        idealAnswer: 'A strong STAR-method answer should clearly define the Situation (context and stakes), Task (your role and responsibility), Action (specific steps you took), and Result (measurable outcomes). The best answers include cross-team collaboration, technical decision-making under constraints, and quantifiable impact.',
        candidateAnswer: 'Led a migration from AngularJS to Angular 14 for a large e-commerce platform with 50+ components, coordinating with 3 teams over 6 months.',
        aiEvaluation: 'Structured response with a clear situation, task, and result. Good emphasis on cross-team coordination. Measurable outcome (50+ components, 6 months) is a positive indicator.',
        evalDetail: { relevance: 5, completeness: 4, accuracy: 4, clarity: 4 },
      },
      {
        id: 4,
        question: 'What is the purpose of RxJS in Angular and give an example use case?',
        type: 'Technical',
        difficulty: 'Medium',
        time: '3m 10s',
        aiScore: 8,
        maxScore: 10,
        rating: 'Good',
        expanded: false,
        idealAnswer: 'RxJS enables reactive, event-driven programming via Observables. In Angular it powers HttpClient, Router events, and reactive forms. A concrete example: use switchMap to cancel a pending HTTP search request when the user types a new character, preventing race conditions. Use takeUntilDestroyed to auto-unsubscribe when a component is destroyed.',
        candidateAnswer: 'RxJS provides reactive programming in Angular through Observables. I use it for HTTP requests, combining streams with operators like switchMap, and managing component state.',
        aiEvaluation: 'Solid answer demonstrating practical knowledge. Mentioned switchMap which shows depth. Could have mentioned takeUntil/async pipe for subscription cleanup.',
        evalDetail: { relevance: 5, completeness: 3, accuracy: 5, clarity: 4 },
      },
      {
        id: 5,
        question: 'How do you approach code reviews in a team setting?',
        type: 'Behavioural',
        difficulty: 'Easy',
        time: '2m 50s',
        aiScore: 8,
        maxScore: 10,
        rating: 'Good',
        expanded: false,
        idealAnswer: 'Effective code reviews focus on understanding intent before critiquing style. Review for correctness, edge cases, security, testability, and readability. Use a "suggest, not mandate" approach. Comment with context ("This pattern could cause N+1 here"), not just labels. Separate review from approval — and use automated lint/format checks so humans focus on logic.',
        candidateAnswer: 'I focus on understanding intent before critiquing. I comment on logic, readability, and edge cases, and prefer suggesting alternatives rather than mandating changes.',
        aiEvaluation: 'Reflects a mature and collaborative approach. Emphasis on constructive feedback and understanding intent are positive leadership signals.',
        evalDetail: { relevance: 5, completeness: 4, accuracy: 5, clarity: 5 },
      },
    ],
    proctoring: {
      totalViolations: 3,
      highSeverity: 0,
      mediumSeverity: 2,
      lowSeverity: 1,
      overallRisk: 'Low',
      violations: [
        {
          time: '00:04:12',
          violation: 'Tab Switch',
          severity: 'Medium',
          description: 'Candidate switched browser tab briefly. Returned within 5 seconds.',
          snapshots: [],
        },
        {
          time: '00:18:47',
          violation: 'Tab Switch',
          severity: 'Medium',
          description: 'Second tab switch detected. Duration: 3 seconds.',
          snapshots: [],
        },
        {
          time: '00:31:05',
          violation: 'Audio Flag',
          severity: 'Low',
          description: 'Background noise detected briefly. Did not affect response quality.',
          snapshots: [],
        },
      ],
    },
  },
};

/** Round keys that are backed by the interview-feedback API. */
type FeedbackRoundKey = 'technical' | 'managerial' | 'hr';

@Component({
  selector: 'app-interview-performance',
  standalone: true,
  imports: [
    CommonModule,
    EvaluationSummaryComponent,
    AiInterviewComponent,
    RoundDetailComponent,
    HeadingComponent
  ],
  templateUrl: './interview-performance.component.html',
  styleUrl: "./interview-performance.component.scss"
})
export class InterviewPerformanceComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService);

  loading = false;
  error: string | null = null;

  /** True when the evaluation-summary API reports no evaluation exists yet for this candidate. */
  evaluationNotFound = false;
  /** True while the "calculate evaluation summary" API call is in flight. */
  calculatingEvaluation = false;

  candidate: any = null;
  evaluationData: any = null;
  aiInterviewData: any = null;
  technicalData: any = null;
  managerialData: any = null;
  hrData: any = null;

  activeTab = 'evaluation';
  private activeRouter = inject(ActivatedRoute);
  readonly tabs: { key: string; label: string; icon: string }[] = [
    { key: 'evaluation', label: 'Evaluation Summary', icon: 'chart' },
    { key: 'ai-interview', label: 'AI Interview', icon: 'ai' },
    { key: 'technical', label: 'Technical Round', icon: 'code' },
    { key: 'managerial', label: 'Managerial Round', icon: 'briefcase' },
    { key: 'hr', label: 'HR Round', icon: 'people' },
  ];
  jobId: any;
  applicationId: any | null = null;
  private jobService = inject(JobService);


  private readonly stageIdByRound: Record<FeedbackRoundKey, number> = {
    technical: 2,
    managerial: 3,
    hr: 4,
  };

  ngOnInit(): void {
    this.applicationId = this.activeRouter.snapshot.paramMap.get('applicationId');
    if (this.applicationId) {
      this.loadApplicantDetails();
      this.helperToLoadData(this.activeTab);
    }
  }

  private async loadApplicantDetails(): Promise<void> {
    try {

      const res = await this.interviewService.getApplicantDetailsById(this.applicationId);

      if (res?.responsecode === '00') {

        const d = res.data;

        const fullName = `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim();

        this.jobId = d.jobId;

        this.candidate = {

          avatarInitials: this.getInitials(fullName),

          name: fullName,

          tag: d.currentStage,

          email: d.email,

          phone: d.phNo,

          location: '--',

          jobTitle: d.jobTitle,

          jobId: d.jobCode,

          interviewType: d?.currentStage,

          interviewDate: this.formatDate(d.interviewDate),

          experience: d?.minExperience + '-' + d?.maxExperience,

          department: d?.department,

          interviewDuration: '--',

          aiScore: 0
        };

      }

    } catch (e) {
      console.log(e);
    }
  }
  async loadApplicantDetailsAIInterview(applicationId: any): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const obj = { applicationId };
      const res: any = await this.jobService.fetchInterViewAnalysis(obj);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || 'No interview analysis available for this application.');
      }
      this.aiInterviewData = this.mapToViewModel(res.data);
    } catch (err: any) {
      this.error = err?.message || 'Failed to load interview analysis. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private mapToViewModel(raw: any) {
    const qnaList: any[] = Array.isArray(raw.qna_analysis) ? raw.qna_analysis : [];
    const logs: any[] = Array.isArray(raw.proctoring_logs) ? raw.proctoring_logs : [];

    const easyCount = raw.easy_questions_count ?? 0;
    const mediumCount = raw.medium_questions_count ?? 0;

    // Anchor "time taken" calculations against the interview start time.
    let previousTs = this.parseDate(raw.interview_timeline?.started_dt);

    const questions:any[] = qnaList.map((q, index) => {
      const scoreOutOf10 = this.round1(this.toScale10(q.overall));
      const currentTs = this.parseDate(q.created_at);
      const timeTaken = this.formatDuration(previousTs, currentTs);
      previousTs = currentTs ?? previousTs;

      return {
        id: index + 1,
        difficulty: this.difficultyForIndex(index, easyCount, mediumCount),
        question: q.question_text ?? '',
        aiScore: scoreOutOf10,
        maxScore: 10,
        rating: this.ratingForScore(scoreOutOf10),
        expanded: false,
        type: q.relevant_answer === false ? 'Off-topic' : 'Technical',
        time: timeTaken,
        idealAnswer: q.ai_suggested_answer ?? '',
        candidateAnswer: q.answer_text ?? '',
        aiEvaluation: q.feedback ?? '',
        evalDetail: {
          relevance: this.toScale5(q.relevance),
          completeness: this.toScale5(q.completeness),
          accuracy: this.toScale5(q.accuracy),
          clarity: this.toScale5(q.clarity),
        },
      };
    });

    const highSeverity = logs.filter((l) => this.severityFor(l) === 'High').length;
    const mediumSeverity = logs.filter((l) => this.severityFor(l) === 'Medium').length;
    const lowSeverity = logs.filter((l) => this.severityFor(l) === 'Low').length;

    const proctoring = {
      totalViolations: raw.proctoring_violations ?? logs.length,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      overallRisk: highSeverity > 0 ? 'High' : mediumSeverity > 0 ? 'Medium' : 'Low',
      violations: logs.map((l) => ({
        time: this.formatTime(this.parseDate(l.timestamp ?? l.time)),
        violation: this.toTitleCase(l.violation_type ?? l.event_type ?? 'Violation'),
        severity: this.severityFor(l),
        description: l.description ?? l.details ?? '',
        snapshots: [l.image_base64].filter((s): s is string => !!s),
      })),
    };

    return {
      totalQuestions: raw.total_questions ?? qnaList.length,
      attempted: raw.qna_count ?? qnaList.length,
      averageAiScore: this.round1(this.toScale10(raw.average_ai_score ?? raw.total_score)),
      recommendation: raw.recommendation,
      questions,
      proctoring,
    };
  }

  private round1(value: number): number {
    return Math.round(value * 10) / 10;
  }
  private ratingForScore(scoreOutOf10: number): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    if (scoreOutOf10 >= 9) return 'Excellent';
    if (scoreOutOf10 >= 7) return 'Good';
    if (scoreOutOf10 >= 5) return 'Average';
    return 'Poor';
  }
  private difficultyForIndex(index: number, easyCount: number, mediumCount: number): 'Easy' | 'Medium' | 'Hard' {
    if (index < easyCount) return 'Easy';
    if (index < easyCount + mediumCount) return 'Medium';
    return 'Hard';
  }
  private severityFor(log: any): 'High' | 'Medium' | 'Low' {
    const raw: string = (log.severity ?? log.tb_severity ?? '').toString().toLowerCase();
    if (raw.includes('high')) return 'High';
    if (raw.includes('medium')) return 'Medium';
    return 'Low';
  }

  /** Scores like `overall` / `average_ai_score` arrive on a 0-100 scale; the UI shows them out of 10. */
  private toScale10(value: number | undefined | null): number {
    return value == null ? 0 : value / 10;
  }

  /** Metrics like `relevance` / `accuracy` arrive on a 0-10 scale; the star display expects 0-5. */
  private toScale5(value: number | undefined | null): number {
    if (value == null) return 0;
    return Math.max(0, Math.min(5, Math.round(value / 2)));
  }


  private parseDate(value: string | undefined | null): Date | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private formatDuration(from: Date | undefined, to: Date | undefined): string {
    if (!from || !to) return '—';
    const diffMs = to.getTime() - from.getTime();
    if (diffMs < 0) return '—';
    const totalSeconds = Math.round(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
  private formatTime(date: Date | undefined): string {
    if (!date) return '—';
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  /** e.g. "14 Jun 2025, 10:00 AM" — used for the round overview's interviewDateTime. */
  private formatDateTime(value: string | undefined | null): string {
    const date = this.parseDate(value ?? undefined);
    if (!date) return '--';
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  private findRound(rounds: any[], type: string): any {
    if (!Array.isArray(rounds)) return null;
    return rounds.find((r: any) =>
      (r.type ?? r.roundType ?? '').toLowerCase() === type
    ) ?? null;
  }

  private getInitials(name: string): string {
    return name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  private formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  }

  setTab(key: string): void {
    this.activeTab = key;
    this.helperToLoadData(key);
  }
  private async loadEvalutionData() {
    this.loading = true;
    this.error = null;
    this.evaluationNotFound = false;

    try {
      const res: any = await this.interviewService.getEvaluationSummaryForCandidate(this.applicationId);

      if (!res?.success || !res?.data) {
        throw new Error(res?.message || 'No evaluation found for this candidate.');
      }

      this.evaluationData = this.mapEvaluationSummary(res.data);

      if (this.candidate) {
        this.candidate.aiScore = res.data.average_score_across_rounds;
      }
    } catch (err: any) {
      const message: string = err?.message || '';

      // "No evaluation found" (or similar not-yet-calculated responses) gets its own
      // empty state with a button to trigger calculation, instead of a hard error.
      if (/no evaluation/i.test(message) || /not found/i.test(message)) {
        this.evaluationNotFound = true;
        this.evaluationData = null;
      } else {
        this.error = message || 'Failed to load evaluation summary. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

 
  async calculateEvaluationSummary(): Promise<void> {
    if (this.calculatingEvaluation) {
      return;
    }

    this.calculatingEvaluation = true;
    this.error = null;
    const payload={
      application_id:this.applicationId
    }
    try {
      const res: any = await this.interviewService.calculateEvaluationSummaryForCandidate(payload);

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to calculate evaluation summary.');
      }

      // Calculation succeeded — pull the freshly calculated details from the
      // evaluation-summary API so the view is populated the same way it would be
      // on a normal load.
      await this.loadEvalutionData();
    } catch (err: any) {
      this.error = err?.message || 'Failed to calculate evaluation summary. Please try again.';
    } finally {
      this.calculatingEvaluation = false;
    }
  }
  private mapEvaluationSummary(data: any): any {

    return {

      averageAiScore: data.average_ai_score,

      totalRoundsCompleted: data.total_rounds_completed,

      totalRounds: data.total_rounds,

      averageScoreAcrossRounds: data.average_score_across_rounds,

      status: this.formatRecommendation(data.status),

      minimumPassScore: 60,

      overallScore: data.average_score_across_rounds,

      rounds: (data.rounds_performance || []).map((round: any) => ({

        round: round.round_number,

        roundType: round.round_type,

        interviewerName: round.interviewer_name,

        interviewerTitle: '',

        score: round.score_percentage,

        recommendation: this.formatRecommendation(round.recommendation),

        expanded: false,

        evalSummary: round.feedback_details
          ? {
            skills: [
              {
                label: 'Technical Skills',
                score: round.feedback_details.technical_skills?.toString() ?? '0'
              },
              {
                label: 'Problem Solving',
                score: round.feedback_details.problem_solving_skills?.toString() ?? '0'
              },
              {
                label: 'Coding Efficiency',
                score: round.feedback_details.coding_efficiency?.toString() ?? '0'
              },
              {
                label: 'System Design',
                score: round.feedback_details.system_design?.toString() ?? '0'
              },
              {
                label: 'Communication',
                score: round.feedback_details.communication?.toString() ?? '0'
              }
            ],

            totalScore:
              `${round.score_percentage}/100`
          }
          : null,

        interviewerFeedback:
          round.feedback_details?.interview_feedback ?? ''

      })),

      keyStrengths:
        data.consolidated_evaluation?.key_strengths ?? [],

      areasOfImprovement:
        data.consolidated_evaluation?.areas_of_improvement ?? [],

      aiRecommendation:
        data.consolidated_evaluation?.ai_recommendation?.text ?? '',

      aiRecommendationStatus:
        this.formatRecommendation(data.consolidated_evaluation?.ai_recommendation?.status),

      aiRecommendationScore:
        data.consolidated_evaluation?.ai_recommendation?.score ?? 0

    };

  }


  private formatRecommendation(value: string): string {

  switch (value?.toUpperCase()) {

    case 'HIRE':
      return 'Hire';

    case 'STRONG_HIRE':
      return 'Strong Hire';

    case 'REJECT':
      return 'Reject';

    case 'HOLD':
      return 'Hold';

    case 'PASS':
      return 'Pass';

    case 'FAIL':
      return 'Fail';

    case 'CONSIDER':
      return 'Consider';

    default:
      return value ?? '';
  }

}
  private helperToLoadData(key: any) {
    switch (key) {
      case 'evaluation':
        this.loadEvalutionData();
        break;
      case 'ai-interview':
        this.loadApplicantDetailsAIInterview(this.applicationId);
        break;
      case 'technical':
        this.loadFeedBackDetails('technical');
        break;
      case 'managerial':
        this.loadFeedBackDetails('managerial');
        break;
      case 'hr':
        this.loadFeedBackDetails('hr');
        break;
    }
  }
  tagClass(tag: string): string {
    const map: Record<string, string> = {
      'Strong Hire': 'strong-hire',
      'Hire': 'hire',
      'Hold': 'hold',
      'Reject': 'reject',
    };
    return map[tag] ?? 'hire';
  }

 
  private async loadFeedBackDetails(key: FeedbackRoundKey): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        application_id: this.applicationId,
        current_stage_id: this.stageIdByRound[key],
      };

      const res: any = await this.interviewService.getAIFeedBackDetails(payload);

      if (!res?.success || !res?.data) {
        throw new Error(res?.message || 'No feedback available for this round.');
      }

      const mapped = this.mapFeedbackToViewModel(res.data);

      if (key === 'technical') {
        this.technicalData = mapped;
      } else if (key === 'managerial') {
        this.managerialData = mapped;
      } else {
        this.hrData = mapped;
      }
    } catch (err: any) {
      this.error = err?.message || 'Failed to load feedback details. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  /** Maps a raw /interview-feedback response into the shape RoundDetailComponent expects. */
  private mapFeedbackToViewModel(feedback: any): any {
    return {
      overview: {
        // interview_date comes straight from the feedback API and is used
        // for the round's scheduled date/time.
        interviewDateTime: this.formatDateTime(feedback.interview_date),
        duration: '--',
        score: (feedback.overall_rating ?? 0) * 20,
        recommendation: this.formatRecommendation(feedback.decision),
        interviewer: {
          name: feedback.submitted_by ?? '--',
          title: feedback.interview_type ?? '--',
          avatarInitials: feedback.submitted_by ? this.getInitials(feedback.submitted_by) : '--',
          employeeId: feedback.user_id != null ? `EMP-${feedback.user_id}` : '--',
          department: '--',
          email: '--',
          phone: '--',
          totalExperience: '--',
          interviewConducted: '--',
          // interview_mode comes straight from the feedback API (e.g. "Google Meet").
          mode: feedback.interview_mode ?? '--',
        },
      },
      feedback: {
        overallRating: feedback.overall_rating ?? 0,
        competencies: [
          { key: 'technical', label: 'Technical Knowledge', description: 'Core technical concepts and depth', rating: feedback.technical_knowledge ?? 0 },
          { key: 'problem', label: 'Problem Solving', description: 'Analytical and debugging approach', rating: feedback.problem_solving ?? 0 },
          { key: 'communication', label: 'Communication', description: 'Clarity and articulation', rating: feedback.communication ?? 0 },
          { key: 'analytical', label: 'Analytical Thinking', description: 'Critical and logical thinking', rating: feedback.analytical_thinking ?? 0 },
          { key: 'cultural', label: 'Cultural Fit', description: 'Alignment with team values', rating: feedback.cultural_fit ?? 0 },
        ],
        strengths: feedback.strengths ?? '',
        areasOfImprovement: feedback.areas_of_improvements ?? '',
        additionalComments: feedback.additional_comments ?? '',
        decision: this.mapDecision(feedback.decision),
      },
    };
  }

  /** Maps the feedback API's `decision` string to the value RoundDetailComponent's UI expects. */
  private mapDecision(value: string): string {
    switch ((value ?? '').toLowerCase()) {
      case 'selected':
        return 'next';
      case 'rejected':
        return 'reject';
      case 'on hold':
      case 'hold':
        return 'hold';
      default:
        return (value ?? '').toLowerCase();
    }
  }
}