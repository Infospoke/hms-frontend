import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { candidateManagement, interview } from '../../../../shared/constants/reusbale-filter';
import { TableColumn, ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { Router } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';
import { ApprovalService } from '../../../approvals/services/approval-service';

// ── API shapes ────────────────────────────────────────────────────────────────

export interface RoundDetail {
  roundName: string;
  roundOrder: number;
  stageTypeId: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export interface CandidateApiItem {
  applicationId: number;
  candidateName: string;
  completedRounds: number;
  currentStage: string;
  currentStageId: number;
  department: string;
  email: string;
  jobTitle: string;
  lastActivity: string;
  roundDetails: RoundDetail[];
  totalRounds: number;
}

// ── Display shape (used by the table / template) ──────────────────────────────

export interface Candidate {
  applicationId: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  roundsCompleted: number;
  totalRounds: number;
  roundDetails: RoundDetail[];
  currentStage: string;
  stageStatus: 'Completed' | 'In Progress';
  lastActivity: string;
  lastActivityTime: string;
}

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent, CanDirective],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.scss',
})
export class OfferManagementComponent implements OnInit {

  // ── Summary cards (values populated from count API) ───────────────────────
  cards = [
    {
      label: 'Selected Candidates',
      value: 0,
      percentage: '',
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#eaf2ff',
      iconColor: '#3b82f6',
      description: 'Completed all interview rounds',
    },
    {
      label: 'AI Interview',
      value: 0,
      percentage: '',
      iconClass: 'fa-regular fa-calendar-check',
      iconBgColor: '#fff7ed',
      iconColor: '#f97316',
      description: 'Completed',
    },
    {
      label: 'Technical Round',
      value: 0,
      percentage: '',
      iconClass: 'fa-solid fa-code',
      iconBgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      description: 'Completed',
    },
    {
      label: 'Managerial Round',
      value: 0,
      percentage: '',
      iconClass: 'fa-regular fa-calendar-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#16a34a',
      description: 'Completed',
    },
    {
      label: 'HR Round',
      value: 0,
      percentage: '',
      iconClass: 'fa-regular fa-user',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
      description: 'Completed',
    },
  ];

  dropDownData = candidateManagement;

  // ── Pagination state ──────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // ── Table config ──────────────────────────────────────────────────────────
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', width: '190px', custom: true },
    { key: 'jobTitle', label: 'Job Title', width: '180px', custom: true },
    { key: 'roundProgress', label: 'Round Progress', width: '210px', custom: true, align: 'center' },
    { key: 'currentStage', label: 'Current Stage', width: '140px', custom: true },
    { key: 'lastActivity', label: 'Last Activity', width: '120px', custom: true },
    { key: 'actions', label: 'Actions', width: '100px', custom: true, align: 'center' },
  ];

  candidates: Candidate[] = [];

  isLoading = false;

  // ── Active filters — populated from app-approval-layout's (filterChange)
  // output; loadListData() sends this straight through as the API's
  // `filters` payload. Field names are best-guess, matching the dropdown
  // keys in candidateManagement (reusbale-filter.ts) — confirm against
  // the real /hms/interview-plan/progress-list contract if results don't
  // actually narrow down.
  private currentFilters: {
    search?: string;
    allJobs?: string;
    departments?: string;
    currentStage?: string;
    dateFilter?:string
  } = {};

  private router = inject(Router);
  private interviewService = inject(InterviewServiceService);
  private approvalService=inject(ApprovalService)
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    Promise.all([this.loadCountData(),this.loadListData(), this.loadJobs(),this.loadDepartments(),this.loadStageTypes()])
  }
   private async loadStageTypes(): Promise<void> {
  try {
    const res: any = await this.interviewService.getInterviewRoundsList();
    if (res?.responsecode === '00' && Array.isArray(res.data)) {
      const data = this.mapByIds(res?.data);
          this.dropDownData = this.dropDownData.map((item: any) =>
            item.key === 'currentStage'
              ? { ...item, options: data ?? [] }
              : item
          );
    } else {
     
    }
  } catch (err) {
    console.error('[loadStageTypes]', err);
   
  }
}
  private loadDepartments() {
    const payload={
      "srDepartments": true,
    }
    this.approvalService.getDepartmentsByType(payload)
      .then((res: any) => {
        if (res?.responsecode == '00') {
          const data = this.mapForDepartment(res?.data);
          this.dropDownData = this.dropDownData.map((item: any) =>
            item.key === 'departments'
              ? { ...item, options: data ?? [] }
              : item
          );
        }
       

      })
      .catch((error: any) => {
        console.log(error);
      })
  }
  private async loadJobs() {
    const res: any = await this.interviewService.getAIInterviewZoneJobs();
    if (res?.responsecode == '00') {
      const fun = this.mapJobs(res?.data ?? {});
      // ✅ Update only allJobs key, preserve everything else in allFilters
      this.dropDownData = this.dropDownData.map((item: any) =>
        item.key === 'allJobs' ? { ...item, options: fun } : item
      );
    }
  }
   private mapForDepartment(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.departmentName,
      }))
    ];
  }
  private mapJobs(data:any){
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
    ];
  }
  private map(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.name,
        label: item.name,
      }))
    ];
  }
  private mapByIds(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
    ];
  }
  

  private async loadCountData(){
    try {
      const res: any = await this.interviewService.candidateMangementCount();
      if (res?.responsecode === '00') {
        const d = res.data;
        this.cards[0].value = d.allClearedCandidates ?? 0;
        this.cards[1].value = d.aiInterview ?? 0;
        this.cards[2].value = d.technicalRound ?? 0;
        this.cards[3].value = d.managerialRound ?? 0;
        this.cards[4].value = d.hrRound ?? 0;
      }
    } catch (err) {
      console.error('Failed to load candidate count', err);
    }
  }

  // ── List API  (POST /hms/interview-plan/progress-list) ────────────────────
  private async loadListData() {
    this.isLoading = true;
    try {
      const payload = {
        page: this.currentPage - 1,
        size: this.pageSize,
        sortBy: 'applicationId',
        direction: 'ASC',
        filters: {
          search: this.currentFilters.search || undefined,
          jobId: this.currentFilters.allJobs || undefined,
          departmentId: this.currentFilters.departments || undefined,
          currentStage: this.currentFilters.currentStage || undefined,
          dateFilter:this.currentFilters?.dateFilter ||undefined
        },
      };

      const res: any = await this.interviewService.candidateMangementList(payload);
      if (res?.responsecode === '00') {
        const pageData = res.data;
        this.totalItems = pageData.totalElements ?? 0;
        this.candidates = (pageData.content ?? []).map((item: CandidateApiItem) =>
          this.mapCandidate(item)
        );
      }
    } catch (err) {
      console.error('Failed to load candidate list', err);
    } finally {
      this.isLoading = false;
    }
  }

  // ── Map API item → display Candidate ─────────────────────────────────────
  private mapCandidate(item: CandidateApiItem): Candidate {
    const nameParts = (item.candidateName ?? '').trim().split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Determine stageStatus from roundDetails
    const inProgress = item.roundDetails?.some(r => r.status === 'IN_PROGRESS');
    const allDone = item.roundDetails?.every(r => r.status === 'COMPLETED');
    const stageStatus: 'Completed' | 'In Progress' =
      allDone ? 'Completed' : (inProgress ? 'In Progress' : 'In Progress');

    // Format lastActivity ISO string
    const { datePart, timePart } = this.formatDateTime(item.lastActivity);

    return {
      applicationId: item.applicationId,
      firstName,
      lastName,
      email: item.email,
      jobTitle: item.jobTitle,
      department: item.department,
      roundsCompleted: item.completedRounds,
      totalRounds: item.totalRounds,
      roundDetails: item.roundDetails ?? [],
      currentStage: item.currentStage,
      stageStatus,
      lastActivity: datePart,
      lastActivityTime: timePart,
    };
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadListData();
  }

  
  onFilterChange(payload: any): void {
    this.currentFilters = {
      search: payload?.chainName || undefined,
      allJobs: payload?.allJobs || undefined,
      departments: payload?.departments || undefined,
      currentStage: payload?.currentStage || undefined,
      dateFilter:payload?.dateFilter || ''

    };
    this.currentPage = 1;
    this.loadListData();
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  getInitials(candidate: Candidate): string {
    const f = candidate.firstName?.charAt(0) ?? '';
    const l = candidate.lastName?.charAt(0) ?? '';
    return (f + l).toUpperCase() || '?';
  }

  getAvatarBg(candidate: Candidate): string {
    const palette = [
      '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
      '#f97316', '#10b981', '#14b8a6', '#f59e0b',
    ];
    const seed =
      ((candidate.firstName?.charCodeAt(0) ?? 0) +
        (candidate.lastName?.charCodeAt(0) ?? 0)) % palette.length;
    return palette[seed];
  }

  /**
   * Build dot states from the API roundDetails array.
   * Falls back to the legacy completedRounds/totalRounds integers when
   * roundDetails is not available.
   */
  getRoundStates(candidate: Candidate): Array<'done' | 'active' | 'pending'> {
    if (candidate.roundDetails?.length) {
      return candidate.roundDetails
        .sort((a, b) => a.roundOrder - b.roundOrder)
        .map(r => {
          if (r.status === 'COMPLETED') return 'done';
          if (r.status === 'IN_PROGRESS') return 'active';
          return 'pending';
        });
    }
    // Fallback
    return Array.from({ length: candidate.totalRounds }, (_, i) => {
      if (i < candidate.roundsCompleted) return 'done';
      if (i === candidate.roundsCompleted && candidate.stageStatus === 'In Progress') return 'active';
      return 'pending';
    });
  }

  viewDetails(candidate: Candidate): void {
    this.router.navigate(
      ['/candidate-management/interview-pipe-line/view-ai-interview-details/' + candidate.applicationId],
      { state: { applicationId: candidate.applicationId } }
    );
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  private formatDateTime(iso: string): { datePart: string; timePart: string } {
    if (!iso) return { datePart: '—', timePart: '' };
    try {
      const d = new Date(iso);
      const datePart = d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
      return { datePart, timePart };
    } catch {
      return { datePart: iso, timePart: '' };
    }
  }
}