import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EvaluationSummaryComponent } from '../evaluation-summary/evaluation-summary.component';
import { AiInterviewComponent } from '../ai-interview/ai-interview.component';
import { RoundDetailComponent } from '../round-detail/round-detail.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";

// Dummy data for development/testing
const DUMMY_DATA = {
  candidate: {
    avatarInitials:    'AK',
    name:              'Arjun Kumar',
    tag:               'Strong Hire',
    email:             'arjun.kumar@example.com',
    phone:             '+91 98765 43210',
    location:          'Hyderabad, India',
    jobTitle:          'Senior Frontend Developer',
    jobId:             'JOB-2024-0042',
    interviewType:     'AI Interview',
    interviewDate:     '14 Jun 2025',
    experience:        '4 - 7 Yrs',
    department:        'Engineering',
    interviewDuration: '45-60 min',
    aiScore:           82,
  },

  evaluationData: {
    averageAiScore:           82,
    totalRoundsCompleted:     4,
    totalRounds:              4,
    totalQuestionsAttempted:  15,
    averageScoreAcrossRounds: 82,
    status:                   'Cleared',
    minimumPassScore:         60,
    overallScore:             82,
    rounds: [
      {
        round:            1,
        roundType:        'AI Interview',
        interviewerName:  'AI System',
        interviewerTitle: 'Automated Evaluation',
        score:            82,
        recommendation:   'Pass',
        expanded:         false,
        evalSummary: {
          skills: [
            { label: 'Technical Knowledge', score: '4.1' },
            { label: 'Problem Solving',     score: '4.0' },
            { label: 'Communication',       score: '4.2' },
          ],
          totalScore: '82/100',
        },
        interviewerFeedback: 'Strong overall performance. Demonstrated solid Angular knowledge and clear problem-solving ability.',
      },
      {
        round:            2,
        roundType:        'Technical Round',
        interviewerName:  'Ravi Shankar',
        interviewerTitle: 'Principal Engineer',
        score:            85,
        recommendation:   'Pass',
        expanded:         false,
        evalSummary: {
          skills: [
            { label: 'Technical Knowledge', score: '4.5' },
            { label: 'Problem Solving',     score: '4.0' },
            { label: 'Analytical Thinking', score: '4.0' },
            { label: 'Communication',       score: '4.0' },
            { label: 'Cultural Fit',        score: '5.0' },
          ],
          totalScore: '85/100',
        },
        interviewerFeedback: 'Excellent Angular knowledge, clean code practices, and ability to explain complex concepts clearly.',
      },
      {
        round:            3,
        roundType:        'Managerial Round',
        interviewerName:  'Priya Reddy',
        interviewerTitle: 'Engineering Manager',
        score:            78,
        recommendation:   'Pass',
        expanded:         false,
        evalSummary: {
          skills: [
            { label: 'Leadership & Ownership',      score: '4.0' },
            { label: 'Strategic Thinking',          score: '3.5' },
            { label: 'Problem Solving & Decision',  score: '4.0' },
            { label: 'Communication',               score: '4.0' },
            { label: 'People Management',           score: '3.5' },
          ],
          totalScore: '78/100',
        },
        interviewerFeedback: 'Good ownership mindset, team-oriented, and proactive in communication.',
      },
      {
        round:            4,
        roundType:        'HR Round',
        interviewerName:  'Neha Gupta',
        interviewerTitle: 'HR Business Partner',
        score:            84,
        recommendation:   'Strong Hire',
        expanded:         false,
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
    aiRecommendation:      'Arjun demonstrated strong technical skills, cultural alignment, and excellent communication. Recommended for the role with high confidence.',
    aiRecommendationScore: 82,
  },

  aiInterviewData: {
    totalQuestions: 5,
    attempted:      5,
    averageAiScore: 8.2,
    questions: [
      {
        id:              1,
        question:        'Explain the difference between Angular services and components.',
        type:            'Technical',
        difficulty:      'Easy',
        time:            '2m 15s',
        aiScore:         9,
        maxScore:        10,
        rating:          'Excellent',
        expanded:        false,
        idealAnswer:     'Angular services are singleton classes managed by the DI container. They handle business logic, HTTP calls, and data sharing across components. Components are tree-node UI elements with a template, lifecycle hooks, and a change-detection cycle. The key distinction is that services have no view, while components own a template and are tied to the DOM.',
        candidateAnswer: 'Services are singleton classes used for business logic and data sharing across components. Components handle the view layer with templates and lifecycle hooks.',
        aiEvaluation:    'The candidate clearly distinguished services from components. Mentioned singleton pattern and lifecycle hooks. A well-structured answer.',
        evalDetail: { relevance: 5, completeness: 4, accuracy: 5, clarity: 5 },
      },
      {
        id:              2,
        question:        'How do you optimize performance in a large Angular application?',
        type:            'Technical',
        difficulty:      'Medium',
        time:            '3m 40s',
        aiScore:         8,
        maxScore:        10,
        rating:          'Good',
        expanded:        false,
        idealAnswer:     'Key strategies: (1) Lazy-load feature modules so initial bundle is minimal. (2) Use OnPush change detection to limit rerender scope. (3) Use trackBy in *ngFor to avoid full list re-renders. (4) Virtual scrolling with CdkVirtualScrollViewport for large lists. (5) Unsubscribe from Observables using async pipe or takeUntilDestroyed. (6) Pre-load critical routes with a PreloadingStrategy.',
        candidateAnswer: 'Use lazy loading, OnPush change detection strategy, trackBy in ngFor, and avoid unnecessary subscriptions.',
        aiEvaluation:    'Good coverage of key strategies. Mentioned lazy loading and OnPush which are high-impact. Could have elaborated on virtual scrolling and RxJS cleanup patterns.',
        evalDetail: { relevance: 5, completeness: 3, accuracy: 5, clarity: 4 },
      },
      {
        id:              3,
        question:        'Describe a challenging project and how you handled it.',
        type:            'Behavioural',
        difficulty:      'Medium',
        time:            '4m 05s',
        aiScore:         8,
        maxScore:        10,
        rating:          'Good',
        expanded:        false,
        idealAnswer:     'A strong STAR-method answer should clearly define the Situation (context and stakes), Task (your role and responsibility), Action (specific steps you took), and Result (measurable outcomes). The best answers include cross-team collaboration, technical decision-making under constraints, and quantifiable impact.',
        candidateAnswer: 'Led a migration from AngularJS to Angular 14 for a large e-commerce platform with 50+ components, coordinating with 3 teams over 6 months.',
        aiEvaluation:    'Structured response with a clear situation, task, and result. Good emphasis on cross-team coordination. Measurable outcome (50+ components, 6 months) is a positive indicator.',
        evalDetail: { relevance: 5, completeness: 4, accuracy: 4, clarity: 4 },
      },
      {
        id:              4,
        question:        'What is the purpose of RxJS in Angular and give an example use case?',
        type:            'Technical',
        difficulty:      'Medium',
        time:            '3m 10s',
        aiScore:         8,
        maxScore:        10,
        rating:          'Good',
        expanded:        false,
        idealAnswer:     'RxJS enables reactive, event-driven programming via Observables. In Angular it powers HttpClient, Router events, and reactive forms. A concrete example: use switchMap to cancel a pending HTTP search request when the user types a new character, preventing race conditions. Use takeUntilDestroyed to auto-unsubscribe when a component is destroyed.',
        candidateAnswer: 'RxJS provides reactive programming in Angular through Observables. I use it for HTTP requests, combining streams with operators like switchMap, and managing component state.',
        aiEvaluation:    'Solid answer demonstrating practical knowledge. Mentioned switchMap which shows depth. Could have mentioned takeUntil/async pipe for subscription cleanup.',
        evalDetail: { relevance: 5, completeness: 3, accuracy: 5, clarity: 4 },
      },
      {
        id:              5,
        question:        'How do you approach code reviews in a team setting?',
        type:            'Behavioural',
        difficulty:      'Easy',
        time:            '2m 50s',
        aiScore:         8,
        maxScore:        10,
        rating:          'Good',
        expanded:        false,
        idealAnswer:     'Effective code reviews focus on understanding intent before critiquing style. Review for correctness, edge cases, security, testability, and readability. Use a "suggest, not mandate" approach. Comment with context ("This pattern could cause N+1 here"), not just labels. Separate review from approval — and use automated lint/format checks so humans focus on logic.',
        candidateAnswer: 'I focus on understanding intent before critiquing. I comment on logic, readability, and edge cases, and prefer suggesting alternatives rather than mandating changes.',
        aiEvaluation:    'Reflects a mature and collaborative approach. Emphasis on constructive feedback and understanding intent are positive leadership signals.',
        evalDetail: { relevance: 5, completeness: 4, accuracy: 5, clarity: 5 },
      },
    ],
    proctoring: {
      totalViolations: 3,
      highSeverity:    0,
      mediumSeverity:  2,
      lowSeverity:     1,
      overallRisk:     'Low',
      violations: [
        {
          time:        '00:04:12',
          violation:   'Tab Switch',
          severity:    'Medium',
          description: 'Candidate switched browser tab briefly. Returned within 5 seconds.',
          snapshots:   [],
        },
        {
          time:        '00:18:47',
          violation:   'Tab Switch',
          severity:    'Medium',
          description: 'Second tab switch detected. Duration: 3 seconds.',
          snapshots:   [],
        },
        {
          time:        '00:31:05',
          violation:   'Audio Flag',
          severity:    'Low',
          description: 'Background noise detected briefly. Did not affect response quality.',
          snapshots:   [],
        },
      ],
    },
  },

  technicalData: {
    overview: {
      interviewDateTime:  '14 Jun 2025, 10:00 AM',
      duration:           '55 minutes',
      score:              85,
      recommendation:     'Pass',
      interviewer: {
        name:               'Ravi Shankar',
        title:              'Principal Engineer',
        avatarInitials:     'RS',
        employeeId:         'EMP-1042',
        department:         'Engineering',
        email:              'ravi.shankar@infospoke.com',
        phone:              '+91 98000 11111',
        totalExperience:    '12 Years',
        interviewConducted: 48,
        mode:               'Video Call',
      },
    },
    feedback: {
      overallRating: 4,
      competencies: [
        { key: 'technical',     label: 'Technical Knowledge',  description: 'Core technical concepts and depth',    rating: 5 },
        { key: 'problem',       label: 'Problem Solving',      description: 'Analytical and debugging approach',    rating: 4 },
        { key: 'communication', label: 'Communication',        description: 'Clarity and articulation',             rating: 4 },
        { key: 'analytical',    label: 'Analytical Thinking',  description: 'Critical and logical thinking',        rating: 4 },
        { key: 'cultural',      label: 'Cultural Fit',         description: 'Alignment with team values',           rating: 5 },
      ],
      strengths:             'Excellent Angular knowledge, clean code practices, and ability to explain complex concepts clearly.',
      areasOfImprovement:    'Could improve on backend knowledge and system design at scale.',
      additionalComments:    'A strong candidate. Would recommend fast-tracking to the next round.',
      decision:              'next',
    },
  },

  managerialData: {
    overview: {
      interviewDateTime:  '14 Jun 2025, 2:00 PM',
      duration:           '40 minutes',
      score:              78,
      recommendation:     'Pass',
      interviewer: {
        name:               'Priya Reddy',
        title:              'Engineering Manager',
        avatarInitials:     'PR',
        employeeId:         'EMP-0234',
        department:         'Engineering',
        email:              'priya.reddy@infospoke.com',
        phone:              '+91 98000 22222',
        totalExperience:    '9 Years',
        interviewConducted: 31,
        mode:               'Video Call',
      },
    },
    feedback: {
      overallRating: 4,
      competencies: [
        { key: 'leadership',   label: 'Leadership & Ownership',             description: 'Ownership mindset and initiative',         rating: 4 },
        { key: 'strategic',    label: 'Strategic Thinking',                 description: 'Long-term planning and goal alignment',     rating: 3 },
        { key: 'decision',     label: 'Problem Solving & Decision Making',  description: 'Decision quality under constraints',        rating: 4 },
        { key: 'comm',         label: 'Communication',                      description: 'Stakeholder communication and clarity',     rating: 4 },
        { key: 'people',       label: 'People Management',                  description: 'Team dynamics, mentoring, collaboration',   rating: 3 },
        { key: 'culture',      label: 'Culture Fit',                        description: 'Alignment with company culture and values', rating: 5 },
      ],
      strengths:             'Good ownership mindset, team-oriented, and proactive in communication.',
      areasOfImprovement:    'Should work on estimation skills and breaking down complex projects.',
      additionalComments:    'Solid candidate with the right attitude for the team.',
      decision:              'next',
    },
  },

  hrData: {
    overview: {
      interviewDateTime:  '15 Jun 2025, 11:00 AM',
      duration:           '30 minutes',
      score:              84,
      recommendation:     'Strong Hire',
      interviewer: {
        name:               'Neha Gupta',
        title:              'HR Business Partner',
        avatarInitials:     'NG',
        employeeId:         'EMP-0087',
        department:         'Human Resources',
        email:              'neha.gupta@infospoke.com',
        phone:              '+91 98000 33333',
        totalExperience:    '7 Years',
        interviewConducted: 112,
        mode:               'Video Call',
      },
    },
    feedback: {
      overallRating: 4,
      competencies: [
        { key: 'comm',         label: 'Communication Skills',         description: 'Verbal clarity and listening',                  rating: 5 },
        { key: 'culture',      label: 'Culture Fit',                  description: 'Alignment with company values and norms',       rating: 5 },
        { key: 'compensation', label: 'Compensation & Expectations',  description: 'Salary expectation alignment',                  rating: 4 },
        { key: 'motivation',   label: 'Motivation & Career Intent',   description: 'Long-term career alignment and drive',          rating: 4 },
        { key: 'behavioral',   label: 'Behavioral & Attitude',        description: 'Professional demeanor and emotional quotient',  rating: 5 },
      ],
      strengths:             'Very professional, great attitude, and strong alignment with company values.',
      areasOfImprovement:    'Can be more assertive in salary negotiations.',
      additionalComments:    'Highly recommend. Would be a great cultural add to the team.',
      decision:              'next',
    },
  },
};

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
  styleUrl:"./interview-performance.component.scss"
})
export class InterviewPerformanceComponent implements OnInit {

  private route            = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService);

  loading = true;
  error: string | null = null;

  candidate: any       = null;
  evaluationData: any  = null;
  aiInterviewData: any = null;
  technicalData: any   = null;
  managerialData: any  = null;
  hrData: any          = null;

  activeTab = 'evaluation';

  readonly tabs: { key: string; label: string; icon: string }[] = [
    { key: 'evaluation',   label: 'Evaluation Summary', icon: 'chart'     },
    { key: 'ai-interview', label: 'AI Interview',        icon: 'ai'        },
    { key: 'technical',    label: 'Technical Round',     icon: 'code'      },
    { key: 'managerial',   label: 'Managerial Round',    icon: 'briefcase' },
    { key: 'hr',           label: 'HR Round',            icon: 'people'    },
  ];

  ngOnInit(): void {
    this.loadDummyData();
  }

  private loadDummyData(): void {
    this.candidate       = DUMMY_DATA.candidate;
    this.evaluationData  = DUMMY_DATA.evaluationData;
    this.aiInterviewData = DUMMY_DATA.aiInterviewData;
    this.technicalData   = DUMMY_DATA.technicalData;
    this.managerialData  = DUMMY_DATA.managerialData;
    this.hrData          = DUMMY_DATA.hrData;
    this.loading         = false;
  }

  private async fetchDetails(id: string): Promise<void> {
    try {
      const res: any = await this.interviewService.getInterviewDetails(id);
      if (res?.responsecode === '00') {
        this.mapToViewModel(res.data);
      } else {
        this.error = res?.message ?? 'Failed to load interview performance data.';
      }
    } catch {
      this.error = 'An error occurred while loading data.';
    } finally {
      this.loading = false;
    }
  }

  private mapToViewModel(d: any): void {
    const name = d.applicantName ?? d.candidateName ?? '';
    this.candidate = {
      avatarInitials:    this.getInitials(name),
      name,
      tag:               d.overallDecision ?? d.finalDecision ?? d.recommendation ?? null,
      email:             d.applicantEmail ?? d.email ?? '',
      phone:             d.applicantPhoneNumber ?? d.phone ?? '',
      location:          d.location ?? null,
      jobTitle:          d.jobTitle ?? '--',
      jobId:             d.jobCode ?? d.jobId ?? '--',
      interviewType:     d.interviewType ?? 'AI Interview',
      interviewDate:     d.interviewScheduledAt
                           ? this.formatDate(d.interviewScheduledAt)
                           : (d.interviewDate ? this.formatDate(d.interviewDate) : '--'),
      experience:        (d.minExperience != null && d.maxExperience != null)
                           ? `${d.minExperience} - ${d.maxExperience} Yrs`
                           : (d.experience ?? '--'),
      department:        d.department ?? '--',
      interviewDuration: d.noOfQuestions
                           ? `${d.noOfQuestions * 2}-${d.noOfQuestions * 3} min`
                           : (d.interviewDuration ?? d.duration ?? '--'),
      aiScore:           d.aiScore ?? d.overallScore ?? 0,
    };
    this.evaluationData  = d.evaluationSummary ?? d.evaluation ?? null;
    this.aiInterviewData = d.aiInterview ?? { questions: d.questions ?? [] };
    this.technicalData   = d.technicalRound   ?? this.findRound(d.rounds, 'technical')  ?? null;
    this.managerialData  = d.managerialRound  ?? this.findRound(d.rounds, 'managerial') ?? null;
    this.hrData          = d.hrRound          ?? this.findRound(d.rounds, 'hr')          ?? null;
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
  }

  tagClass(tag: string): string {
    const map: Record<string, string> = {
      'Strong Hire': 'strong-hire',
      'Hire':        'hire',
      'Hold':        'hold',
      'Reject':      'reject',
    };
    return map[tag] ?? 'hire';
  }
}
