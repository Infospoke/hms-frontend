import { Component, inject, OnInit } from '@angular/core';

import { approvedSrs } from '../../../../shared/constants/reusbale-filter';
import { ApprovedSrsComponent } from '../../../demand/components/approved-srs-layout/approved-srs.component';
import { SupplyService } from '../../services/supply-service';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { StaffingServiceService } from '../../../demand/services/staffing-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-jobs-assignments',
  imports: [ApprovedSrsComponent,CommonModule],
  templateUrl: './my-jobs-assignments.component.html',
  styleUrl: './my-jobs-assignments.component.scss',
})
export class MyJobsAssignmentsComponent implements OnInit {

  heading: string = 'My Job Assignments';
  subHeading: string = 'Review and respond to job assignments allocated to you';
  searchPlaceholder = 'Search by Job Title..';
  activeTab = 'all';
  currentPage = 1;
  activeFilters: any = {};
  isLoading = false;

  private supplyService = inject(SupplyService);
  private approvalService = inject(ApprovalService);
  private staffingService = inject(StaffingServiceService)
  tabs = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'accepted', label: 'Accepted', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 },
    
  ];

  cards: any[] = [
    {
      id: 'totalAssignments',
      label: 'Total Assignments',
      subLabel: '',
      value: 0,
      iconClass: 'fa-regular fa-clipboard',
      iconBgColor: '#eaf2ff',
      iconColor: '#3b82f6',
    },
    {
      id: 'accepted',
      label: 'Accepted',
      subLabel: '',
      value: 0,
      iconClass: 'fa-solid fa-check',
      iconBgColor: '#e8f7ea',
      iconColor: '#22c55e',
    },
    {
      id: 'pending',
      label: 'Pending',
      subLabel: '',
      value: 0,
      iconClass: 'fa-regular fa-clock',
      iconBgColor: '#fff4e5',
      iconColor: '#f59e0b',
    },
    {
      id: 'declined',
      label: 'Rejected',
      subLabel: '',
      value: 0,
      iconClass: 'fa-solid fa-xmark',
      iconBgColor: '#ffe9e9',
      iconColor: '#ef4444',
    },
    {
      id: 'totalOpenings',
      label: 'Total Openings',
      subLabel: '',
      value: 0,
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#f4e8ff',
      iconColor: '#a855f7',
    },
  ];

  dropDownData: any = approvedSrs;
  data: any[] = [];
  totalElements = 0;
  pageSize = 10;
  private router=inject(Router);
  columns = [
    { key: 'jobTitleName', label: 'Job Title', width: '200px', custom: true },
    { key: 'departmentName', label: 'Department', width: '140px', custom: true },
    { key: 'requestbyName', label: 'Requested By', width: '140px', custom: true },
    { key: 'dateName', label: 'Requested On', width: '140px', custom: true },
    { key: 'openings', label: 'Openinigs', width: '80px', custom: true },
    { key: 'status',       label: 'Status',    width: '140px', custom: true },
    { key: 'actionName', label: 'Actions', width: '140px', custom: true },
  ];

  ngOnInit(): void {
    Promise.all([
      this.loadCounts(),
      this.loadList(),
      this.loadRequestedBy(),
      this.loadDepartments()
    ]);
  }

  // ─── Load summary counts (cards) ───────────────────────────────────────────
  private loadRequestedBy(): void {

    this.staffingService.getRequestedBy()
      .then((res: any) => {
        const d = res?.data ?? {};
        const fun = this.map(d);
        this.dropDownData = this.dropDownData.map((item: any) =>
          item.key === 'requestedBy'
            ? { ...item, options: fun ?? [] }
            : item
        );
      })
      .catch((error: any) => {
        console.log("error for a getting the requested By");
      })
  }
  private mapForDepartment(data: any) {
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
  private loadDepartments(): void {
    this.approvalService.departments().then
      ((res: any) => {
        const d = res?.data ?? {};
        const fun = this.mapForDepartment(d);
        this.dropDownData = this.dropDownData.map((item: any) =>
          item.key === 'department'
            ? { ...item, options: fun ?? [] }
            : item
        );
      }).catch((error: any) => {
        console.log(error, "while calling the departments");
      })
  }
  private loadCounts(): void {
    this.supplyService.myAssignedCounts()
      .then((res: any) => {
        if (res.responsecode === '00') {
          const data = res?.data;
          this.cards = this.cards.map(card => ({
            ...card,
            value: data[card.id] ?? 0,
          }));
        }
      })
      .catch((err: any) => {
        console.error('Failed to load assignment counts', err);
      });
  }



  private buildPayload(): object {
    const f = this.activeFilters;
    console.log(f);
    const filters: Record<string, string> = {};


    if (f?.chainName?.trim()) {
      filters['search'] = f.chainName.trim();
    }


    const dept = f?.['department'];
    if (dept) {
      filters['departmentId'] = dept;
    }

    const reqBy = f?.['requestedBy'];
    if (reqBy) {
      filters['requestedBy'] = reqBy;
    }


    const dateFilter = f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }

    

    return {
      page: this.currentPage - 1,   // API is 0-based
      size: this.pageSize,
      sortBy: 'createdAt',
      status: this.activeTab !== 'all' ? this.activeTab : '',
      direction: 'DESC',
      filters,
    };
  }

  // ─── Load the assignments list ─────────────────────────────────────────────

  private loadList(): void {
    this.isLoading = true;
    const payload = this.buildPayload();
    console.log(payload);
    this.supplyService.getAssginedList(payload)
      .then((res: any) => {
        if (res.responsecode === '00') {
          const responseData = res.data;

        
          this.data = (responseData.content ?? []).map((item: any) => ({
            srId: item.id,
            jobTitleName: item.jobTitle,
            departmentName: item.departmentName,
            requestbyName: item.requestedBy,
            dateName: item.createdAt,
            openings: item.openings,
            status: item.status ==='PENDING'?'Pending':item.status,
          
            _raw: item,
          }));

          this.totalElements = responseData.totalElements ?? 0;

          // Sync tab counts from the counts object returned per-page
          if (responseData.counts) {
            this.updateTabCounts(responseData.counts);
          }
        } else {
          this.data = [];
          this.totalElements = 0;
        }
      })
      .catch((err: any) => {
        console.error('Failed to load assignments list', err);
        this.data = [];
        this.totalElements = 0;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  // ─── Sync tab badge counts from API response ───────────────────────────────

  private updateTabCounts(counts: { all: number; pending: number; accepted: number; declined: number }): void {
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      count: counts[tab.key as keyof typeof counts] ?? tab.count,
    }));
  }

 
  filtersResponse(event: any): void {
    this.activeFilters = event;
    console.log(event)
    this.currentPage = 1;
    this.loadList();
  }

  onTabChange(key: string): void {
    this.activeTab = key;
    this.currentPage = 1;
    this.loadList();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();
  }
  handleView($event:any){
    console.log($event?._raw?.id);
    this.router.navigateByUrl(`/supply/my-assignend-jobs/job-details/${$event?._raw?.id}`)
  }

  
}