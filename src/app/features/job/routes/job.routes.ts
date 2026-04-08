import { Routes } from '@angular/router';

export const JOB_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../components/job-dashboard/job-dashboard.component').then(c => c.JobDashboardComponent)
  },
  {
    path: 'job-details',
    loadComponent: () => import('../components/job-overview/job-overview').then(c => c.JobOverview)
  }
];