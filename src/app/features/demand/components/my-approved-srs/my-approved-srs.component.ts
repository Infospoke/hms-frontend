import { Component, inject, OnInit } from '@angular/core';
import { approvedSrs } from '../../../../shared/constants/reusbale-filter';
import { ApprovedSrsComponent } from "../approved-srs-layout/approved-srs.component";
import { StaffingServiceService } from '../../services/staffing-service.service';
import { ApprovalService } from '../../../approvals/services/approval-service';

@Component({
  selector: 'app-my-approved-srs',
  imports: [ApprovedSrsComponent],
  templateUrl: './my-approved-srs.component.html',
  styleUrl: './my-approved-srs.component.scss',
})
export class MyApprovedSrsComponent implements OnInit{

  heading: string = 'All Approved Service Requests';
  subheading: string = 'Create jobs from approved service requests';
  dropDownData = approvedSrs;
  private staffingService=inject(StaffingServiceService);
  private approvalService=inject(ApprovalService);
  currentPage = 1;
  activeFilters: any={ chainName: '', filters: {},dateFilter: 'thisMonth' };
  searchPlaceholder = 'Search by SR Id, Title..';

  columns = [
    { key: 'srId',       label: 'SR ID',         width: '160px', custom: true },
    { key: 'jobTitle',   label: 'SR Title',       width: '200px', custom: true },
    { key: 'department', label: 'Department',     width: '140px', custom: true },
    { key: 'requestby',  label: 'Requested By',   width: '140px', custom: true },
    { key: 'date',       label: 'Date Range',     width: '140px', custom: true },
    { key: 'action',     label: 'Job Actions',        width: '140px', custom: true ,align:"center"},
  ];

 

  data: any[] = [];
  totalElements: number = 0;
  pageSize = 10;
  activeTab:string='all';
  lastFilterPayload:any={};
  ngOnInit(): void {
    Promise.all([this.loadDepartments(),this.loadRequestedBy(),this.loadList()])
  }
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
  filtersResponse(event: any): void {

    this.activeFilters = event;
    this.currentPage = 1;
    this.loadList();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();
  }

  private loadList():void{
     const body = this.buildRequestBody();
     this.staffingService.getAllApprovedSRS(body)
     .then((res:any)=>{
        if(res?.data){
          const data=res?.data;
         
          this.data=(data?.approvedServiceRequests ?? [] )?.map((item:any)=>({
            srId:item?.srId,
            jobTitle:item?.srTitle,
            department:item?.department,
            requestby:item?.requestedBy,
            date:item?.dateRange,
            dateLabel:item?.dateRange,
            timeLabel:item?.dateRange,
          }));
           this.totalElements = data.totalElements ?? 0;
        }
     })
     .catch((error:any)=>{
      console.log('error',error);
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


  private buildRequestBody(): object {
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

    // ── Dropdown: requestedBy → requestedBy ─────────────────────────────────
    const reqBy = f?.['requestedBy'];
    if (reqBy) {
      filters['requestedBy'] = reqBy;
    }


    const dateFilter = f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      // const { from, to } = this.resolveDatePreset(dateFilter);
      // if (from) filters['fromDate'] = from;
      // if (to) filters['toDate'] = to;
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }

    // ── Active tab → status filter ──────────────────────────────────────────
    // if (this.activeTab && this.activeTab !== 'all') {
    //   filters['status'] = this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1);
    // }

    return {
      page: this.currentPage - 1,   // API is 0-based
      size: this.pageSize,
      sortBy: 'createdOn',
      status:this.activeTab !== 'all'? this.activeTab : '',
      direction: 'DESC',
      filters,
    };
  }
}