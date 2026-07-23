import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { candidateManagementFilter } from '../../../../shared/constants/reusbale-filter';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { ApprovalService } from '../../services/approval-service';
import { InterviewServiceService } from '../../../interview/service/interview-service.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

type Priority = 'High' | 'Medium' | 'Low';

interface OfferRequestRow {
  initials: string;
  avatarColor: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  priority: Priority;
  requestedOnDate: string;
  requestedOnTime: string;
  offerType: string;
  requestedByName: string;
  requestedByRole: string;
  offerId:any;
}

@Component({
  selector: 'app-approve-offer-requests',
  standalone: true,
  imports: [CommonModule, HeadingComponent, CommonFilterComponent, ReusableTableComponent],
  templateUrl: './approve-offer-requests.component.html',
  styleUrl: './approve-offer-requests.component.scss',
})
export class ApproveOfferRequestsComponent implements OnInit{
  dropDownData = candidateManagementFilter;
  private authService=inject(AuthService);
  private router=inject(Router);
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '22%' },
    { key: 'jobTitle', label: 'Job Title', width: '13%' },
    { key: 'department', label: 'Department', width: '12%' },
    { key: 'priority', label: 'Priority', custom: true, width: '9%' },
    { key: 'requestedOn', label: 'Requested On', custom: true, sortable: true, width: '13%' },
    { key: 'offerType', label: 'Offer Type', width: '9%' },
    { key: 'requestedBy', label: 'Requested By', custom: true, width: '13%' },
    { key: 'action', label: 'Action', custom: true, align: 'center', width: '9%' },
  ];

  sortableColumns: string[] = ['requestedOn'];

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;


  requests: OfferRequestRow[] = [];
  private approvalService=inject(ApprovalService);
  private interviewService=inject(InterviewServiceService);
  private activeFilters:any={};
  ngOnInit(): void {
    Promise.all([this.loadDepartments(),this.loadJobs(),this.loadOfferList()])
  }
  private async loadOfferList(){
    const payload=this.buildPayload();;
    const res:any=await this.approvalService.approveOfferList(payload);
    if(res?.responsecode=='00'){
      this.requests=this.mapResponseData(res?.data?.pendingApprovals);
    }
  }
  private mapResponseData(data:any){
    return data?.map((item:any)=>({
      initials: this.getAvatarInitials(item?.applicantName),
      avatarColor: this.getAvatarColor(item?.applicantName),
      candidateName: item?.applicantName,
      applicationId:item?.applicationId,
      candidateEmail: item?.applicantEmail,
      jobTitle: item?.jobTitle,
      department: item?.department,
      priority: item?.priority,
      requestedOnDate:this.formatDate(item?.requestedOn),
      requestedOnTime: this.formatTime(item?.requestedOn),
      offerType: item?.employementType,
      requestedByName:item?.userName,
      requestedByRole: '',
      offerId:item?.offerId,
    }))
  }
   getAvatarInitials(name: string): string {
    if (!name) return '';

    return name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }
  getAvatarColor(name: string): string {
    const colors = [
      'purple',
      'green',
      'orange',
      'blue',
      'pink',
      'red',


    ];

    if (!name) return colors[0];

    const hash = name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  }
  private buildPayload(): object {

    const f = this.activeFilters || {};
    const filterData = f.filters || {};

    const filters: any = {};

    // Search
    if (f.search?.trim()) {
      filters.search = f.search.trim();
    }

    // Job Title
    if (filterData.allJobs) {
      filters.jobId = filterData.allJobs;
    }

    // Department
    if (filterData.departments) {
      filters.departmentId = filterData.departments;
    }

    // Priority
    if (filterData.priority) {
      filters.priority = filterData.priority;
    }

    // Date Filter
    if (filterData.dateFilter) {
      filters.dateFilter = filterData.dateFilter;
    }

    // Custom Date Range
    if (filterData.dateFilter === 'CUSTOM') {

      if (filterData.fromDate) {
        filters.fromDate = filterData.fromDate;
      }

      if (filterData.toDate) {
        filters.toDate = filterData.toDate;
      }
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: 'createdDate',
      direction: 'desc',
      filters
    };
  }
   formatDate(date: string | Date): string {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  formatTime(date: string | Date): string {
    if (!date) return '-';

    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  private async loadDepartments() {
    const res: any = await this.approvalService.departments();
    if (res?.responsecode == '00') {
      const data = this.map(res?.data);
      this.dropDownData = this.dropDownData.map((item: any) =>
        item.key === 'departments'
          ? { ...item, options: data ?? [] }
          : item
      );
    }
  }
  private async loadJobs() {
    const res: any = await this.interviewService.getAIInterviewZoneJobs();
    if (res?.responsecode == '00') {
      const fun = this.map(res?.data ?? {});
      // ✅ Update only allJobs key, preserve everything else in allFilters
      this.dropDownData = this.dropDownData.map((item: any) =>
        item.key === 'allJobs' ? { ...item, options: fun } : item
      );
    }
  }

  private map(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
    ];
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  priorityClass(priority: Priority): string {
    return 'priority-badge--' + priority.toLowerCase();
  }
  get roleName() { return this.authService.getRole(); }
  // ── Handlers ──────────────────────────────────────────────────────────────
  onReview(row: any): void {
    const isFinanceHead=this.roleName ==='HR Head'?true:false
    this.router.navigate([`/approval/approve-offer-requests/offer-management/view/${row?.applicationId}`],{
      state:{isUpload:isFinanceHead,mode:'approve',url:'/approval/approve-offer-requests'}
    })
  }

  onSortChange(_event: { col: string; dir: 'asc' | 'desc' }): void {
    // TODO: re-sort/re-fetch `requests` once sorting is wired to the API.
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // TODO: fetch the requests for the new page from the API.
  }
}
