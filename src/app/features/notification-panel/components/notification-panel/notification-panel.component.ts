import {
  Component, EventEmitter, Input, Output, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface AppNotification {
  id: string;
  type: 'approved' | 'pending' | 'changes' | 'submitted' | 'rejected' | 'info';
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
}

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPanelComponent implements OnInit {

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() countChange = new EventEmitter<number>();

  notifications: AppNotification[] = [
    {
      id: '1', type: 'approved', title: 'SR Approved', isRead: false,
      message: 'SR-2026-ENG-0042 has been approved by Department Head',
      timeAgo: '10 min ago'
    },
    {
      id: '2', type: 'pending', title: 'Action Required', isRead: false,
      message: 'SR-2026-FIN-0031 is awaiting your approval (Finance)',
      timeAgo: '25 min ago'
    },
    {
      id: '3', type: 'changes', title: 'Changes Requested', isRead: false,
      message: 'SR-2026-DA-0025 has changes requested by Hrbp Manager',
      timeAgo: '1 hr ago'
    },
    {
      id: '4', type: 'submitted', title: 'SR Submitted', isRead: true,
      message: 'SR-2026-MKT-0010 has been submitted successfully',
      timeAgo: '2 hrs ago'
    },
    {
      id: '5', type: 'rejected', title: 'SR Rejected', isRead: true,
      message: 'SR-2026-OPS-0008 has been rejected',
      timeAgo: '3 hrs ago'
    },
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.emitCount();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.emitCount();
    this.cdr.markForCheck();
  }

  clearAll(): void {
    this.notifications = [];
    this.emitCount();
    this.cdr.markForCheck();
  }

  markAsRead(notif: AppNotification): void {
    notif.isRead = true;
    this.emitCount();
    this.cdr.markForCheck();
  }

  viewAll(): void {
    this.close();
    this.router.navigateByUrl('/notifications');
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private emitCount(): void {
    this.countChange.emit(this.unreadCount);
  }

  getIconClass(type: AppNotification['type']): string {
    const map: Record<string, string> = {
      approved: 'fa-solid fa-circle-check',
      pending:  'fa-regular fa-clock',
      changes:  'fa-solid fa-comment-dots',
      submitted:'fa-solid fa-paper-plane',
      rejected: 'fa-solid fa-circle-xmark',
      info:     'fa-solid fa-circle-info',
    };
    return map[type] ?? 'fa-solid fa-bell';
  }

  getIconColor(type: AppNotification['type']): string {
    const map: Record<string, string> = {
      approved:  '#16a34a',
      pending:   '#f59e0b',
      changes:   '#7c3aed',
      submitted: '#2563eb',
      rejected:  '#dc2626',
      info:      '#0891b2',
    };
    return map[type] ?? '#64748b';
  }
}