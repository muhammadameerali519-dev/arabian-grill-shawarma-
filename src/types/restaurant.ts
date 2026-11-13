export type SpiceLevel = 'Mild' | 'Medium' | 'Signature Blend';

export type OrderType = 'Delivery' | 'Pickup';

export type PaymentMethod = 'Cash on Delivery' | 'Pay at Pickup';

export type OrderStatus =
  | 'New Order'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'New Order',
  'Accepted',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Completed',
  'Cancelled',
];

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  updatedAt?: unknown;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  pricePkr: number;
  isSamplePrice: boolean;
  available: boolean;
  featured: boolean;
  imageUrl: string;
  spiceLevel: SpiceLevel;
  prepTimeMinutes: number;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface OrderLineItem {
  itemId: string;
  name: string;
  pricePkr: number;
  quantity: number;
  lineTotal: number;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderType: OrderType;
  instructions: string;
  items: OrderLineItem[];
  subtotalPkr: number;
  deliveryChargePkr: number;
  totalPkr: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAtMs: number;
}

export interface RestaurantSettings {
  openTime: string;
  closeTime: string;
  hoursNote: string;
  deliveryChargePkr: number;
  freeDeliveryThresholdPkr: number;
  isAcceptingOrders: boolean;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category:
    | 'Special Shawarma'
    | 'Platter'
    | 'Burgers'
    | 'Snack Pack'
    | 'Sides & Dips'
    | 'Atmosphere';
  caption: string;
  imageUrl: string;
}
