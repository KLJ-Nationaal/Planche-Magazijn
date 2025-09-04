import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order.model';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class OrderHttp {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.apiBaseUrl;

  add(order: Order) {
    return this.http.post<{ id: number }>(`${this.API_BASE}/order/add`, order);
  }
}
