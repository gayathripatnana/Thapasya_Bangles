// utils/invoiceHelpers.js
// Client-side PDF invoice generation - no backend round-trip needed since every
// field on an order document was already server-verified at checkout time
// (see server/routers/orders.py's _compute_order_totals).
//
// jsPDF + jspdf-autotable are dynamically imported inside downloadOrderInvoice
// rather than statically at the top of this file - they add ~140KB (gzipped) and
// almost nobody who loads the storefront ever clicks "Download Invoice," so it's
// not worth shipping that weight in the main bundle for every visitor.
import { DEFAULT_STORE_SETTINGS } from './settingsHelpers';
import { getAddressLines } from './addressHelpers';
import { getOrderDisplayNumber } from './orderHelpers';

/**
 * Build and download a PDF invoice/receipt for a single order.
 */
export const downloadOrderInvoice = async (order, storeSettings = DEFAULT_STORE_SETTINGS) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const orderNumber = getOrderDisplayNumber(order.id);

  // Store header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Thapasya Bangles', 14, 18);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const storeLines = [
    storeSettings.address,
    storeSettings.contactPhone,
    storeSettings.contactEmail
  ].filter(Boolean);
  doc.text(storeLines, 14, 25);

  // Invoice title + meta
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', pageWidth - 14, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '-';
  doc.text([
    `Order #${orderNumber}`,
    `Date: ${orderDate}`,
    order.razorpayPaymentId ? `Payment Ref: ${order.razorpayPaymentId}` : ''
  ].filter(Boolean), pageWidth - 14, 25, { align: 'right' });

  // Bill To
  let y = 45;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const billToLines = [
    order.customerName || 'N/A',
    order.customerPhone || '',
    order.customerEmail || '',
    ...getAddressLines(order.address)
  ].filter(Boolean);
  doc.text(billToLines, 14, y);

  y += billToLines.length * 5 + 8;

  // Items table
  const items = order.items || [];
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Size', 'Qty', 'Price', 'Amount']],
    body: items.map((item) => [
      item.name || '-',
      item.selectedSize || '-',
      String(item.quantity || 0),
      `Rs.${(item.price || 0).toLocaleString('en-IN')}`,
      `Rs.${((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [234, 179, 8] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 }
  });

  const afterTableY = doc.lastAutoTable.finalY + 8;

  // Totals
  const totalsX = pageWidth - 14;
  doc.setFontSize(10);
  doc.text(`Subtotal: Rs.${(order.subtotal || 0).toLocaleString('en-IN')}`, totalsX, afterTableY, { align: 'right' });
  doc.text(
    `Delivery: ${order.deliveryCharges ? `Rs.${order.deliveryCharges.toLocaleString('en-IN')}` : 'FREE'}`,
    totalsX,
    afterTableY + 6,
    { align: 'right' }
  );
  doc.setFont(undefined, 'bold');
  doc.text(`Total: Rs.${(order.total || 0).toLocaleString('en-IN')}`, totalsX, afterTableY + 14, { align: 'right' });

  // Footer note
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    'This is a computer-generated invoice and does not require a signature.',
    14,
    doc.internal.pageSize.getHeight() - 12
  );

  doc.save(`Invoice-${orderNumber}.pdf`);
};
