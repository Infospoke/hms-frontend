import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../../services/job.service';

export interface InterviewPlan {
  id: number;
  name: string;
  rounds: number;
  lastUpdated: string;
  updatedBy: string;
  description: string;
  status: string;
  applicableTo: string;
  applicableDepartments: string;
  roundDetails: InterviewRound[];
  evaluationCriteria: string;
  ratingScale: string;
  minPassingScore: number;
}

export interface InterviewRound {
  order: number;
  stageName: string;
  stageType: string;
  interviewMode: string;
  weightage: number;
  mandatory: boolean;
}
@Component({
  selector: 'app-interview-plan-step',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interview-plan-step.component.html',
  styleUrl: './interview-plan-step.component.scss',
})
export class InterviewPlanStepComponent implements OnInit {
  @Input() form!: FormGroup;

  private jobService = inject(JobService);

  plans: InterviewPlan[] = [];
  selectedPlan: InterviewPlan | null = null;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchTerm = '';

ngOnInit(): void {
  if (this.form && !this.form.get('planId')) {
    this.form.addControl('planId', new FormControl(null));
  }
  if (this.form && !this.form.get('selectedPlanDetail')) {
  this.form.addControl('selectedPlanDetail', new FormControl(null));
}
  this.loadPlans();
}

private loadPlans(): void {
  // ── API call (uncomment when ready) ──────────────────────────────────
  // this.jobService.getInterviewPlans({
  //   page: this.currentPage - 1,
  //   size: this.pageSize,
  //   search: this.searchTerm.trim() || undefined,
  // })
  // .then((res: any) => {
  //   if (res?.responsecode === '00') {
  //     this.plans      = this.mapPlans(res.data?.content ?? res.data ?? []);
  //     this.totalItems = res.data?.totalElements ?? this.plans.length;
  //   }
  // })
  // .catch((err: any) => console.error('loadPlans error:', err));

  // ── Dummy data ────────────────────────────────────────────────────────
  const dummy: InterviewPlan[] = [
    {
      id: 1,
      name: 'Data Science Interview Plan',
      rounds: 3,
      lastUpdated: '10 May 2024',
      updatedBy: 'Demo Admin',
      description: 'Comprehensive interview plan for Data Science role covering technical, HR and managerial evaluation.',
      status: 'Active',
      applicableTo: 'All Job Roles',
      applicableDepartments: 'Engineering, Analytics, Product',
      roundDetails: [
        { order: 1, stageName: 'Technical Interview',  stageType: 'Technical Interview',  interviewMode: 'Online',  weightage: 40, mandatory: true  },
        { order: 2, stageName: 'HR Interview',          stageType: 'HR Interview',          interviewMode: 'Online',  weightage: 30, mandatory: true  },
        { order: 3, stageName: 'Managerial Interview',  stageType: 'Managerial Interview',  interviewMode: 'Offline', weightage: 30, mandatory: true  },
      ],
      evaluationCriteria: 'Overall Assessment',
      ratingScale: '5 Point Scale',
      minPassingScore: 60,
    },
    {
      id: 2,
      name: 'Two Round Interview',
      rounds: 2,
      lastUpdated: '08 May 2024',
      updatedBy: 'Demo Admin',
      description: 'Basic screening and technical evaluation process.',
      status: 'Active',
      applicableTo: 'All Job Roles',
      applicableDepartments: 'All Departments',
      roundDetails: [
        { order: 1, stageName: 'Screening Round',    stageType: 'HR Interview',          interviewMode: 'Online',  weightage: 40, mandatory: true  },
        { order: 2, stageName: 'Technical Round',    stageType: 'Technical Interview',   interviewMode: 'Online',  weightage: 60, mandatory: true  },
      ],
      evaluationCriteria: 'Overall Assessment',
      ratingScale: '5 Point Scale',
      minPassingScore: 50,
    },
    {
      id: 3,
      name: 'Three Round Interview',
      rounds: 3,
      lastUpdated: '07 May 2024',
      updatedBy: 'Demo Admin',
      description: 'Comprehensive evaluation process with in-depth candidate assessment.',
      status: 'Active',
      applicableTo: 'Senior Roles',
      applicableDepartments: 'Engineering, Product',
      roundDetails: [
        { order: 1, stageName: 'Aptitude Test',       stageType: 'Written Test',          interviewMode: 'Online',  weightage: 20, mandatory: true  },
        { order: 2, stageName: 'Technical Interview', stageType: 'Technical Interview',   interviewMode: 'Online',  weightage: 50, mandatory: true  },
        { order: 3, stageName: 'HR Interview',        stageType: 'HR Interview',          interviewMode: 'Offline', weightage: 30, mandatory: false },
      ],
      evaluationCriteria: 'Overall Assessment',
      ratingScale: '10 Point Scale',
      minPassingScore: 65,
    },
    {
      id: 4,
      name: 'Four Round Interview',
      rounds: 4,
      lastUpdated: '05 May 2024',
      updatedBy: 'Demo Admin',
      description: 'Complete evaluation and final assessment.',
      status: 'Active',
      applicableTo: 'Leadership Roles',
      applicableDepartments: 'All Departments',
      roundDetails: [
        { order: 1, stageName: 'Screening',           stageType: 'HR Interview',          interviewMode: 'Online',  weightage: 15, mandatory: true  },
        { order: 2, stageName: 'Technical Round 1',   stageType: 'Technical Interview',   interviewMode: 'Online',  weightage: 30, mandatory: true  },
        { order: 3, stageName: 'Technical Round 2',   stageType: 'Technical Interview',   interviewMode: 'Online',  weightage: 30, mandatory: true  },
        { order: 4, stageName: 'Final HR Round',      stageType: 'HR Interview',          interviewMode: 'Offline', weightage: 25, mandatory: true  },
      ],
      evaluationCriteria: 'Overall Assessment',
      ratingScale: '5 Point Scale',
      minPassingScore: 70,
    },
  ];

  const search = this.searchTerm.trim().toLowerCase();
  const filtered = search
    ? dummy.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search))
    : dummy;

  this.totalItems = filtered.length;
  const start = (this.currentPage - 1) * this.pageSize;
  this.plans = filtered.slice(start, start + this.pageSize);
}

  private mapPlans(data: any[]): InterviewPlan[] {
    return data.map((p: any) => ({
      id:                    p.id ?? p.planId,
      name:                  p.planName ?? p.name,
      rounds:                p.numberOfRounds ?? p.rounds ?? 0,
      lastUpdated:           p.lastUpdatedDate ?? p.lastUpdated ?? '',
      updatedBy:             p.lastUpdatedBy ?? p.updatedBy ?? '',
      description:           p.description ?? '',
      status:                p.status ?? 'Active',
      applicableTo:          p.applicableTo ?? 'All Job Roles',
      applicableDepartments: Array.isArray(p.applicableDepartments)
        ? p.applicableDepartments.join(', ')
        : (p.applicableDepartments ?? '—'),
      roundDetails: (p.interviewRounds ?? p.roundDetails ?? []).map((r: any) => ({
        order:         r.roundOrder ?? r.order,
        stageName:     r.stageName,
        stageType:     r.stageType,
        interviewMode: r.interviewMode,
        weightage:     r.weightage,
        mandatory:     r.mandatory ?? true,
      })),
      evaluationCriteria: p.evaluationCriteria ?? 'Overall Assessment',
      ratingScale:        p.ratingScale ?? '5 Point Scale',
      minPassingScore:    p.minPassingScore ?? 60,
    }));
  }

selectPlan(plan: InterviewPlan): void {
  this.selectedPlan = plan;
  this.form.get('planId')?.setValue(plan.id);
  this.form.get('selectedPlanDetail')?.setValue(plan);  // ← add this
}
  isSelected(plan: InterviewPlan): boolean {
    return this.selectedPlan?.id === plan.id;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadPlans();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPlans();
  }

  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get showingText(): string {
    const from = (this.currentPage - 1) * this.pageSize + 1;
    const to   = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${from} to ${to} of ${this.totalItems} plans`;
  }
}