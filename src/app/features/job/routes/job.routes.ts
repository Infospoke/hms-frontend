import { Routes } from '@angular/router';

export const JOB_ROUTES: Routes = [
  {
    path: 'job-dashboard',
    loadComponent: () => import('../job-dashboard/job-dashboard.component').then(c => c.JobDashboardComponent)
  },
  {
    path: 'job-dashboard/job-overview',
    loadComponent: () => import('../job-overview/job-overview').then(c => c.JobOverview)
  }
];