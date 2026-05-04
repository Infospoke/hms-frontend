

import { Component, ChangeDetectionStrategy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../../shared/components/reusable-table/reusable-table.component';
import { UserService } from '../../servics/user-service';
import { getInitials } from '../../../../../shared/validations/validators';
import { Router } from '@angular/router';


const AVATAR_COLORS = ['blue', 'green', 'teal', 'yellow', 'pink', 'orange', 'purple', 'red'];

export interface RoleRow {
  roleId: number;
  abbr: string;
  abbrColor: string;
  roleName: string;
  description: string;
  userCount: number;
}

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionsComponent implements OnInit {

   private cdr = inject(ChangeDetectorRef);
  columns: TableColumn[] = [
    { key: 'role', label: 'Role', width: '260px', custom: true }, 
    { key: 'users', label: 'Users', width: '120px', custom: true },
    { key: 'description', label: 'Description', width: 'auto', custom: true }, 
        { key: 'actions', label: 'Actions', width: '110px', align: 'center', custom: true },
  ];
  data: any[] = [];
  private userService = inject(UserService)
  private router=inject(Router);
  currentPage = 1;
  pageSize = 10;
  totalPages: number = 1;
  ngOnInit(): void {
    this.getInitalData();
  }
  async getInitalData() {
    let obj = {
      page: this.currentPage-1,
      size: 10,
      sortBy: "roleId",
      direction: "ASC"
    }
    this.userService.getRolePermissionMatrix(obj).then((res: any) => {
      if (res?.responsecode == '00') {
        const content = res?.data?.content;
        this.data = content?.map((item: any, index: number) => {
          return {
            ...item,
            description:item?.description + item?.description,
            abbr: getInitials(item?.roleName),
            abbrColor: AVATAR_COLORS[index % AVATAR_COLORS.length]
          };
        });
        console.log(this.data);
         this.cdr.markForCheck();
        this.totalPages = res?.data?.totalItems;
      }
    })
      .catch((error: any) => {
        console.log(error);
      })

  }


  onPageChange(page: number): void {
    this.currentPage = page;
    this.getInitalData();
  }

  onView(row: RoleRow): void {
    console.log('View', row);
  }

  addRole(): void {
    this.router.navigateByUrl('/users/role-permissions/create-role')
  }

  onEdit(row: RoleRow): void {
   this.router.navigateByUrl('/users/role-permissions/by-role-information',{state:{roleId:row?.roleId}})
  }
  viewUser(row:RoleRow):void{
    this.router.navigateByUrl('/users/role-permissions/by-role',{state:{roleId:row?.roleId}})
  }
}