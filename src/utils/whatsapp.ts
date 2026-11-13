import { RESTAURANT_INFO } from '../data/seedData';
import { RestaurantOrder } from '../types/restaurant';

export function formatWhatsAppOrderMessage(order: RestaurantOrder): string {
  const itemLines = order.items
    .map(
      (line) =>
        `${line.name} × ${line.quantity} — Rs. ${line.lineTotal.toLocaleString('en-PK')}`
    )
    .join('\n');

  const addressDisplay =
    order.orderType === 'Pickup'
      ? 'Self-Pickup at Arabian Grill House, Mumtaz Market, Gujranwala'
      : order.deliveryAddress || 'Not specified';

  const instructionsDisplay = order.instructions?.trim()
    ? order.instructions.trim()
    : 'None';

  return [
    'ARABIAN GRILL HOUSE — NEW ORDER',
    '',
    `Order ID: ${order.orderNumber}`,
    '',
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Order Type: ${order.orderType}`,
    '',
    'ORDER DETAILS:',
    itemLines,
    '',
    `Subtotal: Rs. ${order.subtotalPkr.toLocaleString('en-PK')}`,
    `Delivery: Rs. ${order.deliveryChargePkr.toLocaleString('en-PK')}`,
    `TOTAL: Rs. ${order.totalPkr.toLocaleString('en-PK')}`,
    '',
    `Address: ${addressDisplay}`,
    `Instructions: ${instructionsDisplay}`,
    '',
    'Please confirm my order.',
  ].join('\n');
}

export function buildWhatsAppOrderUrl(order: RestaurantOrder): string {
  const text = encodeURIComponent(formatWhatsAppOrderMessage(order));
  return `https://wa.me/${RESTAURANT_INFO.whatsappIntl}?text=${text}`;
}

export function buildGeneralWhatsAppUrl(prefillMessage?: string): string {
  const msg = encodeURIComponent(
    prefillMessage ||
      'Assalam-o-Alaikum Arabian Grill House, I would like to place an order / inquire about today’s menu.'
  );
  return `https://wa.me/${RESTAURANT_INFO.whatsappIntl}?text=${msg}`;
}
