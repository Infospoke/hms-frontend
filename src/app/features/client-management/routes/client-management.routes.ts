import { Routes } from '@angular/router';

export const CLIENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'client-management-list',
    loadComponent: () =>
      import('../componets/client-management-list/client-management-list.component').then(
        m => m.ClientManagementListComponent
      ),
  },
  {
    path: 'client-management-list/add',
    loadComponent: () =>
      import('../componets/add-client-management/add-client-management.component').then(
        m => m.AddClientManagementComponent
      ),
  },
];
