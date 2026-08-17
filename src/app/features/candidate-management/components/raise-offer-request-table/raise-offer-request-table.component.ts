import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";
 
@Component({
  selector: 'app-raise-offer-request-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './raise-offer-request-table.component.html',
  styleUrl: './raise-offer-request-table.component.scss',
})
export class RaiseOfferRequestTableComponent {

  @Input() heading?:any;
  @Input() subHeading?:any;
  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() data: any[] = [];
  @Input() permissionName:any='';
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 4;
  @Input() showPagination: boolean = true;
  @Input() actionLabel: string = 'Raise offer request';
  @Input() emptyMessage: string = 'No candidates found.';
 
  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() actionClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();
 
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '100px' },
    { key: 'jobTitle', label: 'Job title' ,width: '100px'},
    { key: 'department', label: 'Department',width: '140px' },
    { key: 'movedToHireOn', label: 'Moved to hire on', custom: true,width: '90px' },
    { key: 'recruiter', label: 'Recruiter', custom: true,width: '90px' },
    { key: 'priority', label: 'Priority', custom: true, align: 'left',width: '90px' },
    { key: 'actions', label: 'Actions', custom: true ,width: '120px'},
  ];
 
  sortableColumns: string[] = ['movedToHireOn'];
 
  onAction(row: any): void {
    this.actionClick.emit(row);
  }
 
  onPageChange(page: any): void {
    this.pageChange.emit(page);
  }
 
  
}
