import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthHttp } from '../http/auth.http';

export const canActivateAuth: CanActivateFn = () => {
  const auth = inject(AuthHttp);
  const router = inject(Router);
  return auth.isAuthenticated ? true : router.parseUrl('/login');
};

export const redirectIfAuthenticated: CanActivateFn = () => {
  const auth = inject(AuthHttp);
  const router = inject(Router);
  return auth.isAuthenticated ? router.parseUrl('/dashboard') : true;
};