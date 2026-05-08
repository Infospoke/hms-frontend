import {
  Component, OnInit, TemplateRef, ViewChild,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { chainOptions } from '../../../../shared/constants/reusbale-filter';

export type NotifType = 'approved' | 'pending' | 'changes' | 'submitted' | 'rejected' | 'info';
export type TabKey = 'all' | 'unread' | 'read';


@Component({
  selector: 'app-all-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ReusableTableComponent,
    CommonFilterComponent,
    HeadingComponent
],
  templateUrl: './all-notifications.component.html',
  styleUrl: './all-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllNotificationsComponent implements OnInit {

  @ViewChild('notifCell', { static: true }) notifCell!: TemplateRef<any>;
  @ViewChild('relatedCell', { static: true }) relatedCell!: TemplateRef<any>;
  @ViewChild('actionCell', { static: true }) actionCell!: TemplateRef<any>;

  activeTab: TabKey = 'all';

  columns: any[] = [
    { key: 'notification', label: 'Notification', custom: true, width: '180px' },
    { key: 'message',      label: 'Message',      width: '320px' },
    { key: 'relatedId',    label: 'Related To',   custom: true, width: '160px' },
    { key: 'dateTime',     label: 'Date & Time',  width: '160px', align: 'left' },
    { key: 'action',       label: 'Action',       custom: true,  width: '80px', align: 'center' },
  ];

  dropdowns =chainOptions;

  private allData: any[] = [
    { id:'1', type:'approved',  notification:'SR Approved',               message:'SR-2026-ENG-0042 has been approved by Department Head.',           relatedId:'SR-2026-ENG-0042', relatedDept:'Engineering', dateTime:'20 May 2026, 10:30 AM', dateRaw: new Date('2026-05-20T10:30'), isRead: false },
    { id:'2', type:'pending',   notification:'Action Required',           message:'SR-2026-FIN-0031 is awaiting your approval (Finance).',            relatedId:'SR-2026-FIN-0031', relatedDept:'Finance',     dateTime:'20 May 2026, 10:15 AM', dateRaw: new Date('2026-05-20T10:15'), isRead: false },
    { id:'3', type:'changes',   notification:'Changes Requested',         message:'SR-2026-DA-0025 has changes requested by Hrbp Manager.',          relatedId:'SR-2026-DA-0025',  relatedDept:'Analytics',   dateTime:'20 May 2026, 09:45 AM', dateRaw: new Date('2026-05-20T09:45'), isRead: false },
    { id:'4', type:'submitted', notification:'SR Submitted Successfully', message:'SR-2026-MKT-0010 has been submitted successfully.',               relatedId:'SR-2026-MKT-0010', relatedDept:'Marketing',   dateTime:'2<PASSWORD>, <PASSWORD>', dateRaw: new Date('2<PASSWORD>-<PASSWORD>-<PASSWORD>'), isRead: false },
    { id:'5', type:'rejected',  notification:'SR Rejected',               message:'SR-2<PASSWORD>-OPS-<PASSWORD> has been rejected by Finance. Reason: Budget limit exceeded.', relatedId:'SR-2<PASSWORD>-OPS-<PASSWORD>', relatedDept:'Operations', dateTime:'2<PASSWORD>, <PASSWORD>', dateRaw: new Date('<PASSWORD>-<PASSWORD>-<PASSWORD>'), isRead: false },
    { id:'6', type:'approved',  notification:'Approval at Level 1 Completed', message:'Your SR has been approved by Hiring Manager.',               relatedId:'SR-2026-HR-0018',  relatedDept:'HR',          dateTime:'19 May 2026, 04:30 PM', dateRaw: new Date('2026-05-19T16:30'), isRead: true  },
    { id:'7', type:'pending',   notification:'SLA Approaching',           message:'SR-2026-DA-0025 is approaching SLA breach in 24 hrs.',            relatedId:'SR-2026-DA-0025',  relatedDept:'Analytics',   dateTime:'19 May 2026, 03:30 PM', dateRaw: new Date('2026-05-19T15:30'), isRead: true  },
    { id:'8', type:'changes',   notification:'Changes Requested',         message:'SR-2026-FIN-0022 has changes requested by Finance Manager.',     relatedId:'SR-2026-FIN-0022', relatedDept:'Finance',     dateTime:'18 May 2026, 11:15 AM', dateRaw: new Date('2026-05-18T11:15'), isRead: true  },
    { id:'9', type:'submitted', notification:'SR Submitted Successfully', message:'SR-2026-HR-0015 has been submitted for review.',                  relatedId:'SR-2026-HR-0015',  relatedDept:'HR',          dateTime:'18 May 2026, 09:00 AM', dateRaw: new Date('2026-05-18T09:00'), isRead: true  },
    { id:'10',type:'rejected',  notification:'SR Rejected',               message:'SR-2026-ENG-0011 has been rejected due to incomplete details.',  relatedId:'SR-2026-ENG-0011', relatedDept:'Engineering', dateTime:'17 May 2026, 03:00 PM', dateRaw: new Date('2026-05-17T15:00'), isRead: true  },
  ];

  filteredData:any[] = [];
  displayData: any[] = [];

  currentPage = 1;
  pageSize = 8;
  totalItems = 0;

  private currentFilters: any = {};
  private currentSearch = '';
  private currentStatus = 'all';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  get tabs() {
    const all    = this.allData.length;
    const unread = this.allData.filter(n => !n.isRead).length;
    const read   = this.allData.filter(n =>  n.isRead).length;
    return [
      { key: 'all'    as TabKey, label: 'All',    count: all    },
      { key: 'unread' as TabKey, label: 'Unread', count: unread },
      { key: 'read'   as TabKey, label: 'Read',   count: read   },
    ];
  }

  selectTab(tab: TabKey): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(event: any): void {
    this.currentSearch = event.search || '';
    this.currentStatus = event.filters?.status || 'all';
    this.currentPage   = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.paginate();
    this.cdr.markForCheck();
  }

  markAllAsRead(): void {
    this.allData = this.allData.map(n => ({ ...n, isRead: true }));
    this.applyFilters();
  }


  openNotification(row: any): void {
    console.log('Open notification', row.id);
  }


  getIconClass(type: NotifType): string {
    const m: Record<NotifType, string> = {
      approved:  'fa-solid fa-circle-check',
      pending:   'fa-regular fa-clock',
      changes:   'fa-solid fa-comment-dots',
      submitted: 'fa-solid fa-paper-plane',
      rejected:  'fa-solid fa-circle-xmark',
      info:      'fa-solid fa-circle-info',
    };
    return m[type];
  }

  getIconColor(type: NotifType): string {
    const m: Record<NotifType, string> = {
      approved:  '#16a34a',
      pending:   '#f59e0b',
      changes:   '#7c3aed',
      submitted: '#2563eb',
      rejected:  '#dc2626',
      info:      '#0891b2',
    };
    return m[type];
  }

  getRelatedColor(dept: string): string {
    const m: Record<string, string> = {
      Engineering: '#3b82f6',
      Finance:     '#8b5cf6',
      Analytics:   '#06b6d4',
      Marketing:   '#f59e0b',
      Operations:  '#64748b',
      HR:          '#10b981',
    };
    return m[dept] ?? '#2563eb';
  }


  private applyFilters(): void {
    let data = [...this.allData];

    // Tab filter
    if (this.activeTab === 'unread') data = data.filter(n => !n.isRead);
    if (this.activeTab === 'read')   data = data.filter(n =>  n.isRead);

    // Status filter
    if (this.currentStatus && this.currentStatus !== 'all') {
      data = data.filter(n => n.type === this.currentStatus);
    }

    // Search
    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      data = data.filter(n =>
        n.notification.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.relatedId.toLowerCase().includes(q)
      );
    }

    this.filteredData = data;
    this.totalItems   = data.length;
    this.paginate();
    this.cdr.markForCheck();
  }

  private paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayData = this.filteredData.slice(start, start + this.pageSize);
  }
}