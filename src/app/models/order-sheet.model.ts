import { OrderStatus } from './order-status.enum';

export interface OrderSheet {
    id: number;
    name: string;
    responsible: string;
    orderStatus: string;
}