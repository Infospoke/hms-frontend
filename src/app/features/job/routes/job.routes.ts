import { Routes } from '@angular/router';

export const JOB_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import("../job.component").then(m => m.JobComponent)
  }
];