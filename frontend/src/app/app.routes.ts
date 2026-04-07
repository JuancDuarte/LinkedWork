import { Routes } from '@angular/router';

import { HomeComponent } from './components/home.component';
import { AuthComponent } from './components/auth.component';
import { ProfileComponent } from './components/profile.component';
import { RequestsComponent } from './components/requests.component';
import { FarmingsComponent } from './components/farmings.component';
import { NotFoundComponent } from './components/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    data: { roles: ['user', 'worker'] }
  },
  { path: 'auth', component: AuthComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['user', 'worker'] }
  },
  {
    path: 'requests',
    component: RequestsComponent,
    canActivate: [authGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'farmings',
    component: FarmingsComponent,
    canActivate: [authGuard],
    data: { roles: ['user', 'worker'] }
  },
  { path: '**', component: NotFoundComponent }
];
