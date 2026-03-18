import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (order) => {
  const doc = new jsPDF();

  // Branding
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Blue-600
  doc.text('iPhone Ceylon Mobile', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('A Legacy of Premium Devices', 105, 26, { align: 'center' });

  // Invoice Details
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.text(`Invoice ID: ${order._id.substring(order._id.length - 8).toUpperCase()}`, 14, 45);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 52);
  doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 14, 59);

  // Customer Info
  doc.setFontSize(14);
  doc.text('Bill To:', 14, 75);
  doc.setFontSize(11);
  doc.text(order.customerInfo.name, 14, 82);
  doc.text(order.customerInfo.address, 14, 88);
  doc.text(`${order.customerInfo.city}, Sri Lanka`, 14, 94);
  doc.text(order.customerInfo.phone, 14, 100);

  // Items Table
  const tableData = order.orderItems.map(item => [
    item.name,
    `Rs. ${item.price.toLocaleString()}`,
    item.quantity,
    `Rs. ${(item.price * item.quantity).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 110,
    head: [['Product', 'Unit Price', 'Qty', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { top: 110 }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Shipping: Rs. 0.00`, 196, finalY, { align: 'right' });
  doc.setFontSize(16);
  doc.text(`Total: Rs. ${order.totalAmount.toLocaleString()}`, 196, finalY + 8, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for choosing iPhone Ceylon Mobile!', 105, 280, { align: 'center' });
  doc.text('For support, contact support@iphonemobileceylon.com', 105, 285, { align: 'center' });

  doc.save(`Invoice_${order._id.substring(order._id.length - 6)}.pdf`);
};
