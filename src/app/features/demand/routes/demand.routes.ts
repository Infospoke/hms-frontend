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
    path:'approved-srs',
    loadComponent:()=>import("../components/my-approved-srs/my-approved-srs.component").then(e=>e.MyApprovedSrsComponent)
  },
  {
    path:'my-assigned-jobs',
    loadComponent:()=>import("../components/my-jobs-assignments/my-jobs-assignments.component").then(e=>e.MyJobsAssignmentsComponent)
  },
  {
    path:'view-sr/:srId',
    loadComponent:()=>import("../../approvals/components/view-sr/view-sr.component").then(m=>m.ViewSrComponent)
  }
];