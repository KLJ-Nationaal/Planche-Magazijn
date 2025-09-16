import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { OrderHttp } from '../http/order.http';

// Prefer environment var or interceptor; keep a fallback here if needed
const API_BASE = 'https://localhost:5001';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private orderHttp = inject(OrderHttp);

  /** Convert local Date to "YYYY-MM-DDTHH:mm:ss" (no timezone suffix) */
  private toIsoLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  /** Map raw grid rows to OrderItem[] (skips empty lines) */
  mapRowsToItems(rows: any[]): OrderItem[] {
    return rows
      .filter(r =>
        (r?.description?.trim?.().length ?? 0) > 0 ||
        r?.amount != null ||
        (r?.unit?.trim?.().length ?? 0) > 0 ||
        (r?.remarks?.trim?.().length ?? 0) > 0
      )
      .map(r => ({
        name: (r.description ?? '').trim(),
        amount: Number.isFinite(Number(r.amount)) ? Number(r.amount) : 0,
        unit: (r.unit ?? '').toString(),
        amountType: (r.amountType ?? '').toString(),
        remarks: (r.remarks ?? '').toString(),
      }));
  }

  /** Build Order DTO from form raw value + row items */
  buildOrder(formRaw: any, items: OrderItem[], timing?: Date | string): Order {
    const timingStr =
      timing instanceof Date ? this.toIsoLocal(timing) :
      typeof timing === 'string' ? timing :
      (formRaw?.timing ?? '');

    return {
      name: formRaw?.name ?? '',
      goalActivity: formRaw?.goalActivity ?? '',
      timing: timingStr,
      location: formRaw?.location ?? '',
      remarks: formRaw?.comment ?? '',
      responsibleName: formRaw?.nameResponsible ?? '',
      responsibleEmail: formRaw?.emailResponsible ?? '',
      responsiblePhone: formRaw?.phoneResponsible ?? '',
      orderItems: items,
    };
  }

  /** Convenience: build + create in one go */
  createFrom(formRaw: any, rows: any[], timing?: Date | string) {
    const items = this.mapRowsToItems(rows);
    const dto = this.buildOrder(formRaw, items, timing);
    return this.orderHttp.add(dto);
  }
}
