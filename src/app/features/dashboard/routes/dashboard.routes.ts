import { Routes } from '@angular/router';
import { HiringManagerDashboardComponent } from '../components/hiring-manager-dashboard/hiring-manager-dashboard.component';
import { HiringManagerNewDashboard } from '../components/hiring-manager-new-dashboard/hiring-manager-new-dashboard';
import { RecruiterDashboardComponentComponent } from '../components/recruiter-dashboard-component/recruiter-dashboard-component.component';

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
  },
  {
    path:"recruiters-performance-dashboard",
    loadComponent:()=>import("../components/recruiters-performance-dashboard/recruiters-performance-dashboard.component").then(m=>m.RecruitersPerformanceDashboardComponent)
  },
  {
    path:"recruiter-dashboard",
    loadComponent:()=>import("../components/recruiter-dashboard-component/recruiter-dashboard-component.component").then(m=>RecruiterDashboardComponentComponent) 
      
    },
];