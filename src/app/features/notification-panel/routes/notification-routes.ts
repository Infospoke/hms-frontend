import { Routes } from '@angular/router';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: 'all-notifications',
    loadComponent: () => import("../components/all-notifications/all-notifications.component").then(m => m.AllNotificationsComponent)
  }
];