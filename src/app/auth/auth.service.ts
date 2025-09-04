import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API = environment.apiBaseUrl;
  
  login(dto: { username: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.API}/auth/login`, dto)
      .pipe(tap(res => localStorage.setItem(this.TOKEN_KEY, res.token)));
  }
  
  logout(){ localStorage.removeItem(this.TOKEN_KEY); this.router.navigateByUrl('/login'); }
  get token(){ return localStorage.getItem(this.TOKEN_KEY); }
  get isAuthenticated(){ return !!this.token; }
}