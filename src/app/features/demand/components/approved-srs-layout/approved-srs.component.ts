import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approved-srs-layout',
  imports: [ApprovalLayoutComponent, ReusableTableComponent, CommonModule],
  templateUrl: './approved-srs.component.html',
  styleUrl: './approved-srs.component.scss',
})
export class ApprovedSrsComponent {

  @Input() heading: string = '';
  @Input() subheading: string = '';
  @Input() dropDownData: any[] = [];
  @Input() searchPlaceholder: string = '';
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalElements: number = 0;
  @Input() cards: any[] = [];
  @Input() tabs: { key: string; label: string; count: number }[] = [];
  @Input() activeTab: string = '';

  @Output() filtersChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() createJob = new EventEmitter<any>();

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
}