import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.page').then(m => m.TasksPage),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  }
];
