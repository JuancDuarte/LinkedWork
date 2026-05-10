import { Routes } from '@angular/router';

import { HomeComponent } from './components/home.component';
import { AuthComponent } from './components/auth.component';
import { ProfileComponent } from './components/profile.component';
import { RequestsComponent } from './components/requests.component';
import { FarmingsComponent } from './components/farmings.component';
import { ActiveJobsComponent } from './components/active-jobs.component';
import { NotFoundComponent } from './components/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    data: { roles: ['ROLE_USUARIO', 'ROLE_TRABAJADOR'] }
  },
  { path: 'auth', component: AuthComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['ROLE_USUARIO', 'ROLE_TRABAJADOR'] }
  },
  {
    path: 'requests',
    component: RequestsComponent,
    canActivate: [authGuard],
    data: { roles: ['ROLE_USUARIO', 'ROLE_TRABAJADOR'] }
  },
  {
    path: 'farmings',
    component: FarmingsComponent,
    canActivate: [authGuard],
    data: { roles: ['ROLE_USUARIO', 'ROLE_TRABAJADOR'] }
  },
  {
    path: 'active-jobs',
    component: ActiveJobsComponent,
    canActivate: [authGuard],
    data: { roles: ['ROLE_USUARIO', 'ROLE_TRABAJADOR'] }
  },
  { path: '**', component: NotFoundComponent }
];
