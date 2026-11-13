import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CartItem,
  MenuItem,
  OrderType,
  PaymentMethod,
  RestaurantOrder,
} from '../types/restaurant';
import { LEGACY_ITEM_IDS } from '../data/seedData';
import { useMenu } from './MenuContext';

const CART_STORAGE_KEY = 'agh_cart_v1';
const RECEIPTS_STORAGE_KEY = 'agh_receipts_v1';

interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress: string;
  instructions: string;
}

interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  totalItems: number;
  subtotalPkr: number;
  calculateDeliveryFee: (orderType: OrderType) => number;
  addToCart: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (input: CheckoutInput) => Promise<RestaurantOrder>;
  getLocalReceipt: (orderId: string) => RestaurantOrder | null;
  recentReceipts: RestaurantOrder[];
}

const CartContext = createContext<CartContextValue | null>(null);

function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry: CartItem) => entry?.item?.id && !LEGACY_ITEM_IDS.has(entry.item.id)
    );
  } catch {
    return [];
  }
}

function loadStoredReceipts(): RestaurantOrder[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function generateOrderIds() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
  const orderNumber = `#AGH-${randomSuffix}${timeCode}`.slice(0, 24);
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  );
  return { orderId, orderNumber };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useMenu();
  const [items, setItems] = useState<CartItem[]>(loadStoredCart);
  const [recentReceipts, setRecentReceipts] = useState<RestaurantOrder[]>(loadStoredReceipts);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  );

  const subtotalPkr = useMemo(
    () => items.reduce((sum, entry) => sum + entry.item.pricePkr * entry.quantity, 0),
    [items]
  );

  const calculateDeliveryFee = useCallback(
    (orderType: OrderType) => {
      if (orderType === 'Pickup') return 0;
      if (subtotalPkr === 0) return 0;
      if (
        settings.freeDeliveryThresholdPkr > 0 &&
        subtotalPkr >= settings.freeDeliveryThresholdPkr
      ) {
        return 0;
      }
      return settings.deliveryChargePkr;
    },
    [settings.deliveryChargePkr, settings.freeDeliveryThresholdPkr, subtotalPkr]
  );

  const addToCart = useCallback((item: MenuItem, quantity = 1) => {
    if (!item.available) return;
    setItems((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, item, quantity: Math.min(50, entry.quantity + quantity) }
            : entry
        );
      }
      return [...prev, { item, quantity: Math.max(1, Math.min(50, quantity)) }];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((entry) => entry.item.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.item.id === itemId
          ? { ...entry, quantity: Math.min(50, quantity) }
          : entry
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((entry) => entry.item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const placeOrder = useCallback(
    async (input: CheckoutInput): Promise<RestaurantOrder> => {
      if (items.length === 0) {
        throw new Error('Your cart is empty.');
      }

      const { orderId, orderNumber } = generateOrderIds();
      const deliveryChargePkr = calculateDeliveryFee(input.orderType);
      const totalPkr = subtotalPkr + deliveryChargePkr;
      const paymentMethod: PaymentMethod =
        input.orderType === 'Pickup' ? 'Pay at Pickup' : 'Cash on Delivery';

      const lineItems = items.slice(0, 50).map((entry) => ({
        itemId: entry.item.id,
        name: entry.item.name.slice(0, 100),
        pricePkr: Number(entry.item.pricePkr),
        quantity: Number(entry.quantity),
        lineTotal: Number(entry.item.pricePkr * entry.quantity),
      }));

      const cleanAddress =
        input.orderType === 'Pickup'
          ? 'Self-Pickup at Arabian Grill House'
          : input.deliveryAddress.trim().slice(0, 250);

      const cleanName = input.customerName.trim().slice(0, 80);
      const cleanPhone = input.customerPhone.trim().slice(0, 24);
      const cleanInstructions = input.instructions.trim().slice(0, 300);

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'orders', orderId), {
          orderNumber,
          customerName: cleanName,
          customerPhone: cleanPhone,
          deliveryAddress: cleanAddress,
          orderType: input.orderType,
          instructions: cleanInstructions,
          items: lineItems,
          subtotalPkr,
          deliveryChargePkr,
          totalPkr,
          paymentMethod,
          status: 'New Order',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        batch.set(doc(db, 'order_tracking', orderId), {
          orderNumber,
          status: 'New Order',
          updatedAt: serverTimestamp(),
        });

        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      }

      const createdOrder: RestaurantOrder = {
        id: orderId,
        orderNumber,
        customerName: cleanName,
        customerPhone: cleanPhone,
        deliveryAddress: cleanAddress,
        orderType: input.orderType,
        instructions: cleanInstructions,
        items: lineItems,
        subtotalPkr,
        deliveryChargePkr,
        totalPkr,
        paymentMethod,
        status: 'New Order',
        createdAtMs: Date.now(),
      };

      setRecentReceipts((prev) => {
        const updated = [createdOrder, ...prev].slice(0, 20);
        try {
          localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore storage quota errors
        }
        return updated;
      });

      setItems([]);
      return createdOrder;
    },
    [calculateDeliveryFee, items, subtotalPkr]
  );

  const getLocalReceipt = useCallback(
    (orderId: string) => {
      return recentReceipts.find((r) => r.id === orderId) || null;
    },
    [recentReceipts]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        setDrawerOpen,
        totalItems,
        subtotalPkr,
        calculateDeliveryFee,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        placeOrder,
        getLocalReceipt,
        recentReceipts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
