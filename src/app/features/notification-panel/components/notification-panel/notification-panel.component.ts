import {
  Component, EventEmitter, Input, Output, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationAllService } from '../../services/notification-service';
import { NotificationWebsocketService, StoredNotification } from '../../services/notification-websocket-service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPanelComponent implements OnInit, OnChanges, OnDestroy {

  @Input()  visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() countChange   = new EventEmitter<number>();

  private notificationService   = inject(NotificationAllService);
  private wsService             = inject(NotificationWebsocketService
  );
  private router                = inject(Router);
  private cdr                   = inject(ChangeDetectorRef);

  // ── State ──────────────────────────────────────────────────────────────────
  notifications: any[]                     = [];
  storedNotifications: StoredNotification[] = [];
  unreadCount  = 0;
  isLoading    = false;
  markingRead  = false;

  private wsSub!: Subscription;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Seed from localStorage immediately (BehaviorSubject replays last value)
    this.wsSub = this.wsService.storedNotifications$.subscribe(list => {
      this.storedNotifications = list;
      this.cdr.markForCheck();
    });

    this.loadPanelData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['visible'] && this.visible) {
    //   this.loadNotification();
    // }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  private async loadPanelData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const countRes   = await this.notificationService.getNotificationCounts();
      this.unreadCount = countRes?.data?.unread ?? 0;
      this.countChange.emit(this.unreadCount);
    } catch (err) {
      console.error('Failed to load notification count', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async loadNotification(): Promise<void> {
    if (!this.visible) return;
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const listRes = await this.notificationService.getNotifications({
        page: 0,
        size: 5,
        sortBy: 'notificationSentAt',
        direction: 'DESC',
        filters: { isRead: false },
      });
      this.notifications = listRes?.data?.notifications ?? [];
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async markAsRead(notif: any): Promise<void> {
    if (notif.isRead || this.markingRead) return;

    this.markingRead = true;
    this.cdr.markForCheck();

    try {
      await this.notificationService.markAsRead({ ids: [notif.id], isRead: true });
      notif.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.countChange.emit(this.unreadCount);
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    } finally {
      this.markingRead = false;
      this.cdr.markForCheck();
    }
  }

  async markAllAsRead(): Promise<void> {
    if (this.unreadCount === 0 || this.markingRead) return;

    this.markingRead = true;
    this.cdr.markForCheck();

    try {
      // Collect IDs only from WS-stored notifications (no API list call)
      const wsIds: number[] = this.storedNotifications
        .filter(s => s.id != null)
        .map(s => s.id as number);

      if (wsIds.length) {
        await this.notificationService.markAsRead({ ids: wsIds, isRead: true });
        // Optimistically mark all stored notifications as read in the local list
        this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
      }

      // Refresh count from server only — no loadNotification() call
      await this.loadPanelData();

      this.unreadCount = 0;
      this.countChange.emit(0);
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      this.markingRead = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Clears both the API-backed notification list AND the localStorage
   * WebSocket cache, then resets all counts.
   */
  clearAll(): void {
    this.notifications = [];
    this.unreadCount   = 0;
    this.countChange.emit(0);

    // Clear the WS localStorage cache and reset the BehaviorSubject
    this.wsService.clearStoredNotifications();

    this.cdr.markForCheck();
  }

  // ── Navigation / panel control ─────────────────────────────────────────────

  viewAll(): void {
    this.close();
    this.router.navigateByUrl('/notifications/all-notifications');
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // ── Merged list (WS cache + API, newest first) ────────────────────────────

  get mergedNotifications(): any[] {
    const ws = this.storedNotifications.map(s => ({
      _source:            "ws" as const,
      notificationTitle:  s.notificationTitle,
      message:            s.message,
      notificationSentAt: s.receivedAt,
      isRead:             false,
      processId:          s.processId,
      type:               s.type,
      deptName:           s.deptName,
    }));

    const api = this.notifications.map(n => ({
      _source: "api" as const,
      ...n,
    }));

    // Merge and sort: newest first
    return [...ws, ...api].sort((a, b) => {
      const tA = new Date(a.notificationSentAt ?? 0).getTime();
      const tB = new Date(b.notificationSentAt ?? 0).getTime();
      return tB - tA;
    });
  }

  // ── Icon / colour helpers ──────────────────────────────────────────────────

  private resolveType(notif: any): string {
    const title = (notif.notificationTitle ?? '').toLowerCase();
    if (title.includes('approv'))                                          return 'approved';
    if (title.includes('reject'))                                          return 'rejected';
    if (title.includes('pending') || title.includes('action') ||
        title.includes('sla')     || title.includes('awaiting'))           return 'pending';
    if (title.includes('change'))                                          return 'changes';
    if (title.includes('submit') || title.includes('creat'))               return 'submitted';
    return 'info';
  }

  getIconClass(notif: any): string {
    const map: Record<string, string> = {
      approved:  'fa-solid fa-circle-check',
      pending:   'fa-regular fa-clock',
      changes:   'fa-solid fa-comment-dots',
      submitted: 'fa-solid fa-paper-plane',
      rejected:  'fa-solid fa-circle-xmark',
      info:      'fa-solid fa-circle-info',
    };
    return map[this.resolveType(notif)] ?? 'fa-solid fa-bell';
  }

  getIconColor(notif: any): string {
    const map: Record<string, string> = {
      approved:  '#16a34a',
      pending:   '#f59e0b',
      changes:   '#7c3aed',
      submitted: '#2563eb',
      rejected:  '#dc2626',
      info:      '#0891b2',
    };
    return map[this.resolveType(notif)] ?? '#64748b';
  }

  getTimeAgo(isoDate: string): string {
    if (!isoDate) return '';
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs  = Math.floor(mins / 60);
    if (hrs  < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs  / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}