import { OrderItem } from "./order-item.model";

export type Order = {
  id: number;
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