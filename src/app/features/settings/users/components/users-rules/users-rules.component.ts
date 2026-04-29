import { Component, inject, OnInit } from '@angular/core';
import { InviteUserComponent } from "../invite-user/invite-user.component";
import { EditUserComponent } from "../edit-user/edit-user.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DashboardCountCardComponent } from "../../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CardComponent } from "../../../../../shared/components/card/card.component";
import { forkJoin, from } from 'rxjs';
import { UserService } from '../../servics/user-service';
import { PaginationComponent } from "../../../../../shared/components/pagination/pagination.component";
import { ProfilePipe } from '../../../../../shared/pipes/profile.pipe';

@Component({
  selector: 'app-users-rules',
  imports: [CommonModule, NzModalModule, DashboardCountCardComponent, CardComponent, PaginationComponent,ProfilePipe],
  templateUrl: './users-rules.component.html',
  styleUrl: './users-rules.component.scss',
})
export class UsersRulesComponent implements OnInit {

  showInvite = false;
  showEdit = false;
  private router = inject(Router);
  private modal = inject(NzModalService);
  private userService = inject(UserService);

  totalItems = 0;
  cards: any[] = [];
  usersList: any[] = [];
  filters: any[] = [];
  selectedFilter: any = 'All';
  filteredUsers: any[] = [];

  pageSize = 10;

 
  currentPage = 1;

  private activeRoleId: any = null;

  constructor() { }

  ngOnInit(): void {
    this.getCardCountAndList();
  }

  getCardCountAndList() {
    const payload = this.buildPayload(0, null); 

    forkJoin({
      userList: from(this.userService.getList(payload)),
      count: from(this.userService.getCount())
    }).subscribe({
      next: (res: any) => {
        this.cards = [
          {
            value: res?.count?.data?.total,
            label: 'Total Users',
            valueColor: '#2563eb',
            borderColor: '#bfdbfe',
            bgColor: '#f1f5ff'
          },
          {
            value: res?.count?.data?.active,
            label: 'Active',
            valueColor: '#16a34a',
            borderColor: '#bbf7d0',
            bgColor: '#f0fdf4'
          },
          {
            value: res?.count?.data?.deactivated,
            label: 'Deactivated',
            valueColor: '#6b7280',
            borderColor: '#e5e7eb',
            bgColor: '#f9fafb'
          }
        ];

        this.usersList = res?.userList?.data?.users ?? [];
        this.totalItems = res?.userList?.data?.totalElements ?? 0;
        this.filteredUsers = this.usersList;
        this.currentPage = 1;

        this.generateFilters(res?.count?.data?.roleCounts, res?.count?.data?.total);
      },
      error: (error: any) => {
        console.error('Failed to load users/count:', error);
      }
    });
  }

  openInvite() {
    this.router.navigateByUrl("/users/user-onboard-roles/invite-user");
   
  }

  edit(user: any) {
    const editUser = this.modal.create({
      nzTitle: '',
      nzContent: EditUserComponent,
      nzWidth: '60%',
      nzCentered: true,
      nzBodyStyle: {
        'max-height': '100vh',
        'overflow-y': 'auto',
        'padding': '10px',
        'border-radius':'20px'
      },
      nzWrapClassName: 'custom-edit-modal',
      nzFooter: null,
    });
    const instance = editUser.getContentComponent();
    instance.userId = user?.id;
  }

  
  generateFilters(roleCounts: any[], total: any) {
    const colors = this.getColorPalette();

    const dynamicFilters = (roleCounts ?? []).map((role, index) => {
      const color = colors[index % colors.length];
      return {
        label: role.roleName || 'Unknown',
        id: role.roleId,    
        roleId: role.roleId,
        count: role.count || 0,
        textColor: color.text,
        bgColor: color.bg,
        borderColor: color.border
      };
    });

    this.filters = [
      {
        label: 'All',
        id: 'All',
        count: total,
        textColor: '#444441',
        bgColor: '#f0f0f0',
        borderColor: '#c8c8c8'
      },
      ...dynamicFilters
    ];
  }


  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPage(page - 1, this.activeRoleId);
  }


  applyFilter(role: any) {
    this.selectedFilter = role;
    this.activeRoleId = role === 'All' ? null : role;
    this.currentPage = 1; // reset to first page on filter change
    this.loadPage(0, this.activeRoleId); // backend page 0
  }


  loadPage(backendPage: number, roleId: any = null): void {
    const payload = this.buildPayload(backendPage, roleId);

    from(this.userService.getList(payload)).subscribe({
      next: (res: any) => {
        this.usersList = res?.data?.users ?? [];
        this.filteredUsers = this.usersList;
        this.totalItems = res?.data?.totalElements ?? 0;
      },
      error: (error: any) => {
        console.error('Failed to load page:', error);
      }
    });
  }

  
  private buildPayload(backendPage: number, roleId: any) {
    const filters: any = {};
    if (roleId !== null && roleId !== undefined) {
      filters['roleId'] = roleId;
    }
    return {
      page: backendPage,
      size: this.pageSize,
      sortBy: 'id',
      direction: 'DESC',
      filters
    };
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

  view(data:any){
    
  }
}