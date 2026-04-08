import { Routes } from '@angular/router';

export const JOB_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../job-dashboard/job-dashboard.component').then(c => c.JobDashboardComponent)
  },
  {
    path: 'job-details',
    loadComponent: () => import('../job-overview/job-overview').then(c => c.JobOverview)
  },
  {path:'add-job', loadComponent: () => import('../add-job/add-job.component').then(c => c.AddJobComponent)},
  {
    path: 'add-applicant',
    loadComponent: () => import('../add-applicant/add-applicant.component').then(c => c.AddApplicantComponent)
  }
];