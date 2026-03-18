import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url } });
  }

  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (auth.hasRole(allowedRoles)) {
    return true;
  }

  // Not authorized for this route
  return router.createUrlTree(['/']);
};
