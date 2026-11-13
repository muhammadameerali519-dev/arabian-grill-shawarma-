import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  doc,
} from 'firebase/firestore';
import {
  Check,
  Database,
  Edit3,
  FolderPlus,
  Image as ImageIcon,
  Lock,
  LogOut,
  Package,
  Plus,
  Settings,
  ShieldAlert,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { ShawarmaLoader } from '../components/ShawarmaLogo3D';
import { SmartImage } from '../components/SmartImage';
import { SquircleIcon } from '../components/SquircleIcon';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { BRAND_ASSETS } from '../data/assets';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  MenuCategory,
  MenuItem,
  ORDER_STATUSES,
  OrderStatus,
  RestaurantOrder,
  RestaurantSettings,
  SpiceLevel,
} from '../types/restaurant';

type AdminTab = 'orders' | 'menu' | 'categories' | 'settings';

interface FirestoreOrderDoc {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderType: 'Delivery' | 'Pickup';
  instructions: string;
  items: { itemId: string; name: string; pricePkr: number; quantity: number; lineTotal: number }[];
  subtotalPkr: number;
  deliveryChargePkr: number;
  totalPkr: number;
  paymentMethod: 'Cash on Delivery' | 'Pay at Pickup';
  status: OrderStatus;
  createdAt?: { toMillis?: () => number } | null;
}

const PRESET_IMAGES = [
  { label: 'Chicken Grilled Burger', url: BRAND_ASSETS.menuGrilledBurger },
  { label: 'Jumbo Zinger Burger', url: BRAND_ASSETS.menuZingerBurger },
  { label: 'Loaded Snack Pack', url: BRAND_ASSETS.menuSnackPack },
  { label: 'Regular Fries', url: BRAND_ASSETS.menuCrispyFries },
  { label: 'Arabian Special Shawarma', url: BRAND_ASSETS.welcomeShawarmaCloseup },
  { label: 'Shawarma Platter', url: BRAND_ASSETS.menuShawarmaPlatter },
  { label: 'House Sauces', url: BRAND_ASSETS.menuSaucesDips },
  { label: 'Chilled Beverages', url: BRAND_ASSETS.menuBeveragesChilled },
  { label: 'Add-Ons & Toppings', url: BRAND_ASSETS.menuAddonsToppings },
];

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        if (dataUrl.length > 115000) {
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export const AdminPage: React.FC = () => {
  const { user, authReady, isAdmin, checkingAdmin, authError, signInWithGoogle, signOut } =
    useAuth();
  const {
    categories,
    menuItems,
    settings,
    isUsingSampleFallback,
    seedDatabase,
    saveMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    saveCategory,
    deleteCategory,
    saveSettings,
  } = useMenu();

  const [tab, setTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Dish Editor State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCatId, setItemCatId] = useState(categories[0]?.id || 'cat-burgers');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('650');
  const [itemIsSample, setItemIsSample] = useState(false);
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFeatured, setItemFeatured] = useState(false);
  const [itemSpice, setItemSpice] = useState<SpiceLevel>('Mild');
  const [itemPrepMin, setItemPrepMin] = useState('14');
  const [itemImage, setItemImage] = useState<string>(BRAND_ASSETS.menuShawarmaPlatter);

  // Category Editor State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState('1');
  const [catActive, setCatActive] = useState(true);

  // Settings Editor State
  const [settingsDraft, setSettingsDraft] = useState<RestaurantSettings>(settings);

  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (!authReady || !isAdmin) return;
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      ordersQuery,
      (snap) => {
        const list: RestaurantOrder[] = snap.docs.map((d) => {
          const data = d.data() as FirestoreOrderDoc;
          return {
            id: d.id,
            orderNumber: data.orderNumber,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            deliveryAddress: data.deliveryAddress,
            orderType: data.orderType,
            instructions: data.instructions,
            items: data.items || [],
            subtotalPkr: Number(data.subtotalPkr || 0),
            deliveryChargePkr: Number(data.deliveryChargePkr || 0),
            totalPkr: Number(data.totalPkr || 0),
            paymentMethod: data.paymentMethod,
            status: data.status,
            createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
          };
        });
        setOrders(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );
    return () => unsub();
  }, [authReady, isAdmin]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSeed = async () => {
    setBusy(true);
    try {
      await seedDatabase();
      showToast('Official 24-item menu, categories, and settings synced to Firestore.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setBusy(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'order_tracking', orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      showToast(`Order status updated to ${nextStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setBusy(false);
    }
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemName('');
    setItemCatId(categories[0]?.id || 'cat-burgers');
    setItemDesc('');
    setItemPrice('650');
    setItemIsSample(false);
    setItemAvailable(true);
    setItemFeatured(false);
    setItemSpice('Mild');
    setItemPrepMin('14');
    setItemImage(BRAND_ASSETS.menuShawarmaPlatter);
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCatId(item.categoryId);
    setItemDesc(item.description);
    setItemPrice(String(item.pricePkr));
    setItemIsSample(item.isSamplePrice);
    setItemAvailable(item.available);
    setItemFeatured(item.featured);
    setItemSpice(item.spiceLevel);
    setItemPrepMin(String(item.prepTimeMinutes));
    setItemImage(item.imageUrl);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFileToDataUrl(file);
      setItemImage(compressed);
      showToast('Food image compressed and ready to save.');
    } catch {
      showToast('Could not process the selected image file.');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUsingSampleFallback) {
      await seedDatabase();
    }
    const cat = categories.find((c) => c.id === itemCatId) || categories[0];
    const id =
      editingItemId ||
      `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ''
      );
    setBusy(true);
    try {
      await saveMenuItem({
        id,
        name: itemName,
        categoryId: cat.id,
        categoryName: cat.name,
        description: itemDesc,
        pricePkr: Number(itemPrice) || 0,
        isSamplePrice: itemIsSample,
        available: itemAvailable,
        featured: itemFeatured,
        imageUrl: itemImage,
        spiceLevel: itemSpice,
        prepTimeMinutes: Number(itemPrepMin) || 15,
        sortOrder: editingItemId
          ? menuItems.find((m) => m.id === editingItemId)?.sortOrder || menuItems.length + 1
          : menuItems.length + 1,
      });
      resetItemForm();
      showToast('Menu dish saved to Firestore.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUsingSampleFallback) {
      await seedDatabase();
    }
    const slug = catName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = editingCatId || `cat-${slug || Date.now()}`;
    setBusy(true);
    try {
      await saveCategory({
        id,
        name: catName,
        slug: slug || 'category',
        description: catDesc,
        sortOrder: Number(catOrder) || 1,
        active: catActive,
      });
      setEditingCatId(null);
      setCatName('');
      setCatDesc('');
      setCatOrder(String(categories.length + 1));
      setCatActive(true);
      showToast('Category saved.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveSettings(settingsDraft);
      showToast('Restaurant hours and delivery settings updated.');
    } finally {
      setBusy(false);
    }
  };

  // Auth Gate
  if (!authReady || checkingAdmin) {
    return (
      <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 px-4 sm:px-6 flex items-center justify-center">
        <ShawarmaLoader label="Verifying administrator session..." tone="dark" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#050505] text-white min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-[28px] glass-dark p-8 text-center space-y-6">
          <SquircleIcon size="lg" tone="dark" className="mx-auto">
            <Lock className="w-6 h-6" />
          </SquircleIcon>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">
              Arabian Grill House
            </p>
            <h1 className="font-editorial text-3xl font-semibold mt-2">
              Admin Dashboard
            </h1>
            <p className="text-sm text-white/65 mt-3 leading-relaxed">
              Sign in with the verified restaurant owner Google account to manage live orders, menu items, pricing, and opening hours.
            </p>
          </div>

          {authError && (
            <p className="text-xs text-white bg-white/10 border border-white/20 rounded-[12px] p-3">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="w-full py-4 px-6 rounded-[16px] bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-[#050505] text-white min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-[28px] glass-dark p-8 text-center space-y-5">
          <SquircleIcon size="lg" tone="dark" className="mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </SquircleIcon>
          <h1 className="font-editorial text-2xl font-semibold">
            Administrator Access Required
          </h1>
          <p className="text-sm text-white/65 leading-relaxed">
            Signed in as <strong className="text-white">{user.email}</strong>, which is not authorized in the restaurant admin registry.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full py-3.5 px-5 rounded-[16px] border border-white/15 bg-white/10 hover:bg-white/15 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders =
    statusFilter === 'All'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-6 sm:pb-8 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.2em] uppercase text-white/55 mb-2 truncate">
              Restaurant Operations · {user.email}
            </p>
            <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight">
              Management Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isUsingSampleFallback && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSeed()}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-3 rounded-[15px] bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] text-xs font-bold uppercase tracking-wider hover:from-amber-300 hover:to-orange-400 transition-all"
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Sync Official Menu</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-3 rounded-[15px] border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-6 p-4 rounded-[16px] bg-white text-[#050505] text-xs font-semibold flex items-center gap-2.5 shadow-lg">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
          {(
            [
              { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
              { id: 'menu', label: `Menu Items (${menuItems.length})`, icon: UtensilsCrossed },
              { id: 'categories', label: `Categories (${categories.length})`, icon: FolderPlus },
              { id: 'settings', label: 'Hours & Delivery', icon: Settings },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-[15px] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 border ${
                tab === id
                  ? 'bg-white text-[#050505] border-white'
                  : 'bg-white/[0.05] text-white/75 border-white/12 hover:bg-white/[0.1]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <section className="mt-8 space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(['All', ...ORDER_STATUSES] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-[12px] text-xs font-medium border whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? 'bg-white text-[#050505] border-white'
                      : 'bg-white/[0.04] text-white/65 border-white/12 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-[24px] glass-dark p-12 text-center text-white/65">
                No orders found for the selected status.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[24px] glass-dark p-6 flex flex-col lg:flex-row justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                        <span className="font-mono-nums text-base font-bold text-white">
                          {order.orderNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{order.orderType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{order.paymentMethod}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-nums">
                          {new Date(order.createdAtMs).toLocaleString('en-PK', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="text-sm">
                        <p className="font-semibold text-white">
                          {order.customerName}{' '}
                          <span className="font-mono-nums font-normal text-white/70">
                            ({order.customerPhone})
                          </span>
                        </p>
                        <p className="text-white/65 mt-0.5">{order.deliveryAddress}</p>
                        {order.instructions && (
                          <p className="text-xs text-white/55 mt-1">
                            Instructions: {order.instructions}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 space-y-1 text-xs text-white/75">
                        {order.items.map((line, i) => (
                          <div key={i} className="font-mono-nums">
                            {line.name} × {line.quantity} — Rs.{' '}
                            {line.lineTotal.toLocaleString('en-PK')}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-4 shrink-0">
                      <div className="lg:text-right">
                        <p className="text-xs text-white/50">Total Amount</p>
                        <p className="font-mono-nums text-2xl font-bold">
                          Rs. {order.totalPkr.toLocaleString('en-PK')}
                        </p>
                      </div>

                      <div className="w-full sm:w-52">
                        <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5">
                          Update Order Status
                        </label>
                        <select
                          value={order.status}
                          disabled={busy}
                          onChange={(e) =>
                            void handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="w-full px-3.5 py-2.5 rounded-[13px] bg-neutral-900 border border-white/20 text-xs font-semibold text-white focus:outline-none"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MENU ITEMS TAB */}
        {tab === 'menu' && (
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleSaveItem}
              className="lg:col-span-5 rounded-[26px] glass-dark p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-2xl font-semibold">
                  {editingItemId ? 'Edit Dish' : 'Add New Dish'}
                </h2>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={resetItemForm}
                    className="text-xs text-white/60 hover:text-white underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Dish Name *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Royal Arabian Shawarma"
                  className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Category</label>
                  <select
                    value={itemCatId}
                    onChange={(e) => setItemCatId(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-3 rounded-[14px] bg-neutral-900 border border-white/14 text-base sm:text-sm text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100000}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm font-mono-nums text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  maxLength={400}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Ingredients, preparation style, and accompaniments..."
                  className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Spice Level</label>
                  <select
                    value={itemSpice}
                    onChange={(e) => setItemSpice(e.target.value as SpiceLevel)}
                    className="w-full min-h-[46px] px-3.5 py-3 rounded-[14px] bg-neutral-900 border border-white/14 text-base sm:text-sm text-white focus:outline-none"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Signature Blend">Signature Blend</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Prep Time (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={itemPrepMin}
                    onChange={(e) => setItemPrepMin(e.target.value)}
                    className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm font-mono-nums text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">
                  Food Image (Upload or Choose Studio Asset)
                </label>
                <div className="flex items-center gap-3 mb-2.5">
                  <SmartImage
                    src={itemImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-[12px] object-cover border border-white/15 shrink-0"
                  />
                  <label className="flex-1 cursor-pointer px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 hover:bg-white/[0.1] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <select
                  value={
                    PRESET_IMAGES.some((p) => p.url === itemImage) ? itemImage : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) setItemImage(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-neutral-900 border border-white/12 text-xs text-white/80 focus:outline-none"
                >
                  <option value="">Use uploaded photo / Select preset...</option>
                  {PRESET_IMAGES.map((p) => (
                    <option key={p.label} value={p.url}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemAvailable}
                    onChange={(e) => setItemAvailable(e.target.checked)}
                    className="rounded"
                  />
                  <span>Available</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFeatured}
                    onChange={(e) => setItemFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span>Featured</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemIsSample}
                    onChange={(e) => setItemIsSample(e.target.checked)}
                    className="rounded"
                  />
                  <span>Mark as Sample Price</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 px-5 rounded-[15px] bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{editingItemId ? 'Update Dish' : 'Add Dish to Menu'}</span>
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] glass-dark p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-[13px] object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] text-white/50">
                        {item.categoryName} · {item.isSamplePrice ? 'Sample Price' : 'Verified Price'}
                      </p>
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="font-mono-nums text-xs text-white/80 mt-0.5">
                        Rs. {item.pricePkr.toLocaleString('en-PK')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleItemAvailability(item)}
                      className={`px-3 py-2 rounded-[11px] text-xs font-semibold border ${
                        item.available
                          ? 'bg-white text-[#050505] border-white'
                          : 'bg-white/5 text-white/55 border-white/15'
                      }`}
                    >
                      {item.available ? 'Available' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditItem(item)}
                      aria-label={`Edit ${item.name}`}
                      className="w-9 h-9 rounded-[11px] border border-white/15 bg-white/5 hover:bg-white/15 inline-flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deleteMenuItem(item.id)}
                      aria-label={`Delete ${item.name}`}
                      className="w-9 h-9 rounded-[11px] border border-white/15 bg-white/5 hover:bg-white/15 inline-flex items-center justify-center text-white/70 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATEGORIES TAB */}
        {tab === 'categories' && (
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleSaveCategory}
              className="lg:col-span-5 rounded-[26px] glass-dark p-6 space-y-4"
            >
              <h2 className="font-editorial text-2xl font-semibold">
                {editingCatId ? 'Edit Category' : 'Add Menu Category'}
              </h2>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Charcoal Platters"
                  className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  maxLength={240}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-base sm:text-sm font-mono-nums text-white focus:outline-none"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-xs min-[375px]:pt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catActive}
                    onChange={(e) => setCatActive(e.target.checked)}
                  />
                  <span>Active on Storefront</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 px-5 rounded-[15px] bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider"
              >
                {editingCatId ? 'Update Category' : 'Save Category'}
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {categories.map((cat: MenuCategory) => (
                <div
                  key={cat.id}
                  className="rounded-[20px] glass-dark p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-white/50 font-mono-nums">
                      Order #{cat.sortOrder} · {cat.active ? 'Visible' : 'Hidden'}
                    </p>
                    <p className="text-base font-semibold mt-0.5">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-white/60 mt-1">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setCatName(cat.name);
                        setCatDesc(cat.description || '');
                        setCatOrder(String(cat.sortOrder));
                        setCatActive(cat.active);
                      }}
                      className="w-9 h-9 rounded-[11px] border border-white/15 bg-white/5 hover:bg-white/15 inline-flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deleteCategory(cat.id)}
                      className="w-9 h-9 rounded-[11px] border border-white/15 bg-white/5 hover:bg-white/15 inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="mt-8 max-w-2xl rounded-[26px] glass-dark p-6 sm:p-8 space-y-5"
          >
            <h2 className="font-editorial text-2xl font-semibold">
              Opening Hours & Delivery Rules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Opening Time</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={settingsDraft.openTime}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, openTime: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Closing Time</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={settingsDraft.closeTime}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, closeTime: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                Opening Hours Notice
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={settingsDraft.hoursNote}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, hoursNote: e.target.value })
                }
                className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">
                  Delivery Fee (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={settingsDraft.deliveryChargePkr}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      deliveryChargePkr: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-sm font-mono-nums text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">
                  Free Delivery Threshold (PKR, 0 = off)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={settingsDraft.freeDeliveryThresholdPkr}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      freeDeliveryThresholdPkr: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 rounded-[14px] bg-white/[0.06] border border-white/14 text-sm font-mono-nums text-white focus:outline-none"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={settingsDraft.isAcceptingOrders}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    isAcceptingOrders: e.target.checked,
                  })
                }
              />
              <span>Accepting Online Orders</span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 px-6 rounded-[16px] bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider"
            >
              Save Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
