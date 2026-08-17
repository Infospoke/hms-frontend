import { Routes } from '@angular/router';

export const SUPPLY_ROUTES: Routes = [
  {
    path: 'kanban',
    loadComponent: () => import('../components/kanban/kanban.component').then(m => m.KanbanComponent)
  },
  {
    path: 'my-assignend-jobs',
    loadComponent: () => import('../components/my-jobs-assignments/my-jobs-assignments.component').then(m => m.MyJobsAssignmentsComponent)
  },
  {
    path: 'my-assignend-jobs/job-details/:id',
    loadComponent: () => import('../components/job-approval-detail/job-approval-detail.component').then(m => m.JobApprovalDetailComponent)
  },
  {
    path: 'my-interview-requests/job-details/:id/:status',
    loadComponent: () => import('../components/job-approval-detail/job-approval-detail.component').then(m => m.JobApprovalDetailComponent)
  },
  {
    path: 'my-interview-requests',
    loadComponent: () => import('../../interview/components/interview-assignments-list-progress/interview-assignments-list-progress.component').then(m => m.InterviewAssignmentsListProgressComponent)
  },
  {
    path: 'hrm-dashboard',
    loadComponent: () => import('../../dashboard/components/hiring-manager-dashboard/hiring-manager-dashboard.component').then(m => m.HiringManagerDashboardComponent)
  },
];
