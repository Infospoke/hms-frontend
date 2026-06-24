import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";

// ── API response shape ────────────────────────────────────────────────────────
interface ApiQuestion {
  question_id: number;
  question: string;
  expected_time: string;
  difficulty_level: string;   // "medium" | "easy" | "hard"
  question_type: string;      // "technical" | "behavioural" | "situational" …
}

interface ApiData {
  applicantEmail: string;
  applicantName: string;
  applicantPhoneNumber: string;
  department: string;
  interviewMailSentAt: string | null;
  interviewScheduledAt: string | null;
  jobCode: string;
  jobTitle: string;
  maxExperience: number;
  minExperience: number;
  noOfQuestions: number;
  questionDifficulty: string;
  questionType: string[];
  questions: ApiQuestion[];
  scheduledBy: string | null;
}

interface ApiResponse {
  data: ApiData;
  message: string;
  responsecode: string;
}

// ── Internal view-model types ─────────────────────────────────────────────────
interface Candidate {
  initials: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface JobDetails {
  jobTitle: string;
  jobId: string;
  department: string;
  experience: string;
  scheduledAt: string;
  scheduledBy: string;
  interviewType: string;
  timeZone: string;
}

interface Stat {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sub: string | null;
  hasInfo?: boolean;
}

interface Question {
  id: number;
  text: string;
  type: string;
  difficulty: string;
}

@Component({
  selector: 'app-ai-interview-details',
  imports: [CommonModule, HeadingComponent],
  templateUrl: './ai-interview-details.component.html',
  styleUrl: './ai-interview-details.component.scss',
})
export class AiInterviewDetailsComponent implements OnInit {

  private http    = inject(HttpClient);
  private route   = inject(ActivatedRoute);
  private router=inject(Router);
  // ── Loading / error state ──────────────────────────────────────────────────
  loading = true;
  error: string | null = null;

  // ── View-model (populated after API call) ──────────────────────────────────
  candidate!: Candidate;
  jobDetails!: JobDetails;
  stats: Stat[] = [];
  allQuestions: Question[] = [];
  showAll = false;
  private interviewSerice=inject(InterviewServiceService)
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.fetchDetails(id);
  }

  // ── API call ───────────────────────────────────────────────────────────────
  private async fetchDetails(id: string){
  
    const res:any=await this.interviewSerice.getInterviewDetails(id);
    if(res?.responsecode=='00'){
      this.mapToViewModel(res.data)
    }
    
  }

  // ── Mapping ────────────────────────────────────────────────────────────────
  private mapToViewModel(d: ApiData): void {

    /* ---------- Candidate ---------- */
    this.candidate = {
      initials: this.getInitials(d.applicantName),
      name:     d.applicantName,
      email:    d.applicantEmail,
      phone:    d.applicantPhoneNumber,
      status:   'AI Interview Scheduled',
    };

    /* ---------- Job Details ---------- */
    this.jobDetails = {
      jobTitle:      d.jobTitle,
      jobId:         d.jobCode,
      department:    d.department,
      experience:    `${d.minExperience} - ${d.maxExperience} Years`,
      scheduledAt:   d.interviewScheduledAt
                       ? this.formatDate(d.interviewScheduledAt)
                       : 'Not Scheduled',
      scheduledBy:   d.scheduledBy ?? 'Candidate (Self Scheduled)',
      interviewType: 'AI Interview',
      timeZone:      'IST (Asia/Kolkata)',
    };

    /* ---------- Stats ---------- */
    this.stats = [
      {
        icon:       'fa-regular fa-envelope',
        iconColor:  '#7c3aed',
        iconBg:     '#ede9fe',
        label:      'Interview Link',
        value:      d.interviewMailSentAt ? 'Sent to candidate email' : 'Not sent yet',
        sub:        d.interviewMailSentAt ? this.formatDate(d.interviewMailSentAt) : null,
      },
      {
        icon:       'fa-regular fa-clock',
        iconColor:  '#0891b2',
        iconBg:     '#cffafe',
        label:      'Interview Duration',
        value:      `${d.noOfQuestions * 2}–${d.noOfQuestions * 3} Minutes`,
        sub:        null,
      },
      {
        icon:       'fa-regular fa-file-lines',
        iconColor:  '#059669',
        iconBg:     '#d1fae5',
        label:      'Total Questions',
        value:      `${d.noOfQuestions} Questions`,
        sub:        null,
      },
      
    ];

    /* ---------- Questions ---------- */
    this.allQuestions = d.questions.map(q => ({
      id:         q.question_id,
      text:       q.question,
      type:       this.capitalizeType(q.question_type),
      difficulty: this.capitalizeType(q.difficulty_level),
    }));

    this.loading = false;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  private capitalizeType(value: string): string {
    if (!value) return '';
    // "behavioural" → "Behavioural", "technical" → "Technical" etc.
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  private formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day:    '2-digit',
        month:  'short',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  get visibleQuestions(): Question[] {
    return this.showAll ? this.allQuestions : this.allQuestions.slice(0, 3);
  }

  get totalQuestions(): number {
    return this.allQuestions.length;
  }

  // ── Badge helpers ──────────────────────────────────────────────────────────
  getDifficultyClass(d: string): string {
    return (
      { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' }[d] ?? ''
    );
  }

  getTypeClass(t: string): string {
    return (
      {
        Technical:   'type-technical',
        Coding:      'type-coding',
        Conceptual:  'type-conceptual',
        Behavioral:  'type-behavioral',
        Behavioural: 'type-behavioral',
        Situational: 'type-situational',
      }[t] ?? ''
    );
  }

  onBack(): void {
    this.router.navigate(['/supply/ai-interview-zone'],
      {state: { activeType: 'si' }}
    );
  }
}