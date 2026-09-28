import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth),
    title: 'Login | Document Tracker',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth),
    data: { register: true },
    title: 'Register | Document Tracker',
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    canActivate: [
      () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        return auth.refreshSession() || router.createUrlTree(['/login']);
      },
    ],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard | Document Tracker',
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/document-list').then((m) => m.DocumentList),
        title: 'Documents | Document Tracker',
      },
      {
        path: 'documents/add',
        loadComponent: () =>
          import('./features/documents/document-form').then((m) => m.DocumentForm),
        title: 'Add Document | Document Tracker',
      },
      {
        path: 'documents/:id/edit',
        loadComponent: () =>
          import('./features/documents/document-form').then((m) => m.DocumentForm),
        title: 'Edit Document | Document Tracker',
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./features/documents/document-view').then((m) => m.DocumentView),
        title: 'Document | Document Tracker',
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
        title: 'Categories | Document Tracker',
      },
      {
        path: 'reminders',
        loadComponent: () => import('./features/reminders/reminders').then((m) => m.Reminders),
        title: 'Reminders | Document Tracker',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
        title: 'Profile | Document Tracker',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
        title: 'Settings | Document Tracker',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found').then((m) => m.NotFound),
    title: 'Page Not Found | Document Tracker',
  },
];
