import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order.model';

const API_BASE = 'https://localhost:7137'; // or environment.baseUrl

@Injectable({ providedIn: 'root' })
export class OrderHttp {
  private http = inject(HttpClient);

  add(order: Order) {
    return this.http.post<{ id: number }>(`${API_BASE}/order/add`, order);
  }
}
