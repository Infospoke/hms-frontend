import { Component, inject, OnInit } from '@angular/core';
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { interviewPriority } from '../../../../shared/constants/reusbale-filter';
import { InterviewServiceService } from '../../service/interview-service.service';
import { AssignedInterviewRequestsTableComponent } from "../assigned-interview-requests-table/assigned-interview-requests-table.component";

@Component({
  selector: 'app-interview-assignments-list-progress',
  imports: [ApprovalLayoutComponent, AssignedInterviewRequestsTableComponent],
  templateUrl: './interview-assignments-list-progress.component.html',
  styleUrl: './interview-assignments-list-progress.component.scss',
})
export class InterviewAssignmentsListProgressComponent implements OnInit {

  interviewPriority = interviewPriority;
  cards = [
    {
      label: 'Total Assignments',
      value: 0,
      percentage: '',
      iconClass: 'fa-solid fa-file-circle-check',
      iconBgColor: '#eef2ff',
      iconColor: '#4f46e5',
      description: 'Total interview assignments created',
    },
    {
      label: 'Accepted',
      value: 0,
      percentage: '',
      iconClass: 'fa-solid fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#16a34a',
      description: 'Assignments accepted by candidates',
    },
    {
      label: 'Pending',
      value: 0,
      percentage: '',
      iconClass: 'fa-solid fa-hourglass-half',
      iconBgColor: '#fffbeb',
      iconColor: '#f59e0b',
      description: 'Assignments awaiting candidate response',
    },
    {
      label: 'Rejected',
      value: 0,
      percentage: '',
      iconClass: 'fa-solid fa-circle-xmark',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
      description: 'Assignments rejected by candidates',
    },
  ];
   private lastFilterPayload: any = {
    filters: {
      priority: '',
      dateFilter: ''
    }
  };
  currentPage = 1;
  pageSize = 10;
  private interviewService = inject(InterviewServiceService);
  tablePayload: object = this.buildRequestBody();
  ngOnInit(): void {
    Promise.all([this.loadCounts()])
  }

  private async loadCounts() {
    const res: any = await this.interviewService.getAssignedInterviewCount();
    if (res?.responsecode === '00') {
      this.cards[0].value = res?.data?.totalAssignments || 0;
      this.cards[1].value = res?.data?.acceptedCount || 0;
      this.cards[2].value = res?.data?.pendingCount || 0;
      this.cards[3].value = res?.data?.rejectedCount || 0;
    }
  }





  onPageChange(page: number): void {
    this.currentPage = page;
    this.tablePayload = this.buildRequestBody();
  }
  onFilterChange(data:any){
    this.lastFilterPayload = data;
    this.tablePayload = this.buildRequestBody();
  }
  // ── Payload builder ───────────────────────────────────────────────────────
  private buildRequestBody(): object {
    const f = this.lastFilterPayload;
    const filters: Record<string, string> = {};

    // Search (top-level)
    if (f?.search?.trim()) {
      filters['search'] = f.search.trim();
    }
    console.log(f);
    
    const nested = f?.filters ?? {};


    if (nested['priority'] || f['priority']) {
      filters['priority'] = nested['priority'] || f['priority'];
    }

    // Date filter
    const dateFilter = nested['dateFilter'] || f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f?.['fromDate']) filters['fromDate'] = nested['fromDate'] || f?.['fromDate'];
      if (f?.['toDate']) filters['toDate'] = nested['toDate'] || f?.['toDate'];
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      direction: 'DESC',
      filters,
    };
  }
}
