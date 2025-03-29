import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => 
      import('./features/users/pages/user-list/user-list.component')
        .then(m => m.UserListComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () => 
      import('./features/users/pages/user-detail/user-detail.component')
        .then(m => m.UserDetailComponent)
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];
