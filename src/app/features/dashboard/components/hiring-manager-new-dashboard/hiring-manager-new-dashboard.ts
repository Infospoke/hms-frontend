import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';

@Component({
  selector: 'app-hiring-manager-new-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<div></div>`,
})
export class HiringManagerNewDashboard {
  requisitionsColumns: TableColumn[] = [];
  requisitionsData: any[] = [];
}
