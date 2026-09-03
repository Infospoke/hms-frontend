import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { ClientManagementService } from '../../services/client-management.service';



@Component({
  selector: 'app-client-management-list',
  imports: [CommonModule, ReusableTableComponent, HeadingComponent, CommonFilterComponent],
  templateUrl: './client-management-list.component.html',
  styleUrl: './client-management-list.component.scss',
})
export class ClientManagementListComponent implements OnInit {
  private router = inject(Router);
  private clientService = inject(ClientManagementService);

  columns: TableColumn[] = [
    { key: 'id', label: 'ClientId', width: '90px' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'bdm', label: 'BDM' },
    { key: 'clientManager', label: 'Client Manager' },
    { key: 'clientStatus', label: 'Status', align: 'center', custom: true, width: '110px' },
    { key: 'actions', label: 'Actions', align: 'center', custom: true, width: '100px' },
  ];

  clients: any[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  isLoading = false;

  searchTerm = '';
  statusFilter: any = 'ALL';

  statusDropdowns: any[] = [
    {
      key: 'status',
      label: 'Status',
      selected: '',
      options: [
        { value: '', label: 'All' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];

  ngOnInit(): void {
    this.loadClients();
  }

  async loadClients(): Promise<void> {
    this.isLoading = true;
    try {
      const filters: Record<string, any> = {};
      if (this.searchTerm) filters['search'] = this.searchTerm;
      if (this.statusFilter && this.statusFilter !== 'ALL') filters['status'] = this.statusFilter;

      const payload = {
        page: this.currentPage - 1,
        size: this.pageSize,
        sortBy: 'id',
        direction: 'DESC',
        filters,
      };

      const response = await this.clientService.getAllClients(payload);
      if (response?.responsecode !== '00') {
        throw new Error(response?.message || 'Failed to load clients.');
      }

      this.clients = response.data?.content ?? [];
      this.totalItems = response.data?.totalElements ?? 0;
    } catch {
      this.clients = [];
      this.totalItems = 0;
    } finally {
      this.isLoading = false;
    }
  }

  onFilterChange(event: any): void {
    this.searchTerm = event?.search ?? '';
    const status = event?.filters?.['status'];
    this.statusFilter = (status || 'ALL');
    this.currentPage = 1;
    this.loadClients();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClients();
  }

  addClient(): void {
    this.router.navigateByUrl('/client-management/client-management-list/add');
  }

  viewClient(row: any): void {
    this.router.navigate(['/client-management/client-management-list/add'], { queryParams: { id: row.id, mode: 'view' } });
  }

  editClient(row: any): void {
    this.router.navigate(['/client-management/client-management-list/add'], { queryParams: { id: row.id, mode: 'edit' } });
  }



  private csvEscape(value: unknown): string {
    const s = String(value ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
}