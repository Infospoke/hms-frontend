import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path:"hiring-manager-dashboard",
    loadComponent:()=>import("../components/hiring-manager-dashboard/hiring-manager-dashboard.component").then(m=>m.HiringManagerDashboardComponent)
  },
  {
    path:"hiring-manager-new-dashboard",
    loadComponent:()=>import("../components/hiring-manager-new-dashboard/hiring-manager-new-dashboard").then(m=>m.HiringManagerNewDashboard)
  }
];