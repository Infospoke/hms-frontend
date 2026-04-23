import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/routes/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout/layout.component').then(c => c.LayoutComponent),
    // canActivate: [authGuard],
    children: [
      // { path: 'dashboard', loadChildren: () => import('./features/dashboard/routes/dashboard.routes').then(r => r.DASHBOARD_ROUTES) },
      { path: 'jobs', loadChildren: () => import('./features/job/routes/job.routes').then(r => r.JOB_ROUTES) },
      {path:'users',loadChildren:()=>import("./features/settings/users/routes/user.route").then(r=>r.USER_ROUTES)},
      {path:'demand',loadChildren:()=>import("./features/demand/routes/demand.routes").then(r=>r.DEMAND_ROUTES)},
      {path:'supply',loadChildren:()=>import("./features/supply/routes/supply.routes").then(r=>r.SUPPLY_ROUTES)},
    //   { path: 'candidates', loadChildren: () => import('./features/candidates/candidates.routes').then(r => r.CANDIDATES_ROUTES) },
    //   { path: 'interviews', loadChildren: () => import('./features/interviews/interviews.routes').then(r => r.INTERVIEWS_ROUTES) },
    //   { path: 'offers', loadChildren: () => import('./features/offers/offers.routes').then(r => r.OFFERS_ROUTES) },
    //   { path: 'reports', loadChildren: () => import('./features/reports/reports.routes').then(r => r.REPORTS_ROUTES) },
    //   { path: 'settings', loadChildren: () => import('./features/settings/settings.routes').then(r => r.SETTINGS_ROUTES) },
    //   { path: 'teams', loadChildren: () => import('./features/teams/teams.routes').then(r => r.TEAMS_ROUTES) },
    //   { path: 'user-management', loadChildren: () => import('./features/user-management/user-management.routes').then(r => r.USER_MANAGEMENT_ROUTES) },
    //   { path: 'it-management', loadChildren: () => import('./features/it-management/it-management.routes').then(r => r.IT_MANAGEMENT_ROUTES) },
    //   { path: 'hr-management', loadChildren: () => import('./features/hr-management/hr-management.routes').then(r => r.HR_MANAGEMENT_ROUTES) },
    //   { path: 'finance-management', loadChildren: () => import('./features/finance-management/finance-management.routes').then(r => r.FINANCE_MANAGEMENT_ROUTES) }
    ]
  },
  { path: '**', redirectTo: 'auth' }
];