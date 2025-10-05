export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
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