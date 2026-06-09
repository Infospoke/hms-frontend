import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { chainOptions } from '../../../../shared/constants/reusbale-filter';
import { NotificationAllService } from '../../services/notification-service';
import { NotificationWebsocketService } from '../../services/notification-websocket-service';

export type TabKey = 'all' | 'unread' | 'read';

const TAB_READ_MAP: Record<TabKey, boolean | undefined> = {
  all:    undefined,
  unread: false,
  read:   true,
};

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

  private notificationService = inject(NotificationAllService);
  private router               = inject(Router);
  private cdr                  = inject(ChangeDetectorRef);

  // ── Tab state ──────────────────────────────────────────────────────────────
  activeTab: TabKey = 'all';

  tabs = [
    { key: 'all',    label: 'All',    count: 0 },
    { key: 'unread', label: 'Unread', count: 0 },
    { key: 'read',   label: 'Read',   count: 0 },
  ];

  // ── Table columns — checkbox column added as first col ────────────────────
  columns: any[] = [
    { key: 'checkbox',     label: '',             custom: true, width: '48px' },
    { key: 'notification', label: 'Notification', custom: true, width: '200px' },
    { key: 'message',      label: 'Message',      width: '200px',custom: true },
    { key: 'relatedId',    label: 'Related To',   custom: true, width: '160px' },
    { key: 'dateTime',     label: 'Date & Time',  width: '160px', align: 'left' },
    { key: 'action',       label: 'Actions',      custom: true,  width: '100px', align: 'center' },
  ];

  dropdowns   = chainOptions;
  displayData: any[] = [];

  // ── Selection ──────────────────────────────────────────────────────────────
  selectedIds  = new Set<number>();
  markingRead  = false;

  get selectedCount(): number { return this.selectedIds.size; }

  /** True when every unread row on this page is ticked */
  get allUnreadSelected(): boolean {
    const unread = this.displayData.filter(r => !r.isRead);
    return unread.length > 0 && unread.every(r => this.selectedIds.has(r.id));
  }

  /** True when at least one unread row exists on this page */
  get hasUnreadRows(): boolean {
    return this.displayData.some(r => !r.isRead);
  }
  private location = inject(Location);
  // ── Pagination ─────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize    = 8;
  totalItems  = 0;

  private activeFilters: Partial<any> = { dateFilter: 'thisMonth' };
  goBack() {
    this.location.back(); // navigates to the actual previous history entry
  }
  private notificationWebsocketService=inject(NotificationWebsocketService);
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadNotifications();
  }

  // ── Payload builder ────────────────────────────────────────────────────────
  private buildPayload(): object {
    const f: any = this.activeFilters || {};
    const filters: any = {};
    console.log(f);
    const isReadValue = TAB_READ_MAP[this.activeTab];
    if (isReadValue !== undefined) filters['isRead'] = isReadValue;

    if (f.search?.trim())  filters['search']     = f.search.trim();
    if (f.status)          filters['status']     = f.status;
    if (f.dateFilter)      filters['dateFilter'] = f.dateFilter;

    if (f.dateFilter === 'CUSTOM') {
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate)   filters['toDate']   = f.toDate;
    }

    return {
      page:      this.currentPage - 1,
      size:      this.pageSize,
      sortBy:    'notificationSentAt',
      direction: 'DESC',
      filters,
    };
  }

  // ── Data loaders ───────────────────────────────────────────────────────────
  private async loadNotifications(): Promise<void> {
    try {
      const res = await this.notificationService.getNotifications(this.buildPayload());

      const notifications: any[] = res?.data?.notifications ?? [];
      this.totalItems  = res?.data?.totalElements ?? 0;
      this.displayData = notifications.map(n => this.mapToRow(n));

      // Drop selections for rows no longer on this page
      const pageIds = new Set(this.displayData.map(r => r.id));
      this.selectedIds.forEach(id => { if (!pageIds.has(id)) this.selectedIds.delete(id); });

      this.tabs = this.tabs.map(t => ({
        ...t,
        count:
          t.key === 'all'    ? (res?.data?.counts?.total  ?? 0) :
          t.key === 'unread' ? (res?.data?.counts?.unread ?? 0) :
          t.key === 'read'   ? (res?.data?.counts?.read   ?? 0) :
          t.count,
      }));

      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to load notifications list', err);
    }
  }


  // ── Row mapper ─────────────────────────────────────────────────────────────
  private mapToRow(n: any): any {
    return {
      id:           n.id                ?? null,
      type:         this.resolveType(n.notificationTitle ?? '-'),
      notification: n.notificationTitle ?? 'Notification',
      message:      n.message           ?? '-',
      relatedId:    n.processId             ?? '-',
      relatedDept:  n.deptName          ?? '-',
      dateTime:     n.notificationSentAt ? this.formatDate(n.notificationSentAt) : '-',
      isRead:       n.isRead            ?? false,
      _raw:         n,
    };
  }

  // ── Checkbox handlers ──────────────────────────────────────────────────────


  toggleSelectAll(): void {
    const unread = this.displayData.filter(r => !r.isRead);
    if (this.allUnreadSelected) {
      unread.forEach(r => this.selectedIds.delete(r.id));
    } else {
      unread.forEach(r => this.selectedIds.add(r.id));
    }
    this.cdr.markForCheck();
  }

  /** Row checkbox — toggle a single unread row */
  toggleRow(row: any): void {
    if (row.isRead) return;
    this.selectedIds.has(row.id)
      ? this.selectedIds.delete(row.id)
      : this.selectedIds.add(row.id);
    this.cdr.markForCheck();
  }

  isSelected(row: any): boolean {
    return this.selectedIds.has(row.id);
  }


  async markSelectedAsRead(): Promise<void> {
    if (!this.selectedIds.size || this.markingRead) return;

    this.markingRead = true;
    this.cdr.markForCheck();

    try {
      const payload = { ids: Array.from(this.selectedIds), isRead: true };
      await this.notificationService.markAsRead(payload);

      // Optimistic update
      this.displayData = this.displayData.map(n =>
        this.selectedIds.has(n.id) ? { ...n, isRead: true } : n
      );
      this.selectedIds.clear();
      await this.loadNotifications(); 
      await this.notificationService.getNotificationCountsUnRead();  // refresh counts & page
    } catch (err) {
      console.error('Failed to mark selected notifications as read', err);
    } finally {
      this.markingRead = false;
      this.cdr.markForCheck();
    }
  }

  // ── Mark ALL as read — fetches every unread ID across all pages ───────────
  async markAllAsRead(): Promise<void> {
    if (this.markingRead) return;

    this.markingRead = true;
    this.cdr.markForCheck();

    try {
      // Build a payload that fetches ALL unread notifications (no pagination)
      const f: any = this.activeFilters || {};
      const allUnreadFilters: any = { isRead: false };
      console.log(f);
      if (f.search?.trim())  allUnreadFilters['search']     = f.search.trim();
      if (f.status)          allUnreadFilters['status']     = f.status;
      if (f.dateFilter)      allUnreadFilters['dateFilter'] = f.dateFilter;
      if (f.dateFilter === 'CUSTOM') {
        if (f.fromDate) allUnreadFilters['fromDate'] = f.fromDate;
        if (f.toDate)   allUnreadFilters['toDate']   = f.toDate;
      }

      const allUnreadPayload = {
        page:      0,
        size:      10000,           // large enough to capture every unread record
        sortBy:    'notificationSentAt',
        direction: 'DESC',
        filters:   allUnreadFilters,
      };

      const allRes = await this.notificationService.getNotifications(allUnreadPayload);
      const allUnreadIds: number[] = (allRes?.data?.notifications ?? [])
        .map((n: any) => n.id)
        .filter((id: any) => id !== null && id !== undefined);

      if (allUnreadIds.length) {
        await this.notificationService.markAsRead({ ids: allUnreadIds, isRead: true });
      }

      // Optimistic update for the current page view
      this.displayData = this.displayData.map(n => ({ ...n, isRead: true }));
      this.selectedIds.clear();
      await this.loadNotifications();  
      await this.notificationService.getNotificationCountsUnRead(); 
      await this.notificationWebsocketService.clearStoredNotifications(); // refresh counts & current page
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      this.markingRead = false;
      this.cdr.markForCheck();
    }
  }

  // ── Tab / filter / page handlers ───────────────────────────────────────────
  selectTab(tab: TabKey): void {
    this.activeTab   = tab;
    this.currentPage = 1;
    this.selectedIds.clear();
    this.loadNotifications();
  }

  onFilterChange(event: any): void {
    this.activeFilters = {
      ...this.activeFilters,
      search: event.search ?? '',
      ...(event.filters ?? {}),
      ...(event)
    };
    console.log(event,this.activeFilters);
    this.currentPage = 1;
    this.selectedIds.clear();
    this.loadNotifications();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.selectedIds.clear();
    this.loadNotifications();
  }

  openNotification(row: any): void {
    console.log('Open notification', row.id);
  }

  // ── Per-row read / unread toggle ───────────────────────────────────────────
  async toggleReadStatus(row: any): Promise<void> {
    const newState = !row.isRead;
    try {
      await this.notificationService.markAsRead({ ids: [row.id], isRead: newState });

      // Optimistic update — flip the flag on this row only
      this.displayData = this.displayData.map(n =>
        n.id === row.id ? { ...n, isRead: newState } : n
      );

      // Sync tab counts without a full reload
      const delta = newState ? -1 : 1;   // +1 unread when marking unread, -1 when marking read
      this.tabs = this.tabs.map(t => ({
        ...t,
        count:
          t.key === 'unread' ? Math.max(0, t.count + delta) :
          t.key === 'read'   ? Math.max(0, t.count - delta) :
          t.count,
      }));
      await this.notificationService.getNotificationCountsUnRead(); 
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to toggle read status', err);
    }
  }

  // ── Icon / colour helpers ──────────────────────────────────────────────────
  private resolveType(title: string): string {
    const t = (title ?? '').toLowerCase();
    if (t.includes('approv'))                                                    return 'approved';
    if (t.includes('reject'))                                                    return 'rejected';
    if (t.includes('pending') || t.includes('action') ||
        t.includes('awaiting') || t.includes('sla'))                            return 'pending';
    if (t.includes('change'))                                                    return 'changes';
    if (t.includes('submit') || t.includes('creat'))                            return 'submitted';
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
      Engineering:          '#3b82f6',
      Finance:              '#8b5cf6',
      Analytics:            '#06b6d4',
      Marketing:            '#f59e0b',
      Operations:           '#64748b',
      HR:                   '#10b981',
      IT:                   '#6366f1',
      'Talent Acquisition': '#ec4899',
    };
    return m[dept] ?? '#2563eb';
  }

  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }



  truncate(value: string, limit = 10): string {
    if (!value || value === '—') return value;
    return value.length > limit ? value.slice(0, limit) + '..' : value;
  }
}