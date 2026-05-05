import { Routes } from '@angular/router';

export const APPROVAL_ROUTES: Routes = [
  {
    path: 'sr-list',
    loadComponent: () => import("../components/approval-srs/approval-srs.component").then(m => m.ApprovalSrsComponent)
  },
  {
    path:'view-sr/sr?=',
    loadComponent:()=>import("../components/view-sr/view-sr.component").then(m=>m.ViewSrComponent)
  }
];