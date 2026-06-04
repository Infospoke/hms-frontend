import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../../services/job.service';
import { InterviewServiceService } from '../../../../../interview/service/interview-service.service';

export interface InterviewPlan {
  id: number;
  name: string;
  rounds: number;
  lastUpdated: string;
  updatedBy: string;
  description: string;
  status: string;
  approvalStatus: string;
  roundDetails: InterviewRound[];
}

export interface InterviewRound {
  order: number;
  stageName: string;
  stageType: string;
  interviewMode: string;
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

  private jobService       = inject(JobService);
  private interviewService = inject(InterviewServiceService);

  plans: InterviewPlan[]             = [];
  selectedPlan: InterviewPlan | null = null;
  isLoadingDetail                    = false;

  currentPage = 1;
  pageSize    = 10;
  totalItems  = 0;
  searchTerm  = '';

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.form && !this.form.get('planId')) {
      this.form.addControl('planId', new FormControl(null));
    }
    if (this.form && !this.form.get('selectedPlanDetail')) {
      this.form.addControl('selectedPlanDetail', new FormControl(null));
    }
    this.loadPlans();
  }

  // ── API: list ──────────────────────────────────────────────────────────────
  // Response shape: res.data.interviewPlans[], res.data.totalElements

  private async loadPlans(): Promise<void> {
    const payload = {
      page:           this.currentPage - 1,
      size:           this.pageSize,
      sortBy:         'createdOn',
      direction:      'DESC',
      
      filters: {
        status:     'Active',
        dateFilter: 'thisWeek',
        approvalStatus: 'APPROVED',
        ...(this.searchTerm.trim() ? { search: this.searchTerm.trim() } : {}),
      },
    };

    try {
      const res = await this.interviewService.plansList(payload);

      if (res?.responsecode === '00') {
        const list      = res.data?.interviewPlans ?? res.data?.content ?? res.data ?? [];
        this.plans      = this.mapListPlans(list);
        this.totalItems = res.data?.totalElements ?? this.plans.length;
      } else {
        console.warn('plansList – unexpected response code:', res?.responsecode);
        this.plans      = [];
        this.totalItems = 0;
      }
    } catch (err) {
      console.error('loadPlans error:', err);
      this.plans      = [];
      this.totalItems = 0;
    }
  }

  // ── API: detail by ID ──────────────────────────────────────────────────────
  // Response shape: res.data.planName, res.data.interviewRoundsResponse[]
  // commentTimeline is intentionally ignored

  async selectPlan(plan: InterviewPlan): Promise<void> {
    this.form.get('planId')?.setValue(plan.id);
    this.selectedPlan    = null;
    this.isLoadingDetail = true;

    try {
      const res = await this.interviewService.planDetailsByID(plan.id);

      if (res?.responsecode === '00') {
        const d = res.data;
        const detail: InterviewPlan = {
          id:             plan.id,
          name:           d.planName        ?? plan.name,
          rounds:         d.interviewRoundsResponse?.length ?? 0,
          lastUpdated:    d.createdOn        ?? '',
          updatedBy:      d.createdBy        ?? '',
          description:    d.description      ?? '',
          status:         d.status           ?? '',
          approvalStatus: d.approvalStatus   ?? '',
          roundDetails: (d.interviewRoundsResponse ?? []).map((r: any) => ({
            order:         r.roundOrder,
            stageName:     r.stageName,
            stageType:     r.stageType,
            interviewMode: r.interviewMode,
            mandatory:     r.mandatory ?? true,
          })),
        };
        this.selectedPlan = detail;
        this.form.get('selectedPlanDetail')?.setValue(detail);
      } else {
        console.warn('planDetailsByID – unexpected response code:', res?.responsecode);
      }
    } catch (err) {
      console.error('planDetailsByID error:', err);
    } finally {
      this.isLoadingDetail = false;
    }
  }

  // ── Mapping: list items ────────────────────────────────────────────────────

  private mapListPlans(data: any[]): InterviewPlan[] {
    return data.map((p: any) => ({
      id:             p.id ?? p.planId,
      name:           p.planName ?? p.name,
      rounds:         p.rounds ?? p.numberOfRounds ?? 0,
      lastUpdated:    p.createdOn ?? p.lastUpdatedDate ?? '',
      updatedBy:      p.createdBy ?? p.lastUpdatedBy ?? '',
      description:    p.description ?? '',
      status:         p.status ?? '',
      approvalStatus: p.approvalStatus ?? '',
      roundDetails:   [],   // not returned in list; loaded on select
    }));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  isSelected(plan: InterviewPlan): boolean {
    return this.form.get('planId')?.value === plan.id;
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

  // ── Pagination helpers ─────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingText(): string {
    const from = (this.currentPage - 1) * this.pageSize + 1;
    const to   = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${from} to ${to} of ${this.totalItems} plans`;
  }
}