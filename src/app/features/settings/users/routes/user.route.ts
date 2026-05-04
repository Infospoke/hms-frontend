import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'user-onboard-roles',
    loadComponent: () => import("../components/users-rules/users-rules.component").then(m => m.UsersRulesComponent)
  },
  {
    path:'role-permissions',
    loadComponent:()=>import("../components/role-permissions/role-permissions.component").then(m=>m.RolePermissionsComponent)
  },
  {
    path:'role-permissions/by-role',
    loadComponent:()=>import("../components/users-by-role/users-by-role.component").then(c=>c.UsersByRoleComponent)
  },
  {
    path:'role-permissions/by-role-information',
    loadComponent:()=>import("../components/edit-role-info/edit-role-info.component").then(c=>c.EditRoleInfoComponent)
  },
  {
    path:'user-onboard-roles/invite-user',
    loadComponent:()=>import("../components/invite-user/invite-user.component").then(m=>m.InviteUserComponent)
  },
   {
    path:'role-permissions/create-role',
    loadComponent:()=>import("../components/createrole/createrole.component").then(m=>m.CreateRoleComponent)
  },
];