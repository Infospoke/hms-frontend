import {
  Component, EventEmitter, Input, Output, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification-service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPanelComponent implements OnInit {

  @Input()  visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() countChange   = new EventEmitter<number>();

  private notificationService = inject(NotificationService);
  private router              = inject(Router);
  private cdr                 = inject(ChangeDetectorRef);

  notifications: any[] = [];
  unreadCount = 0;
  isLoading   = false;

 
  ngOnInit(): void {
    this.loadPanelData();
  }

  
  private async loadPanelData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      // Load counts first
      const countRes = await this.notificationService.getNotificationCounts();
      this.unreadCount = countRes?.data?.unread ?? 0;
      this.countChange.emit(this.unreadCount);

     
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

 

  markAllAsRead(): void {
  
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.unreadCount   = 0;
    this.countChange.emit(0);
    this.cdr.markForCheck();
  }

  clearAll(): void {
    this.notifications = [];
    this.unreadCount   = 0;
    this.countChange.emit(0);
    this.cdr.markForCheck();
  }

  markAsRead(notif: any): void {
    if (!notif.isRead) {
      notif.isRead   = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.countChange.emit(this.unreadCount);
      this.cdr.markForCheck();
    }
  }

  viewAll(): void {
    this.close();
    this.router.navigateByUrl('/notifications/all-notifications');
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

 
  private resolveType(notif: any): string {
    const title = (notif.notificationTitle ?? '').toLowerCase();
    if (title.includes('approv'))   return 'approved';
    if (title.includes('reject'))   return 'rejected';
    if (title.includes('pending') || title.includes('action') || title.includes('sla') || title.includes('awaiting')) return 'pending';
    if (title.includes('change'))   return 'changes';
    if (title.includes('submit') || title.includes('creat')) return 'submitted';
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
    const mins  = Math.floor(diff / 60_000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs  < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}