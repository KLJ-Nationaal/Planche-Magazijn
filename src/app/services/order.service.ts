import { inject, Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { OrderHttp } from '../http/order.http';
import { DateHelper } from '../helpers/date.helper';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private orderHttp = inject(OrderHttp);
    private dateHelper = inject(DateHelper);

  public mapRowsToItems(items: OrderItem[]): OrderItem[] {
      return items.filter(i =>
        (i.name?.trim().length ?? 0) > 0 ||
        i.amount != null ||
        (i.unit?.trim().length ?? 0) > 0 ||
        (i.remarks?.trim().length ?? 0) > 0
      );
  }

  public buildOrder(formRaw: any, items: OrderItem[], timing?: Date | string): Order {
    const timingStr =
      timing instanceof Date ? this.dateHelper.toIsoLocal(timing) :
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

  public createFrom(formRaw: any, rows: any[], timing?: Date | string) {
    const items = this.mapRowsToItems(rows);
    const dto = this.buildOrder(formRaw, items, timing);
    return this.orderHttp.add(dto);
  }

  public getOrder(id: number) {
    return this.orderHttp.getOrder(id);
  }
}
