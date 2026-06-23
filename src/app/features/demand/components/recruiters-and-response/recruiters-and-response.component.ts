import { Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { StaffingServiceService } from '../../services/staffing-service.service';
import { ActivatedRoute, Router } from '@angular/router';

export interface RecruiterRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedDate: string;
  assignedTime: string;
  status: 'Accepted' | 'Declined' | 'Pending';
  respondedDate: string;
  respondedTime: string;
  comments: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-recruiters-and-response',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent],
  templateUrl: './recruiters-and-response.component.html',
  styleUrl: './recruiters-and-response.component.scss',
})
export class RecruitersAndResponseComponent implements OnInit, OnChanges {

  private staffingService = inject(StaffingServiceService);


  cards = [
    { id: 'totalAssigned', label: 'Total Assigned', subLabel: 'Recruiters', value: 0, iconClass: 'fa-solid fa-user-check', iconBgColor: '#eaf2ff', iconColor: '#3b82f6' },
    { id: 'acceptedCount', label: 'Accepted', subLabel: 'Recruiters', value: 0, iconClass: 'fa-regular fa-circle-check', iconBgColor: '#ecfdf5', iconColor: '#22c55e' },
    { id: 'pendingCount', label: 'Pending', subLabel: 'Recruiters', value: 0, iconClass: 'fa-regular fa-clock', iconBgColor: '#fff7ed', iconColor: '#f59e0b' },
    { id: 'declinedCount', label: 'Declined', subLabel: 'Recruiters', value: 0, iconClass: 'fa-regular fa-circle-xmark', iconBgColor: '#fef2f2', iconColor: '#ef4444' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'recruiter', label: 'Recruiter', custom: true, width: '200px' },
    { key: 'role', label: 'Role', width: '150px' },
    { key: 'assignedOn', label: 'Assigned On', custom: true, width: '140px' },
    { key: 'status', label: 'Status', custom: true, width: '130px', align: 'center' },
    { key: 'respondedOn', label: 'Responded On', custom: true, width: '140px' },
    { key: 'comments', label: 'Comments', custom: true },
  ];
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  filteredData: RecruiterRecord[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  id: any;
  srId:any;
  ngOnInit(): void {
    
    this.route.params.subscribe((params: any) => {
      this.id = params['id'];
      this.srId=params['srId'];
      Promise.all([this.loadItems(), this.loadCount()]);
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      Promise.all([this.loadItems(), this.loadCount()])
    }
  }
  private loadCount(): void {
    if (!this.id) return;
    this.staffingService.getCount(this.id)
      .then((res: any) => {
        if (res?.responsecode !== '00') return;

        const data = res.data;


        this.cards = this.cards.map(card => ({
          ...card,
          value: data[card.id] ?? 0,
        }));
      })
      .catch((error: any) => {

      })
  }
  private loadItems(): void {
    if (!this.id) return;
    this.isLoading = true;
    let obj = {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: 'jobId',
      direction: 'ASC',
    }
    this.staffingService.getAssignmentListById(this.id, obj)
      .then((res: any) => {
        if (res?.responsecode !== '00') return;

        const data = res.data;

        this.filteredData = (data?.content ?? []).map((r: any): RecruiterRecord => {
          const assigned = this.splitDateTime(r.assignedOn);
          const responded = this.splitDateTime(r.respondedOn);

          return {
            id: String(r.id),
            name: r.recruiterName ?? '—',
            email: r.email ?? '—',
            role: r.role ?? '—',
            assignedDate: assigned.date,
            assignedTime: assigned.time,
            // Normalise API values (ACCEPTED → Accepted) to match the union type
            status: this.normaliseStatus(r.status),
            respondedDate: responded.date,
            respondedTime: responded.time,
            comments: r.comments ?? '',
          };
        });

        this.totalItems = data?.totalElements;
      })
      .catch((err: any) => console.error('loadItems error', err))
      .finally(() => (this.isLoading = false));
  }


  private splitDateTime(iso: string | null | undefined): { date: string; time: string } {
    if (!iso) return { date: '—', time: '—' };
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { date: iso, time: '—' };

    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  }


  private normaliseStatus(raw: string): RecruiterRecord['status'] {
    const map: Record<string, RecruiterRecord['status']> = {
      ACCEPTED: 'Accepted',
      PENDING: 'Pending',
      DECLINED: 'Declined',
    };
    return map[raw?.toUpperCase()] ?? 'Pending';
  }


  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadItems();
  }

  addAssignees(): void {
    // localStorage.setItem('alreadyAssgined',this.filteredData)
    this.router.navigateByUrl(`/demand/recruiter-assignment-management/recruiter-assignment/${this.id}/${this.srId}`)
  }
}