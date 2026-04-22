import { Component, inject, OnInit } from '@angular/core';
import { InviteUserComponent } from "../invite-user/invite-user.component";
import { EditUserComponent } from "../edit-user/edit-user.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DashboardCountCardComponent } from "../../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CardComponent } from "../../../../../shared/components/card/card.component";
import { forkJoin, from, Observable } from 'rxjs';
import { UserService } from '../../servics/user-service';
import { PaginationComponent } from "../../../../../shared/components/pagination/pagination.component";
@Component({
  selector: 'app-users-rules',
  imports: [CommonModule, NzModalModule, DashboardCountCardComponent, CardComponent, PaginationComponent],
  templateUrl: './users-rules.component.html',
  styleUrl: './users-rules.component.scss',
})
export class UsersRulesComponent implements OnInit {

  showInvite = false;
  showEdit = false;
  private router = inject(Router);
  private modal = inject(NzModalService);
  private userService = inject(UserService);
  totalItems: any;
  cards: any[] = [];
  usersList: any[] = [];
  filters: any[] = [];
  selectedFilter = 'All';
  filteredUsers: any[] = [];
  pageSize = 10;
  currentPage = 1;
  constructor() { }
  ngOnInit(): void {
    this.getCardCountAndList();
  }
  getCardCountAndList() {
    const payload = {
      page: this.currentPage - 1,
      size: this.pageSize
    };

    this.userService.getList(payload).then((res: any) => {
        this.cards = [
          {
            value: res?.data?.totalCount,
            label: 'Total Users',
            valueColor: '#2563eb',
            borderColor: '#bfdbfe',
            bgColor: '#f1f5ff'
          },
          {
            value: res?.data?.activeCount,
            label: 'Active',
            valueColor: '#16a34a',
            borderColor: '#bbf7d0',
            bgColor: '#f0fdf4'
          },
          {
            value: res?.data?.deactivatedCount,
            label: 'Deactivated',
            valueColor: '#6b7280',
            borderColor: '#e5e7eb',
            bgColor: '#f9fafb'
          }
        ];
        this.usersList = res?.data?.users;
        this.totalItems = res?.data?.totalCount;
        this.filteredUsers = this.usersList;
      })
      .catch((err: any) => {
        console.error('API error:', err);
      });
  }


  openInvite() {

    const resf = this.modal.create({
      nzTitle: 'Invite User',
      nzContent: InviteUserComponent,
      nzWidth: '60%',
      nzCentered: true,
      nzBodyStyle: {
        'max-height': '81vh',
        'overflow-y': 'auto',
        'padding': '10px'
      },
      nzFooter: null,
    });

    resf.afterClose.subscribe(() => {
      this.getCardCountAndList();
    })
  }

  edit(user: any) {
    let editUser = this.modal.create({
      nzTitle: '',
      nzContent: EditUserComponent,
      nzWidth: '60%',
      nzCentered: true,

      nzBodyStyle: {
        'max-height': '100vh',
        'overflow-y': 'auto',
        'padding': '10px'
      },
      nzFooter: null,
    })
    const instance = editUser.getContentComponent();
    instance.user = user;
  }
  getLogo(name: any): string {
    if (!name) return '';

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  // generateFilters(users: any[]) {
  //   const roleMap = new Map<string, number>();

  //   users.forEach(user => {
  //     const role = user.roleName || 'Unknown';
  //     roleMap.set(role, (roleMap.get(role) || 0) + 1);
  //   });

  //   const colors = this.getColorPalette();

  //   const dynamicFilters = Array.from(roleMap.entries()).map(([role, count], index) => {
  //     const color = colors[index % colors.length];

  //     return {
  //       label: role,
  //       count,
  //       textColor: color.text,
  //       bgColor: color.bg,
  //       borderColor: color.border
  //     };
  //   });

  //   this.filters = [
  //     {
  //       label: 'All',
  //       count: users.length,
  //       textColor: '#444441',
  //       bgColor: '#f0f0f0',
  //       borderColor: '#c8c8c8'
  //     },
  //     ...dynamicFilters
  //   ];
  // }

  generateFilters(users: any[]) {
  const roleMap = new Map<string, string>();
  users.forEach(user => {
    if (user.roleId && !roleMap.has(user.roleId)) {
      roleMap.set(user.roleId, user.roleName || 'Unknown');
    }
  });

  const roleIds = Array.from(roleMap.keys());

  if (roleIds.length === 0) {
    this.filters = [{
      label: 'All',
      count: users.length,
      textColor: '#444441',
      bgColor: '#f0f0f0',
      borderColor: '#c8c8c8'
    }];
    return;
  }

  const countRequests: Record<string, Observable<any>> = {};
  roleIds.forEach(roleId => {
    countRequests[roleId] = from(this.userService.getCountByRole(roleId)); // wrap Promise → Observable
  });

  const colors = this.getColorPalette();

  forkJoin(countRequests).subscribe({
    next: (results: Record<string, any>) => {
      const dynamicFilters = roleIds.map((roleId, index) => {
        const color = colors[index % colors.length];
        const count = results[roleId]?.data ?? 0;

        return {
          label: roleMap.get(roleId) ?? 'Unknown',
          roleId,
          count,
          textColor: color.text,
          bgColor: color.bg,
          borderColor: color.border
        };
      });

      this.filters = [
        {
          label: 'All',
          count: users.length,
          textColor: '#444441',
          bgColor: '#f0f0f0',
          borderColor: '#c8c8c8'
        },
        ...dynamicFilters
      ];
    },
    error: (err) => console.error('Error fetching role counts:', err)
  });
}

  get pagedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.usersList.slice(start, start + this.pageSize);
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPage(page);
  }
  getColorPalette() {
    return [
      { text: '#0C447C', bg: '#E6F1FB', border: '#85B7EB' },
      { text: '#085041', bg: '#E1F5EE', border: '#5DCAA5' },
      { text: '#7A3E00', bg: '#FFF3E0', border: '#FFB74D' },
      { text: '#5A0B4D', bg: '#FCE4EC', border: '#F48FB1' },
      { text: '#3E2723', bg: '#EFEBE9', border: '#A1887F' },
      { text: '#1A237E', bg: '#E8EAF6', border: '#7986CB' },
      { text: '#004D40', bg: '#E0F2F1', border: '#4DB6AC' }
    ];
  }
  applyFilter(role: any) {
    this.selectedFilter = role;
    console.log(role);
    if (role === 'All') {
      this.filteredUsers = this.usersList;
    } else {
      this.filteredUsers = this.usersList.filter(u => u.roleName === role);
    }
  }

  loadPage(page: number): void {
       let payload={
      page:this.currentPage-1,
      size:this.pageSize
    }
    this.userService.getList(payload)
      .then((res: any) => {
        this.usersList = res.data;
        this.filteredUsers = this.usersList;
        this.totalItems = res.totalRecords;
        this.currentPage = page;
        this.generateFilters(this.usersList);
      })
      .catch((error: any) => {

      })
  }
}
