import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-interview-question-generate',
  imports: [CommonModule, FormsModule, HeadingComponent],
  templateUrl: './interview-question-generate.component.html',
  styleUrl: './interview-question-generate.component.scss',
})
export class InterviewQuestionGenerateComponent implements OnInit, AfterViewInit {

  // ── Root element ref, used to lock height to the exact remaining viewport
  //    space so the outer page never scrolls — only the inner panels do ──────────
  @ViewChild('iqRoot') iqRootRef!: ElementRef<HTMLElement>;

  // ── Route context ────────────────────────────────────────────────────────────
  applicationId: number = 0;
  interviewSessionId: string = '';

  // ── Candidate (populated from applicant-details API) ─────────────────────────
  candidate = {
    initials: '',
    name: '',
    status: '',
    role: '',
    planName: '',
    noOfRounds: 0,
    email: '',
    phone: '',
    appliedOn: '',
    experience: '',
    candidateId:' ',
  };
  private jobId:any;
  // ── Generation settings ──────────────────────────────────────────────────────
  questionTypes = { technical: true, behavioral: true, situational: true };
  difficultyLevel = 'Medium';
  totalQuestions = 10;
  estimatedDuration = '20 - 25 mins';
  minPassPercentage = 70;
  acceptableScoreMin = 50;
  acceptableScoreMax = 100;
  isQuestionsFinalized:boolean=true;
  disabledQuestions:boolean=false;
  // ── UI state ─────────────────────────────────────────────────────────────────
  isLoading = false;
  isGenerating = false;
  isFinalizing = false;
  isScheduling = false;
  showAddForm = false;

  // ── Add-question form model ──────────────────────────────────────────────────
  newQuestion: any = {
    type: 'technical',
    question: '',
    expectedTime: '2-3 mins',
    difficulty: 'Medium',
  };

  // ── Questions list ───────────────────────────────────────────────────────────
  questions: any[] = [];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private interviewService: InterviewServiceService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.applicationId = +(params['applicationId'] ?? 0);
      if (this.applicationId) {
        this.isLoading = true;
        await Promise.all([
          this.loadApplicantDetails(),
          this.loadQuestionsForAlreadyFinalised(),
        ]);
        this.isLoading = false;
      }
    });
  }

  private async loadApplicantDetails(): Promise<void> {
    try {
      const res = await this.interviewService.getApplicantDetailsById(this.applicationId);
      if (res?.responsecode === '00' && res?.data) {
        const d = res.data;
        const firstName = d.firstName ?? '';
        const lastName  = d.lastName ?? '';
        this.jobId=d?.jobId;
        const fullName  = `${firstName} ${lastName}`.trim();
        this.candidate = {
          initials:   this.getInitials(fullName),
          name:       fullName,
          status:     d.currentStage ?? '',
          role:       d.jobTitle ?? '',
          planName:   d.planName ?? '',
          noOfRounds: d.noOfRounds ?? 0,
          email:      d.email ?? '',
          phone:      d.phNo ?? '',
          appliedOn:  this.formatDate(d.CreatedDate),
          experience: '',
          candidateId:d.candidateId ?? '',
        };
      }
    } catch {
      this.notification.error('Failed to load applicant details');
    }
  }

  // ── Create / fetch interview session ─────────────────────────────────────────
  
  private async loadQuestionsForAlreadyFinalised(){
    const res:any=await this.interviewService.loadFinalizedQuestions(this.applicationId);
    if(res?.hasOwnProperty('questions') && res?.questions?.length>0){
       this.questions = this.mapApiQuestions(res?.questions ?? []);
       this.isQuestionsFinalized=false;
       this.disabledQuestions=true;
    }
    else{
      // if(res?.status==204){

      // }
    }
   
  }
  // ── Computed helpers ─────────────────────────────────────────────────────────
  get passPercentageLabel(): string {
    if (this.minPassPercentage < 40) return 'Low';
    if (this.minPassPercentage < 70) return 'Moderate';
    return 'High';
  }

  get passPercentageColor(): string {
    if (this.minPassPercentage < 40) return '#ef4444';
    if (this.minPassPercentage < 70) return '#f59e0b';
    return '#2563eb';
  }

  get selectedQuestionTypes(): string[] {
    const types: string[] = [];
    if (this.questionTypes.technical) types.push('technical');
    if (this.questionTypes.behavioral) types.push('behavioural');
    if (this.questionTypes.situational) types.push('situational');
    return types;
  }

  // ── Generate AI questions ────────────────────────────────────────────────────
  async generateQuestions(): Promise<void> {
    if (!this.selectedQuestionTypes.length) {
      this.notification.error('Please select at least one question type');
      return;
    }
    this.isGenerating = true;
    try {
      const payload = {
        application_id: this.applicationId,
        number_of_questions: this.totalQuestions,
        difficulty_level: this.difficultyLevel,
        question_type: this.selectedQuestionTypes,
      
      };
      const res = await this.interviewService.generateAIQuestions(payload);
      this.questions = this.mapApiQuestions(res?.questions ?? []);
    } catch {
      this.notification.error('Failed to generate questions. Please try again.');
    } finally {
      this.isGenerating = false;
    }
  }

  // ── Edit in-place (FE only) ──────────────────────────────────────────────────
  startEdit(q: any): void {
    q.isEditing = true;
    q.editText = q.question;
  }

  saveEdit(q: any): void {
    if (q.editText?.trim()) q.question = q.editText.trim();
    q.isEditing = false;
  }

  cancelEdit(q: any): void {
    q.isEditing = false;
    q.editText = undefined;
  }

  // ── Delete (FE only) ─────────────────────────────────────────────────────────
  deleteQuestion(id: number): void {
    this.questions = this.questions.filter((q) => q.id !== id);
  }

  // ── Add custom question (FE only — no API call) ──────────────────────────────
  addQuestion(): void {
    if (!this.newQuestion.question?.trim()) return;
    this.questions = [
      ...this.questions,
      {
        id: Date.now(),          // local temp ID; finalize sends it as-is
        type: this.toDisplayType(this.newQuestion.type),
        question: this.newQuestion.question.trim(),
        expectedTime: this.newQuestion.expectedTime,
        difficulty: this.capitalize(this.newQuestion.difficulty),
        isEditing: false,
        editText: '',
        isCustom: true,
      },
    ];
    // this.notification.success('Question added');
    this.resetAddForm();
  }

  cancelAdd(): void {
    this.resetAddForm();
  }

  private resetAddForm(): void {
    this.showAddForm = false;
    this.newQuestion = { type: 'technical', question: '', expectedTime: '2-3 mins', difficulty: 'Medium' };
  }

  // ── Finalize questions ───────────────────────────────────────────────────────
  async finalizeQuestions(): Promise<void> {
    if (!this.questions.length) {
      this.notification.error('No questions to finalize');
      return;
    }
    this.isFinalizing = true;
    try {
      await this.interviewService.finalizeQuestions(this.buildFinalizePayload());
      this.notification.success('Questions finalized successfully');
      this.isQuestionsFinalized=false;
    } catch {
      this.notification.error('Failed to finalize questions');
    } finally {
      this.isFinalizing = false;
    }
  }

  // ── Move to schedule ─────────────────────────────────────────────────────────
  async moveToSchedule(): Promise<void> {
    if (!this.questions.length) {
      this.notification.error('Please generate questions before scheduling');
      return;
    }
    this.isScheduling = true;
    try {
      await this.interviewService.finalizeQuestions(this.buildFinalizePayload());
      await this.interviewService.updateMoveToSchedule({
        application_id: this.applicationId,
        // move_to_schedule: true,
      });
      this.notification.success('Moved to schedule successfully');
      this.router.navigate(['/candidate-management/ai-interview-zone'], {
        relativeTo: this.route,
        queryParams: { applicationId: this.applicationId, sessionId: this.interviewSessionId },
      });
    } catch {
      this.notification.error('Failed to move to schedule');
    } finally {
      this.isScheduling = false;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      Technical: 'tag-technical',
      Behavioral: 'tag-behavioral',
      Situational: 'tag-situational',
    };
    return map[type] || '';
  }

  private buildFinalizePayload(): any {
    return {
      application_id: this.applicationId,
      questions: this.questions.map((q) => ({
        question_id: q.id,
        question: q.question,
        expected_time: q.expectedTime,
        difficulty_level: q.difficulty.toLowerCase(),
        question_type: this.toApiType(q.type),
      })),
      min_pass_percentage: this.minPassPercentage,
      acceptable_score_range: String(this.acceptableScoreMin),
    };
  }

  private mapApiQuestions(apiQuestions: any[]): any[] {
    return apiQuestions.map((q) => ({
      id: q.question_id,
      type: this.toDisplayType(q.question_type),
      question: q.question,
      expectedTime: q.expected_time,
      difficulty: this.capitalize(q.difficulty_level),
      isEditing: false,
      editText: '',
    }));
  }

  private toDisplayType(apiType: string): string {
    const map: Record<string, string> = {
      technical:   'Technical',
      behavioural: 'Behavioral',
      behavioral:  'Behavioral',
      situational: 'Situational',
    };
    return map[apiType?.toLowerCase()] ?? apiType;
  }

  private toApiType(displayType: string): string {
    const map: Record<string, string> = {
      Technical:   'technical',
      Behavioral:  'behavioural',
      Situational: 'situational',
    };
    return map[displayType] ?? displayType.toLowerCase();
  }

  private capitalize(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }


  ngAfterViewInit(): void {
    // Wait a tick so the layout (topbar/sidebar/etc.) has settled before measuring.
    setTimeout(() => this.lockAvailableHeight());
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.lockAvailableHeight();
  }

  // Measures exactly how much vertical space is left below whatever sits above
  // this component (topbar, breadcrumbs, etc.) and locks the root to that height.
  // This works regardless of how the surrounding app shell is laid out, since it
  // reads the real rendered position instead of relying on percentage-height
  // chains up through ancestors. Only the inner settings/questions panels scroll;
  // the outer page never does.
  private lockAvailableHeight(): void {
    const el = this.iqRootRef?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    const top = el.getBoundingClientRect().top;
    el.style.height = `calc(100vh - ${top}px)`;
  }

  handleBack(){
    this.router.navigate(['/candidate-management/ai-interview-zone']
    );
  }
}