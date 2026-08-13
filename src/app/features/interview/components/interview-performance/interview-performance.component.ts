import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EvaluationSummaryComponent } from '../evaluation-summary/evaluation-summary.component';
import { AiInterviewComponent } from '../ai-interview/ai-interview.component';
import { RoundDetailComponent } from '../round-detail/round-detail.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { JobService } from '../../../job/services/job.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
  private notificationService=inject(NotificationService)
  loading = false;
  error: string | null = null;
  averageAiScore:any=0;
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


  /** current_stage_id to send per round when calling the interview-feedback API — populated from
   *  the applicant-details response (see extractStageIds), keyed by round. Falls back to these
   *  defaults only if the applicant-details response doesn't include stage ids for a round. */
  private stageIdByRound: Record<FeedbackRoundKey, number> = {
    technical: 2,
    managerial: 3,
    hr: 4,
  };

  /** How many interview stages/rounds the applicant has completed so far, and the total round count.
   *  Both come from the applicant-details API response. */
  completedStages = 0;
  noOfRounds = 0;

  /** True while an accept/hold/reject decision call is in flight. */
  updatingStatus = false;

  /** Order of each round tab, used to decide which tabs are unlocked based on completedStages.
   *  The 'evaluation' summary tab has no entry here, so it's always shown. */
  private readonly stageOrderByTab: Record<string, number> = {
    'ai-interview': 1,
    technical: 2,
    managerial: 3,
    hr: 4,
  };

  /** Tabs to actually render — a tab for a round is only shown once that round's stage is completed. */
  get visibleTabs(): { key: string; label: string; icon: string }[] {
    return this.tabs.filter((tab) => {
      const order = this.stageOrderByTab[tab.key];
      return order == null || order <= this.completedStages;
    });
  }

  /** Accept/Hold/Reject decision buttons are only relevant while reviewing an interview round. */
  get showDecisionActions(): boolean {
    return ['evaluation','ai-interview', 'technical', 'managerial'].includes(this.activeTab) && this.candidate?.noOfStages===this.candidate?.completedStages;
  }

  /** "Calculate Evaluation Summary" only makes sense once every round has been completed. */
  get canCalculateEvaluation(): boolean {
    return this.noOfRounds > 0 && this.completedStages === this.noOfRounds;
  }

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

        // Drives which round tabs are unlocked, and whether the evaluation summary
        // can be calculated yet (only once every round is completed).
        this.completedStages = d.completedStages ?? 0;
        this.noOfRounds = d.noOfStages ?? 0;

        // The stage/round ids used to call the interview-feedback API come from
        // applicant-details itself rather than being hardcoded.
        this.stageIdByRound = this.extractStageIds(d);

        this.candidate = {

          avatarInitials: this.getInitials(fullName),

          name: fullName,

          tag: d.currentStage,

          email: d.email,

          phone: d.phNo,

          location: d?.location,

          jobTitle: d.jobTitle,

          jobId: d.jobCode,

          interviewType: d?.currentStage,
          noOfStages:d?.noOfStages,
          completedStages:d?.completedStages,
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

  /**
   * Pulls the technical/managerial/hr stage ids out of the applicant-details response so
   * the interview-feedback API can be called with the correct current_stage_id per round,
   * instead of a hardcoded value.
   *
   * Supports either shape the applicant-details API may return:
   *  - an array, e.g. `stages: [{ stageType: 'Technical', stageId: 12 }, ...]`
   *  - a flat object, e.g. `stageIds: { technical: 12, managerial: 13, hr: 14 }`
   *
   * Falls back to the existing stageIdByRound value for any round not present in the response.
   */
  private extractStageIds(d: any): Record<FeedbackRoundKey, number> {
    const result: Record<FeedbackRoundKey, number> = { ...this.stageIdByRound };

    const stagesList: any[] = Array.isArray(d?.stages)
      ? d.stages
      : Array.isArray(d?.interviewStages)
        ? d.interviewStages
        : [];

    for (const stage of stagesList) {
      const type = (stage?.stageType ?? stage?.type ?? stage?.roundType ?? '').toString();
      const id = stage?.stageId ?? stage?.id ?? stage?.stage_id;
      const key = this.roundKeyForStageType(type);
      if (key && id != null) {
        result[key] = id;
      }
    }

    if (d?.stageIds && typeof d.stageIds === 'object') {
      Object.keys(d.stageIds).forEach((rawKey) => {
        const key = this.roundKeyForStageType(rawKey);
        if (key && d.stageIds[rawKey] != null) {
          result[key] = d.stageIds[rawKey];
        }
      });
    }

    return result;
  }

  private roundKeyForStageType(type: string): FeedbackRoundKey | null {
    const normalized = type.replace(/[\s_-]/g, '').toLowerCase();
    if (normalized.includes('technical')) return 'technical';
    if (normalized.includes('managerial') || normalized.includes('manager')) return 'managerial';
    if (normalized.includes('hr')) return 'hr';
    return null;
  }

  async loadApplicantDetailsAIInterview(applicationId: any): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const obj = { application_id: applicationId };
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
    this.averageAiScore=raw?.average_ai_score;
    const qnaList: any[] = Array.isArray(raw.qna_analysis) ? raw.qna_analysis : [];
    const logs: any[] = Array.isArray(raw.proctoring_logs) ? raw.proctoring_logs : [];

    const easyCount = raw.easy_questions_count ?? 0;
    const mediumCount = raw.medium_questions_count ?? 0;

    // Anchor "time taken" calculations against the interview start time.
    let previousTs = this.parseDate(raw.interview_timeline?.started_dt);

    const questions:any[] = qnaList.map((q, index) => {
      const scoreOutOf10 = this.scaled10(q.overall);
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
        // AI's confidence in its own scoring for this answer — API returns
        // final_confidence_score (0-100) and a confidence_level label
        // (e.g. "Low Confidence"). Previously not mapped at all.
        confidenceScore: q.final_confidence_score ?? null,
        confidenceLevel: q.confidence_level ?? null,
        // Per-criterion breakdown behind the overall score — also 0-100 scale,
        // also previously dropped by the mapping.
        breakdown: {
          domainKnowledge: q.domain_knowledge ?? null,
          communicationClarity: q.communication_clarity ?? null,
          problemSolving: q.problem_solving ?? null,
          jobRelevance: q.job_relevance ?? null,
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
        violation: this.toTitleCase(this.joinTextValues(l.violation_type ?? l.event_type) || 'Violation'),
        severity: this.severityFor(l),
        description: this.joinTextValues(l.description ?? l.details ?? ''),
        snapshots: [l.image_base64].filter((s): s is string => !!s),
      })),
    };

    return {
      totalQuestions: raw.total_questions ?? qnaList.length,
      attempted: raw.qna_count ?? qnaList.length,
      averageAiScore: this.scaled10(raw.average_ai_score ?? raw.total_score),
      recommendation: raw.recommendation,
      questions,
      proctoring,
    };
  }

  private round1(value: number): number {
    return Math.round(value * 10) / 10;
  }
  private ratingForScore(scoreOutOf10: number | null): 'Excellent' | 'Good' | 'Average' | 'Poor' | null {
    if (scoreOutOf10 == null) return null;
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

  /**
   * Scores like `overall` / `average_ai_score` arrive on a 0-100 scale; the
   * UI shows them out of 10. Returns null (not 0) when the field is genuinely
   * absent from the API response, so the template can render "N/A" instead
   * of a fake zero score.
   */
  private toScale10(value: number | undefined | null): number | null {
    return value == null ? null : value / 10;
  }

  /** toScale10 + rounding to 1 decimal, still null-preserving. */
  private scaled10(value: number | undefined | null): number | null {
    const v = this.toScale10(value);
    return v == null ? null : this.round1(v);
  }

  /**
   * Metrics like `relevance` / `accuracy` arrive on a 0-10 scale; the star
   * display expects 0-5. Returns null (not 0) when missing, distinct from an
   * explicit 0 the API actually sent.
   */
  private toScale5(value: number | undefined | null): number | null {
    if (value == null) return null;
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

  /**
   * Proctoring log fields like violation_type sometimes arrive as a real array
   * (e.g. ["Looking Away (Right)", "Head Up"]) or as a JSON-stringified array
   * (e.g. '["Looking Away (Right)", "Head Up"]') instead of a plain string.
   * Feeding that straight into toTitleCase() left the brackets/quotes showing
   * up in the UI verbatim (e.g. `["Looking Away (Right)", "Head Up"]`). This
   * joins every entry into one readable, comma-separated string.
   */
  private joinTextValues(value: any): string {
    if (value == null) return '';
    if (Array.isArray(value)) {
      return value.filter((v) => v != null).map((v) => String(v)).join(', ');
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter((v) => v != null).map((v) => String(v)).join(', ');
          }
        } catch {
          // Not valid JSON — fall through and use the raw string.
        }
      }
      return value;
    }
    return String(value);
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

  /** Handles the bottom-right Accept / Hold / Reject decision buttons. */
  async updateApplicantStatus(status: 'Hired' | 'hold' | 'rejected'): Promise<void> {
    if (this.updatingStatus || !this.applicationId) {
      return;
    }

    this.updatingStatus = true;
    this.error = null;
    const payload = {
      applicantId: this.applicationId,
      status,
    };

    try {
      const res: any = await this.interviewService.updateInterviewCompletionStatus(payload);

     if(res?.responsecode !== '00') {
        this.notificationService.error(res?.message || res?.responsemessage|| 'Failed to update applicant status. Please try again.');
      }
      else{
        this.notificationService.success(res?.errors?.[0] || res?.message|| res?.resposemessage || res?.data)
      }
     
    } catch (err: any) {
      this.error = err?.message || 'Failed to update applicant status. Please try again.';
    } finally {
      this.updatingStatus = false;
    }
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
      this.averageAiScore=res?.data?.average_ai_score || res?.data?.ai_score || 0;
      if (this.candidate) {
        // Candidate card's "AI Score" bar renders this as a 0-100 percentage
        // (see [style.width.%]="candidate.aiScore" in the template), and
        // average_ai_score is the field that's on that 0-100 scale — it's the
        // same field mapEvaluationSummary uses for `averageAiScore`.
        // average_score_across_rounds is often missing/undefined for a
        // candidate, which is why the bar never moved.
        this.candidate.aiScore = res.data.average_ai_score ?? 0;
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
    // this.averageAiScore=data?.data.average_ai_score || data?.ai_score;
    return {

      averageAiScore: data.average_ai_score || data?.ai_score,

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
        data.consolidated_evaluation?.ai_recommendation?.score ?? data?.ai_score ??0

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