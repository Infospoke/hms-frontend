import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CanDirective } from "../../../../shared/directives/can.directive";
 
@Component({
  selector: 'app-raise-offer-letter-ready-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './raise-offer-letter-ready-table.component.html',
  styleUrl: './raise-offer-letter-ready-table.component.scss',
})
export class RaiseOfferLetterReadyTableComponent implements OnChanges {

  @Input() heading?:any;
  @Input() subHeading?:any;
  @Input() tableType?:any;
  @Input() data: any[] = [];
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 3;
  @Input() showPagination: boolean = true;
  @Input() actionLabel: string = 'View';
  @Input() emptyMessage: string = 'No offer letters found.';
 
  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() actionClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageChange = new EventEmitter<number>();
  @Input() permissionName:any='';
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();
  private candidateService=inject(CandidateServiceComponent);
  private notificationService=inject(NotificationService);
  columns: TableColumn[] = [
    { key: 'select', label: '', custom: true, width: '40px' },
    { key: 'candidate', label: 'Candidate', custom: true, width: '170px' },
    { key: 'jobTitle', label: 'Job title', width: '100px' },
    { key: 'department', label: 'Department', width: '100px' },
    { key: 'package', label: 'Package', width: '140px' },
    { key: 'approvedOn', label: 'Approved on', custom: true, width: '130px' },
    { key: 'recruiter', label: 'Recruiter', custom: true, width: '110px' },
    { key: 'priority', label: 'Priority', custom: true, width: '90px' },
    { key: 'actions', label: 'Actions', custom: true, width: '90px' },
  ];
 
  sortableColumns: string[] = ['approvedOn'];
 
  // ── Selection state ───────────────────────────────────────────────────────
  selectedIds = new Set<string | number>();
 
  get allSelected(): boolean {
    return this.data?.length > 0 && this.data?.every(r => this.selectedIds.has(r.id));
  }
 
  get someSelected(): boolean {
    return this.selectedIds?.size > 0 && !this.allSelected;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['tableType']){
      this.updateColumnsBasedOnTableType();
    }
  }
 private updateColumnsBasedOnTableType(): void {
  const currentColumn:any=this.columns.find(col => col.key === 'package');
    if (this.tableType === 'pendingReady') {
      currentColumn.label = 'Revised package';
    }
    else{
      currentColumn.label = 'Package';
    }
  }
  isSelected(row: any): boolean {
    return this.selectedIds?.has(row.id);
  }
 
  toggleRow(row: any): void {
    if (this.selectedIds?.has(row.id)) {
      this.selectedIds?.delete(row.id);
    } else {
      this.selectedIds?.add(row.id);
    }
  
  }
 
  toggleSelectAll(): void {
    if (this.allSelected) {
      this.data.forEach(r => this.selectedIds?.delete(r.id));
    } else {
      this.data.forEach(r => this.selectedIds?.add(r.id));
    }
   
  }
 
 
 
  clearSelection(): void {
    this.selectedIds.clear();
 
  }
 
 async releaseSelected(){
    const selectedRows = this.data.filter(r => this.selectedIds.has(r.id));
    const obj={
      applicationIds:selectedRows.map(row => row.id)
    }
    const res:any=await this.candidateService.releaseOffer(obj);

    if(res?.responsecode=='00'){
      this. notificationService.success(res?.message || res?.data || res?.resposemessage);
    }
    else{
      this.notificationService.error(res?.message||res?.errors?.[0])
    }
  }
 
  // ── Other handlers ────────────────────────────────────────────────────────
  onAction(row: any): void {
    this.actionClick.emit(row);
  }
 
  onPageChange(page: any): void {
    this.pageChange.emit(page);
  }
 
  onSortChange(evt: { col: string; dir: 'asc' | 'desc' }): void {
    this.sortChange.emit(evt);
  }
}