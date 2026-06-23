import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { chainOptions } from '../../../../shared/constants/reusbale-filter';
import { InterviewServiceService } from '../../service/interview-service.service';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";

@Component({
  selector: 'app-interview-plain-aproval',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent, CanDirective],
  templateUrl: './interview-plain-aproval.component.html',
  styleUrl: './interview-plain-aproval.component.scss',
})
export class InterviewPlainAprovalComponent implements OnInit {
  private activeFilters: Record<string, string> = { dateFilter: "thisWeek" };
  private interviewService = inject(InterviewServiceService);
  columns: TableColumn[] = [
    { key: 'planName', label: 'Plan Name', width: '220px', custom: true },
    { key: 'rounds', label: 'Rounds', width: '80px', align: 'center' },

    { key: 'requestedBy', label: 'Requested By', width: '170px', custom: true },
    { key: 'requestedOn', label: 'Requested On', width: '170px', custom: true },
    { key: 'requestType', label: 'Request Type', width: '120px', custom: true },
    { key: 'status', label: 'Status', width: '120px', align: 'center', custom: true },
    { key: 'action', label: 'Action', width: '120px', align: 'center', custom: true },
  ];

  allPlans: any[] = [];
  totalPages = 0;
  pageSize = 10;
  currentPage = 1;
  chainOptions = chainOptions;

  private router = inject(Router);

  ngOnInit(): void {
    this.loadData();
  }
  private async loadData(): Promise<void> {
    const payload = this.buildRequestPayload();
    const res: any = await this.interviewService.plansListForApproval(payload);
    if (res?.responsecode == '00') {
      this.allPlans = res?.data?.content ?? [];
      this.totalPages = res?.data?.totalPages ?? 0;
    }
  }
  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  handleReviewApprove(plan: any): void {
    this.router.navigate(
      ['/approval/interview-approval-plans/review-and-approve', plan.id],
      {
        queryParams: { requestType: plan.requestType }
      }
    );
  }

  filtersResponse(event: any): void {
    this.activeFilters = event;
    this.currentPage = 1;
    this.loadData();
  }

  private buildRequestPayload(): object {
    const filters: Record<string, string> = {};
    console.log(this.activeFilters);

    const search = this.activeFilters?.['chainName']?.trim();
    if (search) {
      filters['search'] = search;
    }


    if (this.activeFilters?.['createdBy']) {
      filters['createdBy'] = this.activeFilters?.['createdBy'];
    }
    const dateFilter = this.activeFilters?.['dateFilter'];
    if (dateFilter) {
      filters['dateFilter'] = dateFilter;
      if (dateFilter === 'CUSTOM') {
        if (this.activeFilters['fromDate']) filters['fromDate'] = this.activeFilters['fromDate'];
        if (this.activeFilters['toDate']) filters['toDate'] = this.activeFilters['toDate'];
      }
    }



    console.log(filters);
    return {
      page: this.currentPage - 1, // API is 0-based
      size: this.pageSize,
      sortBy: 'createdOn',
      direction: 'DESC',
      filters,
    };
  }


  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}