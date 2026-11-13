import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DEFAULT_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  LEGACY_CATEGORY_IDS,
  LEGACY_ITEM_IDS,
} from '../data/seedData';
import { MenuCategory, MenuItem, RestaurantSettings } from '../types/restaurant';

interface MenuContextValue {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  loading: boolean;
  isUsingSampleFallback: boolean;
  seedDatabase: () => Promise<void>;
  saveMenuItem: (item: Omit<MenuItem, 'updatedAt'>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (item: MenuItem) => Promise<void>;
  saveCategory: (cat: Omit<MenuCategory, 'updatedAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveSettings: (next: RestaurantSettings) => Promise<void>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firestoreCategories, setFirestoreCategories] = useState<MenuCategory[]>([]);
  const [firestoreItems, setFirestoreItems] = useState<MenuItem[]>([]);
  const [firestoreSettings, setFirestoreSettings] = useState<RestaurantSettings | null>(null);
  const [catsLoaded, setCatsLoaded] = useState(false);
  const [itemsLoaded, setItemsLoaded] = useState(false);

  useEffect(() => {
    const catQuery = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
    const unsubCats = onSnapshot(
      catQuery,
      (snap) => {
        const list: MenuCategory[] = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<MenuCategory, 'id'>),
          }))
          .filter((cat) => !LEGACY_CATEGORY_IDS.has(cat.id));
        setFirestoreCategories(list);
        setCatsLoaded(true);
      },
      (err) => {
        console.error('Categories listener error:', err);
        setCatsLoaded(true);
      }
    );

    const itemQuery = query(collection(db, 'menu_items'), orderBy('sortOrder', 'asc'));
    const unsubItems = onSnapshot(
      itemQuery,
      (snap) => {
        const list: MenuItem[] = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<MenuItem, 'id'>),
          }))
          .filter((item) => !LEGACY_ITEM_IDS.has(item.id));
        setFirestoreItems(list);
        setItemsLoaded(true);
      },
      (err) => {
        console.error('Menu items listener error:', err);
        setItemsLoaded(true);
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'restaurant'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as RestaurantSettings;
          setFirestoreSettings({
            openTime: data.openTime || DEFAULT_SETTINGS.openTime,
            closeTime: data.closeTime || DEFAULT_SETTINGS.closeTime,
            hoursNote: data.hoursNote || DEFAULT_SETTINGS.hoursNote,
            deliveryChargePkr: Number(data.deliveryChargePkr ?? DEFAULT_SETTINGS.deliveryChargePkr),
            freeDeliveryThresholdPkr: Number(
              data.freeDeliveryThresholdPkr ?? DEFAULT_SETTINGS.freeDeliveryThresholdPkr
            ),
            isAcceptingOrders: Boolean(data.isAcceptingOrders ?? true),
          });
        }
      },
      (err) => {
        console.error('Settings listener error:', err);
      }
    );

    return () => {
      unsubCats();
      unsubItems();
      unsubSettings();
    };
  }, []);

  const isUsingSampleFallback =
    catsLoaded && itemsLoaded && firestoreCategories.length === 0 && firestoreItems.length === 0;

  const categories =
    firestoreCategories.length > 0 ? firestoreCategories : INITIAL_CATEGORIES;
  const menuItems = firestoreItems.length > 0 ? firestoreItems : INITIAL_MENU_ITEMS;
  const settings = firestoreSettings || DEFAULT_SETTINGS;

  const seedDatabase = useCallback(async () => {
    try {
      const [existingCatsSnap, existingItemsSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'menu_items')),
      ]);

      const newCatIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));
      const newItemIds = new Set(INITIAL_MENU_ITEMS.map((i) => i.id));

      const batch = writeBatch(db);

      existingCatsSnap.docs.forEach((docSnap) => {
        if (!newCatIds.has(docSnap.id)) {
          batch.delete(doc(db, 'categories', docSnap.id));
        }
      });

      existingItemsSnap.docs.forEach((docSnap) => {
        if (!newItemIds.has(docSnap.id)) {
          batch.delete(doc(db, 'menu_items', docSnap.id));
        }
      });

      for (const cat of INITIAL_CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), {
          name: cat.name.slice(0, 60),
          slug: cat.slug.slice(0, 60),
          description: (cat.description || '').slice(0, 240),
          sortOrder: cat.sortOrder,
          active: cat.active,
          updatedAt: serverTimestamp(),
        });
      }
      for (const item of INITIAL_MENU_ITEMS) {
        batch.set(doc(db, 'menu_items', item.id), {
          name: item.name.slice(0, 100),
          categoryId: item.categoryId,
          categoryName: item.categoryName.slice(0, 60),
          description: item.description.slice(0, 400),
          pricePkr: Number(item.pricePkr),
          isSamplePrice: Boolean(item.isSamplePrice),
          available: Boolean(item.available),
          featured: Boolean(item.featured),
          imageUrl: item.imageUrl.slice(0, 120000),
          spiceLevel: item.spiceLevel,
          prepTimeMinutes: Number(item.prepTimeMinutes),
          sortOrder: Number(item.sortOrder),
          updatedAt: serverTimestamp(),
        });
      }
      batch.set(doc(db, 'settings', 'restaurant'), {
        openTime: DEFAULT_SETTINGS.openTime,
        closeTime: DEFAULT_SETTINGS.closeTime,
        hoursNote: DEFAULT_SETTINGS.hoursNote,
        deliveryChargePkr: DEFAULT_SETTINGS.deliveryChargePkr,
        freeDeliveryThresholdPkr: DEFAULT_SETTINGS.freeDeliveryThresholdPkr,
        isAcceptingOrders: DEFAULT_SETTINGS.isAcceptingOrders,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seed_database');
    }
  }, []);

  const saveMenuItem = useCallback(async (item: Omit<MenuItem, 'updatedAt'>) => {
    const path = `menu_items/${item.id}`;
    try {
      await setDoc(doc(db, 'menu_items', item.id), {
        name: item.name.trim().slice(0, 100),
        categoryId: item.categoryId,
        categoryName: item.categoryName.trim().slice(0, 60),
        description: item.description.trim().slice(0, 400),
        pricePkr: Math.max(0, Math.min(100000, Number(item.pricePkr))),
        isSamplePrice: Boolean(item.isSamplePrice),
        available: Boolean(item.available),
        featured: Boolean(item.featured),
        imageUrl: item.imageUrl.slice(0, 120000),
        spiceLevel: item.spiceLevel,
        prepTimeMinutes: Math.max(1, Math.min(180, Number(item.prepTimeMinutes))),
        sortOrder: Math.max(0, Math.min(1000, Number(item.sortOrder))),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    const path = `menu_items/${id}`;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, []);

  const toggleItemAvailability = useCallback(async (item: MenuItem) => {
    const path = `menu_items/${item.id}`;
    try {
      await updateDoc(doc(db, 'menu_items', item.id), {
        available: !item.available,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, []);

  const saveCategory = useCallback(async (cat: Omit<MenuCategory, 'updatedAt'>) => {
    const path = `categories/${cat.id}`;
    try {
      await setDoc(doc(db, 'categories', cat.id), {
        name: cat.name.trim().slice(0, 60),
        slug: cat.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60),
        description: (cat.description || '').trim().slice(0, 240),
        sortOrder: Math.max(0, Math.min(1000, Number(cat.sortOrder))),
        active: Boolean(cat.active),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, []);

  const saveSettings = useCallback(async (next: RestaurantSettings) => {
    const path = 'settings/restaurant';
    try {
      await setDoc(doc(db, 'settings', 'restaurant'), {
        openTime: next.openTime.trim().slice(0, 20),
        closeTime: next.closeTime.trim().slice(0, 20),
        hoursNote: next.hoursNote.trim().slice(0, 160),
        deliveryChargePkr: Math.max(0, Math.min(5000, Number(next.deliveryChargePkr))),
        freeDeliveryThresholdPkr: Math.max(
          0,
          Math.min(100000, Number(next.freeDeliveryThresholdPkr))
        ),
        isAcceptingOrders: Boolean(next.isAcceptingOrders),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, []);

  return (
    <MenuContext.Provider
      value={{
        categories,
        menuItems,
        settings,
        loading: !catsLoaded || !itemsLoaded,
        isUsingSampleFallback,
        seedDatabase,
        saveMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        saveCategory,
        deleteCategory,
        saveSettings,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('useMenu must be used inside MenuProvider');
  }
  return ctx;
}
