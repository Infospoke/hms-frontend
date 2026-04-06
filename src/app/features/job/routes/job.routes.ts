import { Routes } from '@angular/router';

export const JOB_ROUTES: Routes = [
  {
    path: 'job-dashboard',
    loadComponent: () => import('../job-dashboard/job-dashboard.component').then(c => c.JobDashboardComponent)
  }
];