import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, filter, first, map, Observable, tap, throwError } from "rxjs";
import { BaseHttp } from "./base.http";
import { SKIP_AUTH, SKIP_REFRESH } from "../auth/auth.flags";
import { HttpContext } from "@angular/common/http";

interface RefreshResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthHttp extends BaseHttp {
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';

  private refreshInProgress$ = new BehaviorSubject<boolean>(false);
  private tokenRefreshed$ = new BehaviorSubject<string | null>(null);
  
  login(dto: { username: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.API_BASE}/auth/login`, dto)
      .pipe(tap(res => localStorage.setItem(this.TOKEN_KEY, res.token)));
  }
  
  logout(){ 
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenRefreshed$.next(null);
    this.router.navigateByUrl('/login'); 
  }

  get token(){ 
    return localStorage.getItem(this.TOKEN_KEY); 
  }

  get isAuthenticated(){ 
    return !!this.token; 
  }

  refreshToken(): Observable<string> {
    if (this.refreshInProgress$.value) {
      return this.tokenRefreshed$.pipe(filter(t => t !== null), first(), map(t => t as string));
    }

    this.refreshInProgress$.next(true);

    return this.http.post<{ token: string }>(
      `${this.API_BASE}/auth/refresh`,
      {},
      {
        withCredentials: true,
        observe: 'body',
        responseType: 'json',
        context: new HttpContext()
          .set(SKIP_AUTH, true)       // don't attach stale bearer
          .set(SKIP_REFRESH, true)    // don't recurse on 401 here
      }
    ).pipe(
      tap(res => this.setToken(res.token)),
      map(res => res.token),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      }),
      tap({
        next: tok => { this.refreshInProgress$.next(false); this.tokenRefreshed$.next(tok); },
        error: () => { this.refreshInProgress$.next(false); }
      })
    );
  }

  private setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenRefreshed$.next(token);
  }
}