import { Routes } from '@angular/router';

export const DEMAND_ROUTES: Routes = [
  {
    path: 'my-jds',
    loadComponent: () => import("../components/staffing-requisitions/staffing-requisitions.component").then(m => m.StaffingRequisitionsComponent)
  },
  {path:"create",
    loadComponent:()=>import("../components/create-staff/create-staff.component").then(e=>e.CreateStaffComponent)
  },
  {
    path:'all-approved-srs',
    loadComponent:()=>import("../components/my-approved-srs/my-approved-srs.component").then(e=>e.MyApprovedSrsComponent)
  },
  {
    path:'view-sr/:srId',
    loadComponent:()=>import("../../approvals/components/view-sr/view-sr.component").then(m=>m.ViewSrComponent)
  },
  {
    path:"all-jobs",
    loadComponent:()=>import("../components/all-jobs/all-jobs.component").then(m=>m.AllJobsComponent)
  },
  {
    path:'all-jobs/recruiter-and-response/:id',
    loadComponent:()=>import("../components/recruiters-and-response/recruiters-and-response.component").then(m=>m.RecruitersAndResponseComponent)
  },
  {
    path:"all-jobs/recruiter-assignment/:id",
    loadComponent:()=>import("../components/assigning-recruiter/assigning-recruiter.component").then(m=>m.AssigningRecruiterComponent)
  },
  {
    path: 'all-approved-srs/create-job',
    loadComponent: () => import('../../job/components/create-job/create-job.component').then(c => c.CreateJobComponent)
  }
];