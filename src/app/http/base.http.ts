import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class BaseHttp {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.apiBaseUrl;
}
