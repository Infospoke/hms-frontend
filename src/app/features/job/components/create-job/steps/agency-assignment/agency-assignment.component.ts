import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ReusableTableComponent, TableColumn } from '../../../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../../../shared/components/common-filter/common-filter.component';
import { HeadingComponent } from '../../../../../../shared/components/heading/heading.component';
import { ApprovalService } from '../../../../../approvals/services/approval-service';
import { JobService } from '../../../../services/job.service';
import { NotificationService } from '../../../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { categoryany } from '../../../../../../shared/constants/reusbale-filter';

export interface Agency {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  category: string;
  categoryId: number;
  activeAssignments: number;
  assigned: boolean;
}

interface SelectedAgencyDetail {
  agencyId: number;
  email: string;
  agencyName: string;
  categoryId: string;
  categoryName: string;
}

// ── API response shapes ──────────────────────────────────────────────────────
interface ApiCategory {
  categoryName: string;
  id: number;
}

interface ApiAgency {
  agencyName: string;
  categories: ApiCategory[];
  emailId: string;
  id: number;
}

interface AgencyListResponse {
  data: {
    size: number;
    totalPages: number;
    content: ApiAgency[];
    totalElements: number;
  };
  message: string;
  responsecode: string;
}

interface AgencyCategoriesResponse {
  data: ApiCategory[];
  message: string;
  responsecode: string;
}

const AVATAR_COLORS = [
  '#4F46E5', '#0891B2', '#059669', '#D97706',
  '#DC2626', '#7C3AED', '#DB2777', '#EA580C',
];

@Component({
  selector: 'app-agency-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReusableTableComponent, CommonFilterComponent, HeadingComponent],
  templateUrl: './agency-assignment.component.html',
  styleUrl: './agency-assignment.component.scss',
})
export class AgencyAssignmentComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() showInfo: any;
  @Input() infoTooltip: any;
  @Input() showBackButton: boolean = false;
  @Input() buttonText: any;
  @Input() buttonUrl: any;
  @Input() id: any;
  @Input() srId: any;

  private router = inject(Router);

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  // ── Data ──────────────────────────────────────────────────────────────────
  filteredAgencies: Agency[] = [];

  // Ids/details of agencies the user has selected for assignment, kept across
  // pages & filter changes since the table itself is paginated server-side.
  private assignedIds = new Set<number>();
  private assignedAgencyMap = new Map<number, SelectedAgencyDetail>();

  // ── Filter state ──────────────────────────────────────────────────────────
  private searchTerm: string = '';
  private selectedCategoryIds: number[] = [];
  private filterChange$ = new Subject<void>();

  departmentIds: number[] = [];

  private jobService = inject(JobService);
  private approvalService = inject(ApprovalService);
  private notificationService = inject(NotificationService);

  isAssigning = false;
  isLoading = false;
  loadError: string | null = null;

  columns: TableColumn[] = [
    { key: 'select', label: '', width: '48px', custom: true },
    { key: 'name', label: 'Agency', width: '240px', custom: true },
    { key: 'email', label: 'Email ID' },
    { key: 'category', label: 'Category' },
    // { key: 'activeAssignments', label: 'Total Assignments', align: 'center' },
    { key: 'action', label: 'Action', width: '120px', align: 'center', custom: true },
  ];

  filterDropdowns: any[] = categoryany;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.form && !this.form.get('selectedAgencyDetails')) {
      this.form.addControl('selectedAgencyDetails', new FormControl([]));
    }

    // Restore previously assigned agencies so rows fetched from the API can
    // be marked assigned=true and the form stays in sync.
    const saved: SelectedAgencyDetail[] = this.form?.get('selectedAgencyDetails')?.value ?? [];
    saved.forEach((a) => {
      this.assignedIds.add(a.agencyId);
      this.assignedAgencyMap.set(a.agencyId, a);
    });

    // Debounce search-driven refetches; category changes & page changes
    // trigger fetchAgencies() directly.
    this.filterChange$.pipe(debounceTime(350)).subscribe(() => this.fetchAgencies());

    // this.fetchAgencyCategories();
    // this.fetchAgencies();
  }

  ngOnDestroy(): void {
    this.filterChange$.complete();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  private async fetchAgencyCategories(): Promise<void> {
    try {
      const response: AgencyCategoriesResponse = await this.jobService.getAgencyCategories();
      const categories = response?.data ?? [];

      this.filterDropdowns = [
        {
          key: 'categories',
          label: 'Category',
          options: [
            { value: '', label: 'All' },
            ...categories.map((c) => ({
              value: c.id,
              label: c.categoryName,
            })),
          ],
        },
      ];
    } catch (err) {
      console.error('Failed to load agency categories:', err);
      this.notificationService.error('Failed to load agency categories.');
    }
  }

  async fetchAgencies(): Promise<void> {
    this.isLoading = true;
    this.loadError = null;

    const filters: Record<string, string> = {};
    if (this.searchTerm.trim()) {
      filters['search'] = this.searchTerm.trim();
    }
    if (this.selectedCategoryIds.length) {
      filters['categoryIds'] = this.selectedCategoryIds.join(',');
    }

    const payload = {
      page: this.currentPage - 1, // API is 0-indexed
      size: this.pageSize,
      sortBy: 'id',
      direction: 'ASC',
      filters,
    };

    try {
      const response: AgencyListResponse = await this.jobService.agencyList(payload);
      const content = response?.data?.content ?? [];
      this.filteredAgencies = content.map((item) => this.mapApiAgencyToAgency(item));
      this.totalItems = response?.data?.totalElements ?? content.length;
    } catch (err) {
      console.error('Failed to load agencies:', err);
      this.loadError = 'Failed to load agencies. Please try again.';
      this.notificationService.error(this.loadError);
      this.filteredAgencies = [];
      this.totalItems = 0;
    } finally {
      this.isLoading = false;
    }
  }

  private mapApiAgencyToAgency(item: ApiAgency): Agency {
    return {
      id: item.id,
      name: item.agencyName,
      initials: this.getInitials(item.agencyName),
      avatarColor: AVATAR_COLORS[item.id % AVATAR_COLORS.length],
      email: item.emailId,
      category: (item.categories || []).map((c) => c.categoryName).join(', '),
      categoryId: item.categories?.[0]?.id ?? 0,
      activeAssignments: 0,
      assigned: this.assignedIds.has(item.id),
    };
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  onFilterChange(event: any): void {
    this.searchTerm = event.search || '';
    const categoryValue = event.filters?.categories;
    this.selectedCategoryIds = categoryValue ? [Number(categoryValue)] : [];
    this.currentPage = 1;
    this.filterChange$.next();
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchAgencies();
  }

  // ── Select all ────────────────────────────────────────────────────────────
  get allSelected(): boolean {
    return this.filteredAgencies.length > 0 &&
      this.filteredAgencies.every(a => a.assigned);
  }

  get someSelected(): boolean {
    return this.filteredAgencies.some(a => a.assigned) && !this.allSelected;
  }

  toggleAll(checked: boolean): void {
    this.filteredAgencies.forEach(a => {
      a.assigned = checked;
      this.updateAssignedSet(a);
    });
    this.syncForm();
  }

  // ── Row toggle ────────────────────────────────────────────────────────────
  toggleRow(agency: Agency): void {
    agency.assigned = !agency.assigned;
    this.updateAssignedSet(agency);
    this.syncForm();
  }

  toggleAssign(agency: Agency): void {
    agency.assigned = !agency.assigned;
    this.updateAssignedSet(agency);
    this.syncForm();
  }

  private updateAssignedSet(agency: Agency): void {
    if (agency.assigned) {
      this.assignedIds.add(agency.id);
      this.assignedAgencyMap.set(agency.id, {
        agencyId: agency.id,
        email: agency.email,
        agencyName: agency.name,
        categoryId: String(agency.categoryId),
        categoryName: agency.category,
      });
    } else {
      this.assignedIds.delete(agency.id);
      this.assignedAgencyMap.delete(agency.id);
    }
  }

  private syncForm(): void {
    this.form.get('selectedAgencyDetails')?.setValue(Array.from(this.assignedAgencyMap.values()));
  }

  get assignedCount(): number {
    return this.assignedIds.size;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  private getInitials(name: string): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  async onAssignAgencies(): Promise<void> {
    if (this.assignedCount === 0 || this.isAssigning) return;

    const selectedAgencies: SelectedAgencyDetail[] =
      this.form?.get('selectedAgencyDetails')?.value || [];

    if (!selectedAgencies.length) {
      this.notificationService.info('Please assign at least one agency.');
      return;
    }

    // NOTE: no "assign agencies" endpoint was provided yet — this still mocks
    // the submit step. Swap in the real API call here once available.
    this.isAssigning = true;
    console.log('Assigning agencies:', selectedAgencies);

    setTimeout(() => {
      this.notificationService.success('Agencies assigned successfully.');
      this.assignedIds.clear();
      this.assignedAgencyMap.clear();
      this.form.get('selectedAgencyDetails')?.setValue([]);
      this.fetchAgencies();

      // this.router.navigateByUrl(
      //   `/demand/agency-assignment-management/agencies-and-response/${this.id}/${this.srId}`
      // );

      this.isAssigning = false;
    }, 1500);
  }
}