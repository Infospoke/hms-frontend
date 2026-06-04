import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from '../../../../shared/constants/time-pipe';
import { CanDirective } from '../../../../shared/directives/can.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approved-srs-layout',
  imports: [ApprovalLayoutComponent, ReusableTableComponent, CommonModule, DateFormatPipe, CanDirective],
  templateUrl: './approved-srs.component.html',
  styleUrl: './approved-srs.component.scss',
})
export class ApprovedSrsComponent {
  private router=inject(Router);
  @Input() heading: string = '';
  @Input() subheading: string = '';
  @Input() dropDownData: any[] = [];
  @Input() searchPlaceholder: string = '';
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalElements: number = 0;
  @Input() url:string='';
  @Input() cards: any[] = [];
  @Input() tabs: { key: string; label: string; count: number }[] = [];
  @Input() activeTab: string = '';
  @Input() typeOfPermission:string='';
  @Output() filtersChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() createJob = new EventEmitter<any>();

  @Output() viewJob=new EventEmitter<any>();
  filtersResponse(filters: any): void {
    this.filtersChange.emit(filters);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onTabChange(key: string): void {
    this.activeTab = key;
    this.tabChange.emit(key);
  }

  onCreateJob(row: any): void {
    this.createJob.emit(row);
  }


   initials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0]?.toUpperCase() ?? '')
      .join('');
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':  return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-declined';
      default:         return 'status-pending';
    }
  }
  avatarColor(name: string): string {
    const palette = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
    if (!name) return palette[0];
    const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % palette.length;
    return palette[idx];
  }
   onViewDetails(row: any): void {
    this.viewJob.emit(row);
   }


   formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return iso.split('T')[0];
    }
  }
 
   formatTime(iso: string): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch {
      return '';
    }
  }

  truncate(value: string, limit = 10): string {
    if (!value || value === '—') return value;
    return value.length > limit ? value.slice(0, limit) + '..' : value;
  }
}
