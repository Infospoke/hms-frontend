import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonTableActionsComponent } from '../../../../shared/components/common-table-actions/common-table-actions.component';
import { interview } from '../../../../shared/constants/reusbale-filter';
import { Router } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';

export interface InterviewPlan {
  id: number;
  planName: string;
  description: string;
  rounds: number;
  status: 'Active' | 'Inactive' | 'In_Progress';
  createdBy: string;
  createdOn: string;
}

@Component({
  selector: 'app-interview-plans',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent, CommonTableActionsComponent],
  templateUrl: './interview-plans.component.html',
  styleUrl: './interview-plans.component.scss',
})
export class InterviewPlansComponent implements OnInit {

  private router = inject(Router);
  private interviewService = inject(InterviewServiceService);

  private activeFilters: Record<string, string> = {dateFilter: "thisWeek"};

  // ── Cards ───────────────────────────────────────────────────────────────────
  cards = [
    {
      label: 'All Interview Plans',
      subLabel: 'Total plans',
      value: 0,
      percentage: 'Total plans',
      iconClass: 'fa-regular fa-clipboard',
      iconBgColor: '#eaf2ff',
      iconColor: '#2563eb'
    },
    {
      label: 'Active Plans',
      subLabel: 'Plans available for use',
      value: 0,
      percentage: 'Plans available for use',
      iconClass: 'fa-regular fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#22c55e'
    },
    {
      label: 'Deactive Plans',
      subLabel: 'Plans not available',
      value: 0,
      percentage: 'Plans not available',
      iconClass: 'fa-regular fa-circle-pause',
      iconBgColor: '#fff7ed',
      iconColor: '#f59e0b'
    },
   
  ];


  tabs: { key: string; label: string; count: number }[] = [
    { key: 'all',         label: 'All Plans',         count: 0 },
    { key: 'Active',      label: 'Active Plans',      count: 0 },
    { key: 'Inactive',    label: 'Deactive Plans',    count: 0 },
   
  ];

  activeTab = 'all';

  // ── Table config ────────────────────────────────────────────────────────────
  columns: TableColumn[] = [
    { key: 'planName',    label: 'Plan Name',   width: '180px', custom: true },
    { key: 'description', label: 'Description', width: '220px', custom: true },
    { key: 'rounds',      label: 'Rounds',      width: '50px',  align: 'center' },
    { key: 'status',      label: 'Status',      width: '110px', align: 'center', custom: true },
    { key: 'approvalStatus',label: 'Approval Status',      width: '110px', align: 'center', custom: true },
    { key: 'createdBy',   label: 'Created By',  width: '100px' },
    { key: 'createdOn',   label: 'Created On',  width: '80px' ,custom: true},
    { key: 'actions',     label: 'Actions',     width: '90px',  align: 'center', custom: true },
  ];

  allPlans: InterviewPlan[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  dropDownData = interview;

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    Promise.all([this.loadCounts(),this.loadPlans(),this.createdByList()])
  }
  private async createdByList():Promise<void>{
    try{
      const res:any=await this.interviewService.createdByList();
      console.log(res);
      if(res?.responsecode=='00'){
        const fun = this.map(res?.data);
         this.dropDownData = this.dropDownData.map((item: any) =>
          item.key === 'createdby'
            ? { ...item, options: fun ?? [] }
            : item
        );
      }
    }
    catch(error){

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
  private async loadCounts(): Promise<void> {
    try {
      const res = await this.interviewService.plansCount();
      if (res?.responsecode === '00') {
        const { allPlans, activePlans, inactivePlans, inProgressPlans } = res.data;
        console.log(res?.data);
        // Update cards
        this.cards = [
          { ...this.cards[0], value: allPlans ?? 0 },
          { ...this.cards[1], value: activePlans ?? 0 },
          { ...this.cards[2], value: inactivePlans ?? 0 },
         
        ];

       
      }
    } catch (error) {
      console.error('Failed to load interview plan counts:', error);
    }
  }
  // ── API: list (counts also come from this response) ─────────────────────────
  private async loadPlans(): Promise<void> {
    this.isLoading = true;
    try {
      const payload = this.buildRequestPayload();
      const res = await this.interviewService.plansList(payload);

      if (res?.responsecode === '00') {
        const { interviewPlans, totalElements, counts } = res.data;

        // ── Table data ──────────────────────────────────────────────────────
        this.allPlans   = interviewPlans ?? [];
        this.totalItems = totalElements  ?? 0;

        // ── Cards & tabs from counts returned by the list API ───────────────
        if (counts) {
          const { allPlans, activePlans, deactivePlans, inProgressPlans } = counts;

          
          this.tabs = [
            { ...this.tabs[0], count: allPlans        ?? 0 },
            { ...this.tabs[1], count: activePlans     ?? 0 },
            { ...this.tabs[2], count: deactivePlans   ?? 0 },
           
          ];
        }
      }
    } catch (error) {
      console.error('Failed to load interview plans:', error);
      this.allPlans   = [];
      this.totalItems = 0;
    } finally {
      this.isLoading = false;
    }
  }


  private buildRequestPayload(): object {
    const filters: Record<string, string> = {};
    console.log(this.activeFilters);

    const search = this.activeFilters?.['chainName']?.trim();
    if (search) {
      filters['search'] = search;
    }

    // ── Status from active tab (goes inside filters) ─────────────────────────
    if (this.activeTab !== 'all') {
      filters['status'] = this.activeTab; // keys are already 'Active' | 'Inactive' | 'In_Progress'
    }

     if (this.activeFilters?.['createdBy']) {
      filters['createdBy'] = this.activeFilters?.['createdBy']; // keys are already 'Active' | 'Inactive' | 'In_Progress'
    }
    // ── Date filter ──────────────────────────────────────────────────────────
    const dateFilter = this.activeFilters?.['dateFilter'];
    if (dateFilter) {
      filters['dateFilter'] = dateFilter;
      if (dateFilter === 'CUSTOM') {
        if (this.activeFilters['fromDate']) filters['fromDate'] = this.activeFilters['fromDate'];
        if (this.activeFilters['toDate'])   filters['toDate']   = this.activeFilters['toDate'];
      }
    }

    
    
    console.log(filters);
    return {
      page:      this.currentPage - 1, // API is 0-based
      size:      this.pageSize,
      sortBy:    'createdOn',
      direction: 'DESC',
      filters,
    };
  }

  // ── Event handlers ──────────────────────────────────────────────────────────
  handleCreateNewPlan(): void {
    this.router.navigateByUrl('/interview/interview-plan/create');
  }

  handleTabChange(tab: string): void {
    this.activeTab   = tab;
    this.currentPage = 1;
    this.loadPlans();
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadPlans();
  }

  handleView(row: any): void {
    this.router.navigateByUrl(`/interview/interview-plan/view/${row.id}`);
  }

  handleEdit(row: any): void {
    this.router.navigateByUrl(`/interview/interview-plan/create`,{
      state: { id:row?.id }
    });
  }

  filtersChange(data: any): void {
    this.activeFilters = data ?? {};
    console.log(data)
    this.currentPage   = 1;
    this.loadPlans();
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