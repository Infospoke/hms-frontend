import { Routes } from '@angular/router';

export const JOB_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../components/job-dashboard/job-dashboard.component').then(c => c.JobDashboardComponent)
  },
  {path:'add-job', loadComponent: () => import('../components/add-job/add-job.component').then(c => c.AddJobComponent)},
  {
    path: 'add-applicant',
    loadComponent: () => import('../components/add-applicant/add-applicant.component').then(c => c.AddApplicantComponent)
  },
  {
    path: 'job-details',
    loadComponent: () => import('../components/job-overview/job-overview').then(c => c.JobOverview)
  },
  {
    path : 'edit-job/:id',
    loadComponent: () => import('../components/add-job/add-job.component').then(c => c.AddJobComponent)
  },
 
  {
    path:"recruiters-and-response",
    loadComponent: () => import('../../demand/components/recruiters-and-response/recruiters-and-response.component').then(c => c.RecruitersAndResponseComponent)
  },
  {
    path : 'create-job',
    loadComponent: () => import('../components/create-job/create-job.component').then(c => c.CreateJobComponent)
  },
  
];