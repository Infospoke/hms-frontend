import {
  Component,
  inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../../shared/components/reusable-table/reusable-table.component';
import { UserService } from '../../servics/user-service';
import { getInitials } from '../../../../../shared/validations/validators';
import { Router } from '@angular/router';

export interface UserRow {
  initials: string;
  avatarColor: string;
  name: string;
  email: string;
}

const AVATAR_COLORS = ['blue', 'green', 'teal', 'yellow', 'pink', 'orange', 'purple', 'red'];


@Component({
  selector: 'app-users-by-role',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent],
  templateUrl: './users-by-role.component.html',
  styleUrls: ['./users-by-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersByRoleComponent implements OnInit, OnChanges {


 roleId:any;

  private roleService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

 
  isLoading = false;
  allRows: UserRow[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  private router=inject(Router);

  columns: TableColumn[] = [
    { key: 'name',  label: 'User Name', width: 'auto',   custom: true },
    { key: 'email', label: 'Email Id',  width: '300px',  custom: true, hideOnMobile: true },
  ];

 


  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state; 
    this.roleId = state?.roleId;
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roleId'] && !changes['roleId'].firstChange) {
      this.currentPage = 1;
      this.loadUsers();
    }
  }

 
  private async loadUsers(): Promise<void> {
    if (this.roleId === null) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const payload = {
        page: this.currentPage-1,
        size: this.pageSize,
        sortBy: 'userId',
        direction: 'ASC',
      };

      const res: any = await this.roleService.getUsersByRoleId(this.roleId, payload);

      if (res?.responsecode === '00') {
        const content: any[] = res?.data?.content ?? [];
        this.totalItems = res?.data?.totalItems;
        console.log(this.totalItems,res?.data?.totalItems);
        this.allRows = content.map((u: any, idx: number) => ({
          initials:    getInitials(u.username ?? u.name ?? '?'),
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          name:        u.username ?? u.name ?? '—',
          email:       u.email ?? '—',
        }));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }


  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }
}