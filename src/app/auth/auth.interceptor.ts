import { inject } from '@angular/core';
import { AuthHttp } from '../http/auth.http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { RETRIED, SKIP_REFRESH } from './auth.flags';

const attach = (req: HttpRequest<any>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthHttp);
  const token = auth.token;
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  
  return next(authReq).pipe(
    catchError((err: any) => {
      const is401 = err instanceof HttpErrorResponse && err.status === 401;
      const canRefresh = !req.context.get(SKIP_REFRESH) && !req.context.get(RETRIED);

      if (!is401 || !canRefresh) {
        // If refresh is not allowed here or already retried, bubble up
        return throwError(() => err);
      }

      // (2) Refresh once
      return auth.refreshToken().pipe(
        // (3) Retry original request with new token, mark as RETRIED to avoid loops
        switchMap((newToken: any) => {
          const retryReq = attach(
            req.clone({ context: req.context.set(RETRIED, true) }),
            newToken
          );
          return next(retryReq);
        }),
        catchError(inner => {
          // Refresh failed => already logged out in AuthService; bubble up
          return throwError(() => inner);
        })
      );
    })
  );
};