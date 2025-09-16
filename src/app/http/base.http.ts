import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class BaseHttp {
  protected http = inject(HttpClient);
  protected readonly API_BASE = environment.apiBaseUrl;
}
