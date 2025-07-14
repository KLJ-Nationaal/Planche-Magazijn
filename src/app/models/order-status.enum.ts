export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Cancelled = 3
}

export const OrderStatusTranslations: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'In afwachting',
  [OrderStatus.Processing]: 'In behandeling',
  [OrderStatus.Completed]: 'Voltooid',
  [OrderStatus.Cancelled]: 'Geannuleerd'
};

export function translateOrderStatus(status: OrderStatus): string {
  return OrderStatusTranslations[status] ?? 'Onbekend';
}