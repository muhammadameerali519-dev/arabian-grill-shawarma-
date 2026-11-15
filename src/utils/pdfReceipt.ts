import { jsPDF } from 'jspdf';
import { RESTAURANT_INFO } from '../data/seedData';
import { RestaurantOrder } from '../types/restaurant';

export function downloadOrderReceiptPdf(order: RestaurantOrder): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 22;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(10, 10, 10);
  doc.text('ARABIAN GRILL HOUSE', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  doc.text('Shop #135, Mumtaz Market, GT Rd, Civil Lines, Gujranwala', pageWidth / 2, y, {
    align: 'center',
  });
  y += 4.5;
  doc.text(`Phone / WhatsApp: ${RESTAURANT_INFO.phoneDisplay}`, pageWidth / 2, y, {
    align: 'center',
  });

  y += 7;
  doc.setDrawColor(210, 210, 210);
  doc.line(20, y, pageWidth - 20, y);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 10, 10);
  doc.text('ORDER RECEIPT', 20, y);

  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text(order.orderNumber, pageWidth - 20, y, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  const formattedDate = new Date(order.createdAtMs).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(`Date & Time: ${formattedDate}`, 20, y);
  const statusDisplay =
    order.status === 'New Order' ? 'Awaiting Restaurant Confirmation' : order.status;
  doc.text(`Status: ${statusDisplay}`, pageWidth - 20, y, { align: 'right' });

  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(20, y, pageWidth - 20, y);

  // Customer info
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(10, 10, 10);
  doc.text('CUSTOMER DETAILS', 20, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${order.customerName}`, 20, y);
  y += 5.5;
  doc.text(`Phone: ${order.customerPhone}`, 20, y);
  y += 5.5;
  doc.text(`Order Type: ${order.orderType}`, 20, y);
  y += 5.5;
  doc.text(`Payment Method: ${order.paymentMethod}`, 20, y);
  y += 5.5;

  const addressText =
    order.orderType === 'Pickup'
      ? 'Pickup at Arabian Grill House (Mumtaz Market, GT Rd, Gujranwala)'
      : order.deliveryAddress;
  const wrappedAddress = doc.splitTextToSize(`Address: ${addressText}`, pageWidth - 40);
  doc.text(wrappedAddress, 20, y);
  y += wrappedAddress.length * 5;

  if (order.instructions?.trim()) {
    const wrappedNotes = doc.splitTextToSize(
      `Instructions: ${order.instructions.trim()}`,
      pageWidth - 40
    );
    doc.text(wrappedNotes, 20, y);
    y += wrappedNotes.length * 5;
  }

  y += 5;
  doc.setDrawColor(210, 210, 210);
  doc.line(20, y, pageWidth - 20, y);

  // Items header
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ITEM', 20, y);
  doc.text('QTY', 124, y, { align: 'right' });
  doc.text('PRICE', 155, y, { align: 'right' });
  doc.text('TOTAL', pageWidth - 20, y, { align: 'right' });

  y += 3.5;
  doc.setDrawColor(235, 235, 235);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const item of order.items) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    const nameLines = doc.splitTextToSize(item.name, 95);
    doc.text(nameLines, 20, y);
    doc.text(String(item.quantity), 124, y, { align: 'right' });
    doc.text(`Rs. ${item.pricePkr.toLocaleString('en-PK')}`, 155, y, { align: 'right' });
    doc.text(`Rs. ${item.lineTotal.toLocaleString('en-PK')}`, pageWidth - 20, y, {
      align: 'right',
    });
    y += Math.max(6.5, nameLines.length * 5.2);
  }

  y += 3;
  doc.setDrawColor(210, 210, 210);
  doc.line(20, y, pageWidth - 20, y);

  // Totals
  y += 8;
  doc.setFontSize(10);
  doc.text('Subtotal', 125, y);
  doc.text(`Rs. ${order.subtotalPkr.toLocaleString('en-PK')}`, pageWidth - 20, y, {
    align: 'right',
  });

  y += 6;
  const deliveryText =
    order.orderType === 'Pickup'
      ? 'Rs. 0 (Self-Pickup)'
      : order.deliveryChargePkr > 0
        ? `Rs. ${order.deliveryChargePkr.toLocaleString('en-PK')}`
        : 'Confirm on WhatsApp';
  doc.text('Delivery Charges', 125, y);
  doc.text(deliveryText, pageWidth - 20, y, {
    align: 'right',
  });

  y += 4;
  doc.line(125, y, pageWidth - 20, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(order.orderType === 'Delivery' && order.deliveryChargePkr === 0 ? 'ITEMS TOTAL' : 'GRAND TOTAL', 125, y);
  doc.text(`Rs. ${order.totalPkr.toLocaleString('en-PK')}`, pageWidth - 20, y, {
    align: 'right',
  });

  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(
    'Note: Delivery charges & order confirmation are finalized directly on WhatsApp (+92 331 1073628).',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  const safeFilename = `${order.orderNumber.replace('#', '')}_Receipt.pdf`;
  doc.save(safeFilename);
}
