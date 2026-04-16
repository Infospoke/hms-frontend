import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'user-onboard-roles',
    loadComponent: () => import("../components/users-rules/users-rules.component").then(m => m.UsersRulesComponent)
  },
  {
    path:'user-onboard-roles/invite',
    loadComponent:()=>import("../components/invite-user/invite-user.component").then(m=>m.InviteUserComponent)
  }
];