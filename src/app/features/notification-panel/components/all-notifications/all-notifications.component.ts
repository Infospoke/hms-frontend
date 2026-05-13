import {
  Component, OnInit, TemplateRef, ViewChild,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { chainOptions } from '../../../../shared/constants/reusbale-filter';
import { NotificationService } from '../../services/notification-service';

export type TabKey = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-all-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ReusableTableComponent,
    CommonFilterComponent,
    HeadingComponent,
  ],
  templateUrl: './all-notifications.component.html',
  styleUrl: './all-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllNotificationsComponent implements OnInit {

  private notificationService = inject(NotificationService);
  private router              = inject(Router);
  private cdr                 = inject(ChangeDetectorRef);

 
  activeTab: TabKey = 'all';

  tabs = [
    { key: 'all'    as TabKey, label: 'All',    count: 0 },
    { key: 'unread' as TabKey, label: 'Unread', count: 0 },
    { key: 'read'   as TabKey, label: 'Read',   count: 0 },
  ];

 
  columns: any[] = [
    { key: 'notification', label: 'Notification', custom: true, width: '180px' },
    { key: 'message',      label: 'Message',                    width: '320px' },
    { key: 'relatedId',    label: 'Related To',  custom: true,  width: '160px' },
    { key: 'dateTime',     label: 'Date & Time',                width: '160px', align: 'left' },
    { key: 'action',       label: 'Action',       custom: true, width: '80px',  align: 'center' },
  ];

  dropdowns = chainOptions;

  // ── Table data ─────────────────────────────────────────────────────────────
  displayData: any[] = [];

  // ── Pagination (UI is 1-based; backend is 0-based) ─────────────────────────
  currentPage = 1;      // UI: starts at 1
  pageSize    = 8;
  totalItems  = 0;

  // ── Active filters ─────────────────────────────────────────────────────────
  private currentSearch = '';
  private currentStatus = 'all';

 
  ngOnInit(): void {
    this.loadCounts();
    this.loadNotifications();
  }

 
  private async loadCounts(): Promise<void> {
    try {
      const res = await this.notificationService.getNotificationCounts();
      const d   = res?.data;
      this.tabs = [
        { key: 'all'    as TabKey, label: 'All',    count: d?.total  ?? 0 },
        { key: 'unread' as TabKey, label: 'Unread', count: d?.unread ?? 0 },
        { key: 'read'   as TabKey, label: 'Read',   count: d?.read   ?? 0 },
      ];
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to load notification counts', err);
    }
  }

 
  private async loadNotifications(): Promise<void> {
    try {
      const filters: Record<string, any> = {};

      // Tab → isRead filter
      if (this.activeTab === 'unread') filters['isRead'] = false;
      if (this.activeTab === 'read')   filters['isRead'] = true;

      // Search
      if (this.currentSearch) filters['search'] = this.currentSearch;

      const payload = {
        page: this.currentPage - 1,   
        size: this.pageSize,
        sortBy: 'notificationSentAt',
        direction: 'DESC' as const,
        filters,
      };

      const res = await this.notificationService.getNotifications(payload);

      const notifications: any[] = res?.data?.notifications ?? [];
      this.totalItems  = res?.data?.totalElements ?? 0;
      this.displayData = notifications.map(n => this.mapToRow(n));

      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to load notifications list', err);
    }
  }


  private mapToRow(n: any): any {
    return {
      id:           n.id,
      type:         this.resolveType(n.notificationTitle),
      notification: n.notificationTitle,
      message:      n.message,
      relatedId:    n.SRId,
      relatedDept:  n.deptName,
      dateTime:     this.formatDate(n.notificationSentAt),
      isRead:       n.isRead,
      _raw:         n,
    };
  }

  // ── Tab & filter handlers ──────────────────────────────────────────────────
  selectTab(tab: TabKey): void {
    this.activeTab  = tab;
    this.currentPage = 1;
    this.loadNotifications();
  }

  onFilterChange(event: any): void {
    this.currentSearch = event.search        ?? '';
    this.currentStatus = event.filters?.status ?? 'all';
    this.currentPage   = 1;
    this.loadNotifications();
  }

  onPageChange(page: number): void {
    this.currentPage = page;   // page from the table is already 1-based
    this.loadNotifications();
  }

  markAllAsRead(): void {
    // Optimistic UI — wire to a real API endpoint when available
    this.displayData = this.displayData.map(n => ({ ...n, isRead: true }));
    this.loadCounts();
    this.cdr.markForCheck();
  }

  openNotification(row: any): void {
    console.log('Open notification', row.id);
  }

  // ── Icon / colour helpers ──────────────────────────────────────────────────
  private resolveType(title: string): string {
    const t = (title ?? '').toLowerCase();
    if (t.includes('approv'))  return 'approved';
    if (t.includes('reject'))  return 'rejected';
    if (t.includes('pending') || t.includes('action') || t.includes('awaiting') || t.includes('sla')) return 'pending';
    if (t.includes('change'))  return 'changes';
    if (t.includes('submit') || t.includes('creat')) return 'submitted';
    return 'info';
  }

  getIconClass(type: string): string {
    const m: Record<string, string> = {
      approved:  'fa-solid fa-circle-check',
      pending:   'fa-regular fa-clock',
      changes:   'fa-solid fa-comment-dots',
      submitted: 'fa-solid fa-paper-plane',
      rejected:  'fa-solid fa-circle-xmark',
      info:      'fa-solid fa-circle-info',
    };
    return m[type] ?? 'fa-solid fa-bell';
  }

  getIconColor(type: string): string {
    const m: Record<string, string> = {
      approved:  '#16a34a',
      pending:   '#f59e0b',
      changes:   '#7c3aed',
      submitted: '#2563eb',
      rejected:  '#dc2626',
      info:      '#0891b2',
    };
    return m[type] ?? '#64748b';
  }

  getRelatedColor(dept: string): string {
    const m: Record<string, string> = {
      Engineering:         '#3b82f6',
      Finance:             '#8b5cf6',
      Analytics:           '#06b6d4',
      Marketing:           '#f59e0b',
      Operations:          '#64748b',
      HR:                  '#10b981',
      IT:                  '#6366f1',
      'Talent Acquisition':'#ec4899',
    };
    return m[dept] ?? '#2563eb';
  }

  // ── Date formatter ─────────────────────────────────────────────────────────
  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }
}