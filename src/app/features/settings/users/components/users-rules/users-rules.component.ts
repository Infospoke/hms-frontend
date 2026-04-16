import { Component, inject } from '@angular/core';
import { InviteUserComponent } from "../invite-user/invite-user.component";
import { EditUserComponent } from "../edit-user/edit-user.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DashboardCountCardComponent } from "../../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CardComponent } from "../../../../../shared/components/card/card.component";
@Component({
  selector: 'app-users-rules',
  imports: [CommonModule, NzModalModule, DashboardCountCardComponent, CardComponent],
  templateUrl: './users-rules.component.html',
  styleUrl: './users-rules.component.scss',
})
export class UsersRulesComponent {

  showInvite = false;
  showEdit = false;
  private router = inject(Router);
  private modal = inject(NzModalService);

  cards = [
    {
      value: 24,
      label: 'Total Users',
      valueColor: '#2563eb',
      borderColor: '#bfdbfe',
      bgColor: '#f1f5ff'
    },
    {
      value: 21,
      label: 'Active',
      valueColor: '#16a34a',
      borderColor: '#bbf7d0',
      bgColor: '#f0fdf4'
    },
    {
      value: 1,
      label: 'Deactivated',
      valueColor: '#6b7280',
      borderColor: '#e5e7eb',
      bgColor: '#f9fafb'
    }
  ];
  filters = [
    { label: 'All', count: 24, textColor: '#444441', bgColor: '#f0f0f0', borderColor: '#c8c8c8' },
    { label: 'Hiring Manager', count: 10, textColor: '#0C447C', bgColor: '#E6F1FB', borderColor: '#85B7EB' }, // ← only name shows
    { label: 'Recruiter', count: 8, textColor: '#085041', bgColor: '#E1F5EE', borderColor: '#5DCAA5' },
  ];
  openInvite() {

    this.modal.create({
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
    })
  }

  edit() {
     this.modal.create({
      nzTitle: '',
      nzContent:EditUserComponent,
      nzWidth: '60%',
      nzCentered: true,
      
      nzBodyStyle: {
        'max-height': '100vh',
        'overflow-y': 'auto',
        'padding': '10px'
      },
      nzFooter: null,
    })
  }

}
