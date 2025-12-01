import { Injectable, inject } from '@angular/core';
import { Order } from '../models/order.model';
import { BaseHttp } from './base.http';
import { Observable } from 'rxjs';
import { OrderSheet } from '../models/order-sheet.model';

@Injectable({ providedIn: 'root' })
export class OrderHttp extends BaseHttp {
  add(order: Order) {
    return this.http.post<{ id: number }>(`${this.API_BASE}/orders/`, order);
  }

  save(order: Order) {
    return this.http.post(`${this.API_BASE}/orders/update`, order);
  }

  me() : Observable<OrderSheet[]> {
    return this.http.get<OrderSheet[]>(`${this.API_BASE}/orders/me`);
  }

  getOrder(id: number) : Observable<Order> {
    return this.http.get<Order>(`${this.API_BASE}/orders/${id}`);
  }
}
