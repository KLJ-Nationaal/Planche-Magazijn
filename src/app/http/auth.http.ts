import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { BaseHttp } from "./base.http";

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseHttp {
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';
  
  login(dto: { username: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.API_BASE}/auth/login`, dto)
      .pipe(tap(res => localStorage.setItem(this.TOKEN_KEY, res.token)));
  }
  
  logout(){ 
    localStorage.removeItem(this.TOKEN_KEY); this.router.navigateByUrl('/login'); 
  }

  get token(){ 
    return localStorage.getItem(this.TOKEN_KEY); 
  }

  get isAuthenticated(){ 
    return !!this.token; 
  }
}