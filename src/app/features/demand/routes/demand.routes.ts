import { Routes } from '@angular/router';

export const DEMAND_ROUTES: Routes = [
  {
    path: 'my-jds',
    loadComponent: () => import("../components/staffing-requisitions/staffing-requisitions.component").then(m => m.StaffingRequisitionsComponent)
  },
  {path:"create",
    loadComponent:()=>import("../components/create-staff/create-staff.component").then(e=>e.CreateStaffComponent)
  }
];