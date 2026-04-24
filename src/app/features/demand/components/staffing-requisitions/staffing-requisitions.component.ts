import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';



import { StaffingServiceService } from '../../services/staffing-service.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

export interface StaffingRequisition {
  id: string;         
  title: string;       
  meta: string;         
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}


interface SrListItem {
  createdDate: string;
  jobTitle: string;
  srId: string | null;
  status: string;      
}

interface SrListResponse {
  data: {
    totalPages: number;
    currentPage: number;
    totalElements: number;
    content: SrListItem[];
  };
  message: string;
  responsecode: string;
}

@Component({
  selector: 'app-staffing-requisitions',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './staffing-requisitions.component.html',
  styleUrl: './staffing-requisitions.component.scss',
})
export class StaffingRequisitionsComponent implements OnInit {

  requisitions: StaffingRequisition[] = [];
  draftSR: StaffingRequisition | null = null;
  private demandService=inject(StaffingServiceService);
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;


  isLoading = false;
  errorMessage: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadPage(1);
  }


  async loadPage(page: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    let obj={
      page:page-1, 
      size:this.pageSize
    }
    try {
      const response = await this.demandService.getAllSRS(obj) as SrListResponse;

      if (response?.responsecode === '00' && response.data) {
        const { content, totalPages, currentPage, totalElements } = response.data;

        this.totalPages = totalPages;
        
        this.totalElements = totalElements;

        this.requisitions = content.map(item => this.mapToRequisition(item));
        this.draftSR = this.requisitions.find(r => r.status === 'Draft') ?? null;
      } else {
        this.errorMessage = response?.message ?? 'Failed to load requisitions.';
      }
    } catch (err) {
      console.error('Error loading SR list:', err);
      this.errorMessage = 'An error occurred while fetching requisitions.';
    } finally {
      this.isLoading = false;
    }
  }

 


  private mapToRequisition(item: SrListItem): StaffingRequisition {
    const statusMap: Record<string, StaffingRequisition['status']> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };

    return {
      id: item.srId ?? 'Draft – Pending ID',
      title: item.jobTitle,
      meta: `Created ${item.createdDate}`,
      status: statusMap[item.status?.toUpperCase()] ?? 'Draft',
    };
  }


  onPageChange(page: number): void {
    this.currentPage=page
    this.loadPage(page);
  }


  newSR(): void {
    this.router.navigateByUrl('/demand/create?step=0');
  }

  resumeSR(sr: StaffingRequisition): void {
    this.router.navigate(['/demand/create?step=0', {queryParams:{id:sr?.id,type:'edit'}}]);
  }

  viewSR(sr: StaffingRequisition): void {
    this.router.navigate(['/demand/create?step=0', {queryParams:{id:sr?.id,type:'view'}}]);
  }

  editSR(sr: StaffingRequisition): void {
    this.router.navigate(['/demand/create?step=0', {queryParams:{id:sr?.id,type:'edit'}}]);
  }


  badgeClass(status: string): string {
    const map: Record<string, string> = {
      draft: 'badge-draft',
      submitted: 'badge-submitted',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    return map[status?.toLowerCase()] ?? '';
  }

  showActions(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }

  canEdit(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }
}