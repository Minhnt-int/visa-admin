export interface OrderItem {
    productItemId: number;
    quantity: number;
    productName?: string;
    price?: number;
    id?: number;
  }

export  interface OrderAttributes {
    id?: number;
    userId: number;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    notes: string;
    status?: string;
    totalAmount?: number;
    items: OrderItem[];
    createdAt?: Date;
    updatedAt?: Date;
  }