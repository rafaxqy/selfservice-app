export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  groupId?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  observations?: string;
}

export interface Group {
  id: number;
  name: string;
}