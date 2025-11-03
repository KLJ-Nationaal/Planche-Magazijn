import { OrderItem } from "./order-item.model";

export type Order = {
  name: string;
  goalActivity: string;
  timing: string;
  location: string;
  remarks: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  orderItems: OrderItem[];
};