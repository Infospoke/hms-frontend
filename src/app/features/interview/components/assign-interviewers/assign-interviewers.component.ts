import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { assignRecruters } from '../../../../shared/constants/reusbale-filter';
import { Router } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CanDirective } from '../../../../shared/directives/can.directive';

export interface RoundStatus {
  status: 'Accepted' | 'Rejected' | 'Pending' | 'Not Sent' | null;
}



@Component({
  selector: 'app-assign-interviewers',
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent,CanDirective],
  templateUrl: './assign-interviewers.component.html',
  styleUrl: './assign-interviewers.component.scss',
})
export class AssignInterviewersComponent implements OnInit {

  assignRecruters = assignRecruters;
  private interviewService = inject(InterviewServiceService);
  private approvalService = inject(ApprovalService);
  private notificationSerivce = inject(NotificationService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID)
  columns: TableColumn[] = [
    { key: 'jobTitle', label: 'Job Title', width: '180px', custom: true },
    { key: 'deptName', label: 'Department', width: '110px' },
    { key: 'planName', label: 'Plan Name', width: '110px' },
    { key: 'r1', label: 'R1', align: 'center', width: '90px', custom: true, group: 'Interviewer Assignment Status' },
    { key: 'r2', label: 'R2', align: 'center', width: '90px', custom: true, group: 'Interviewer Assignment Status' },
    { key: 'r3', label: 'R3', align: 'center', width: '90px', custom: true, group: 'Interviewer Assignment Status' },
    { key: 'r4', label: 'R4', align: 'center', width: '90px', custom: true, group: 'Interviewer Assignment Status' },

    { key: 'action', label: 'Action', align: 'center', width: '140px', custom: true },
  ];

  tableData: any[] = [];
  private activeFilters: Partial<any> = { dateFilter: '' };
  currentPage: any = 1;
  pageSize: any = 10;
  totalItems:any;
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Promise.all([this.loadDepartments(), this.loadPlans(), this.loadData()]);
      localStorage.removeItem("details");
      localStorage.removeItem('jobAssigned')
    }
    
  }
  private loadData() {
    const payload = this.buildPayload();
    this.interviewService.getInterviewAssignedList(payload)
      .then((res: any) => {
        if (res?.responsecode == '00') {
          this.tableData = res?.data?.content;
          this.totalItems=res?.data?.totalElements;
        }
        else {
          this.notificationSerivce.error(res?.message || res?.responsemessage)
        }
      })
      .catch((error: any) => {
        console.log(error);
      })
  }
  private loadDepartments() {
    const payload={
      "srDepartments": true,
    }
    this.approvalService.getDepartmentsByType(payload)
      .then((res: any) => {
        if (res?.responsecode == '00') {
          const data = this.mapForDepartment(res?.data);
          this.assignRecruters = this.assignRecruters.map((item: any) =>
            item.key === 'department'
              ? { ...item, options: data ?? [] }
              : item
          );
        }
        else {
          this.notificationSerivce.error(res?.message || res?.responsemessage)
        }

      })
      .catch((error: any) => {
        console.log(error);
      })
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
  private loadPlans() {
    this.interviewService.getPlansList()
      .then((res: any) => {
        const data = this.map(res?.data);
        this.assignRecruters = this.assignRecruters.map((item: any) =>
          item.key === 'plan'
            ? { ...item, options: data ?? [] }
            : item
        );
      })
      .catch((error: any) => {
        console.log(error);
      })
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
  filterChange(data: any): void {
    this.activeFilters = data;
    this.loadData();
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'ai-rs ai-rs--accepted';
      case 'Accepted':
        return 'ai-rs ai-rs--accepted';
      case 'PENDING':
        return 'ai-rs ai-rs--pending';
       case 'Pending':
        return 'ai-rs ai-rs--pending';

      case 'REJECTED':
        return 'ai-rs ai-rs--rejected';

      case 'Rejected':
        return 'ai-rs ai-rs--rejected';
      case 'NOT_SENT':
        return 'ai-rs ai-rs--not-sent';

      default:
        return 'ai-rs';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'fa-solid fa-circle-check';
       case 'Accepted':
        return 'fa-solid fa-circle-check';

      case 'PENDING':
        return 'fa-solid fa-clock';
       case 'Pending':
        return 'fa-solid fa-clock';
      case 'REJECTED':
        return 'fa-solid fa-circle-xmark';
      case 'Rejected':
        return 'fa-solid fa-circle-xmark';
      case 'NOT_SENT':
        return 'fa-solid fa-paper-plane';

      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Accepted';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      case 'NOT_SENT':
        return 'Not Sent';
      default:
        return status;
    }
  }

  onViewResponses(row: any): void {
    const allNotSent = row.assignmentStatus.every(
      (item: any) => item.status === 'NOT_SENT'
    );
    console.log(row);
    if (allNotSent) {
      localStorage.setItem("details", JSON.stringify(row));
      this.router.navigate(['/demand/assign-interviewers/new-assign'], { state: { type: 'assign' } });

    } else {
      localStorage.setItem("jobAssigned", JSON.stringify(row));
      this.router.navigate(
        ['/demand/assign-interviewers/view'],
        { state: { id: row.jobId } }
      );
    }
  }

  onMoreActions(row: any): void {
    console.log('More actions:', row);
  }

  private buildPayload(): object {

    const f: any = this.activeFilters || {};
    const filters: any = {

    };

    // direct filters
    if (f.chainName?.trim()) {
      filters['search'] = f.chainName.trim();
    }

    if (f.status) {
      filters['functionalityName'] = f.status;
    }
    if (f.department) {
      filters['deptName'] = f.department
    }

    if (f.plan) {
      filters['planName'] = f.plan
    }

    if (f.approval) {
      filters['approval'] = f.approval;
    }

    if (f.dateFilter) {
      filters['dateFilter'] = f.dateFilter;
    }

    if (f.dateFilter === 'CUSTOM') {

      if (f.fromDate) {
        filters['fromDate'] = f.fromDate;
      }

      if (f.toDate) {
        filters['toDate'] = f.toDate;
      }
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: 'createdAt',
      direction: 'desc',
      filters,
    };
  }

  pageChange(data:any){
    this.currentPage=data;
    this.loadData();
  }
}