import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: 'login', loadComponent: () => import('../login/login.component').then(c => c.LoginComponent) },
  { path: 'forgot-password', loadComponent: () => import('../forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent) },
  {path:'change-password',loadComponent:()=>import("../change-password/change-password.component").then(c=>c.ChangePasswordComponent)},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];