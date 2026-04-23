import { Routes } from '@angular/router';

export const SUPPLY_ROUTES: Routes = [
  {
    path: 'kanban',
    loadComponent: () => import("../components/kanban/kanban.component").then(m => m.KanbanComponent)
  }
];