# Security Specification — Arabian Grill House

## 1. Data Invariants
1. **Menu & Categories**: Only verified administrators (`isAdmin()`) may create, update, or delete `/categories/{categoryId}` and `/menu_items/{itemId}`. Public visitors may read active menu items and categories. Every `menu_items` write must reference an existing parent `/categories/{categoryId}` document.
2. **PII Isolation on Orders**: `/orders/{orderId}` contains customer PII (`customerName`, `customerPhone`, `deliveryAddress`). Public guests can ONLY `create` a new order with `status == 'New Order'` and valid server timestamps (`createdAt == request.time`, `updatedAt == request.time`). Only verified administrators (`isAdmin()`) can `get`, `list`, `update`, or `delete` `/orders/{orderId}`.
3. **Non-PII Status Tracking**: `/order_tracking/{orderId}` stores only `{ orderNumber, status, updatedAt }` with zero PII. Guests can `get` only a specific document ID (never `list`). Atomic batch creation verifies `existsAfter(/databases/$(database)/documents/orders/$(orderId))` and `existsAfter(/databases/$(database)/documents/order_tracking/$(orderId))`.
4. **Admin Escalation Prevention**: Only verified emails (`request.auth.token.email_verified == true`) matching the bootstrapped owner email or present in `/admins/{uid}` are treated as admins. Regular users cannot write to `/admins/{adminUid}`.
5. **Terminal Order Locking & Strict Schema**: Every string has explicit `.size()` bounds, every document ID passes `isValidId()`, and every `create`/`update` enforces exact key allowlists (`hasAll`/`hasOnly` and `affectedKeys().hasOnly()`).

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Menu Mutation**: Anonymous user attempts `setDoc('/menu_items/item1', ...)` -> DENIED (`isAdmin()` false).
2. **Unverified Admin Email Spoof**: Signed-in user with `email_verified: false` and owner email attempts `getDocs('/orders')` -> DENIED (`email_verified == true` check fails).
3. **PII Blanket Read**: Non-admin signed-in user attempts `getDoc('/orders/order_123')` -> DENIED (`isAdmin()` false).
4. **Order List Scraping**: Non-admin user attempts `getDocs('/orders')` -> DENIED (`allow list` requires `isAdmin()`).
5. **Order Status Shortcutting on Create**: Guest attempts to create order with `status: 'Completed'` instead of `'New Order'` -> DENIED (`incoming().status == 'New Order'`).
6. **Shadow Field Injection on Order**: Guest creates order with extra `{ isPaid: true }` or `{ isAdmin: true }` -> DENIED (`hasOnly` rejects unknown keys).
7. **Timestamp Forgery on Order**: Guest submits `createdAt: Timestamp(2020-01-01)` instead of `serverTimestamp()` -> DENIED (`incoming().createdAt == request.time`).
8. **ID Poisoning**: Guest attempts `setDoc('/orders/../../invalid!id', ...)` or 1.5KB ID string -> DENIED (`isValidId()` regex & size `<= 128` fails).
9. **Resource Exhaustion Array**: Guest submits order with `items` array of length 51 (`> 50`) -> DENIED (`items.size() <= 50`).
10. **Order Tracking List Enumeration**: Guest attempts `getDocs('/order_tracking')` -> DENIED (`allow list: if isAdmin()`).
11. **Privilege Escalation**: Non-admin authenticated user attempts `setDoc('/admins/' + uid, { role: 'admin' })` -> DENIED (`isAdmin()` false).
12. **Orphan Menu Item**: Admin attempts to create a `menu_items` doc with non-existent `categoryId` -> DENIED (`exists(/databases/$(database)/documents/categories/$(incoming().categoryId))` fails).
