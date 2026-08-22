import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface InvoiceData {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  sportNames: string;
  timeSlots: string;
  finalAmountPaise: number;
  dateStr: string;
}

// Helper to convert numbers to words
function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString().replace(/[\, ]/g, '') as any) != parseFloat(num as any)) return 'not a number';
  let n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  return str.trim();
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { height } = page.getSize();
  
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const grandTotal = data.finalAmountPaise / 100;
  const baseAmount = grandTotal;
  const cgst = 0;
  const sgst = 0;
  
  const formatCurrency = (val: number) => `Rs. ${val.toFixed(2)}`;
  
  const drawText = (text: string, x: number, y: number, size: number, isBold = false, align = 'left') => {
    const font = isBold ? fontBold : fontRegular;
    const textWidth = font.widthOfTextAtSize(text, size);
    let finalX = x;
    if (align === 'right') finalX = x - textWidth;
    if (align === 'center') finalX = x - (textWidth / 2);
    
    page.drawText(text, { x: finalX, y: height - y, size, font, color: rgb(0,0,0) });
  };
  
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = rgb(0.8,0.8,0.8), thickness = 1) => {
    page.drawLine({ start: { x: x1, y: height - y1 }, end: { x: x2, y: height - y2 }, color, thickness });
  };

  // HEADER
  drawText('ATHLETE PARK SPORTS', 50, 50, 20, true);
  drawText('ACADEMY', 50, 75, 20, true);
  
  drawText('Rathnapuri Main Road, Hunsur, Mysuru, Karnataka - 571105', 50, 100, 10);
  drawText('Building No.: 3541/1, 3541/2, 3541/7, 3541/8', 50, 115, 10);
  drawText('GSTIN: 29AAWAA4734A1ZN', 50, 130, 10, true);

  // TAX INVOICE (Right Aligned)
  drawText('TAX INVOICE', 545, 50, 16, true, 'right');
  drawText(`Invoice No.: ${data.bookingRef}`, 545, 75, 10, false, 'right');
  drawText(`Invoice Date: ${data.dateStr}`, 545, 90, 10, false, 'right');
  drawText(`Place of Supply: Karnataka`, 545, 105, 10, false, 'right');

  // Horizontal Line
  drawLine(50, 150, 545, 150, rgb(0.66, 0, 0), 2);

  // BILL TO SECTION
  const startY = 170;
  drawText('BILL TO', 50, startY, 11, true);
  drawText(`Customer / Company Name: ${data.customerName}`, 50, startY + 20, 10);
  drawText(`Address: `, 50, startY + 35, 10);
  drawText(`GSTIN (if applicable): `, 50, startY + 50, 10);
  drawText(`Contact / Email: ${data.customerPhone}`, 50, startY + 65, 10);

  // BOOKING DETAILS SECTION
  drawText('BOOKING DETAILS', 300, startY, 11, true);
  drawText(`Booking / Reference No.:`, 300, startY + 20, 10);
  drawText(data.bookingRef, 300, startY + 35, 10);
  drawText(`Payment Mode:`, 300, startY + 50, 10);
  drawText(`UPI`, 300, startY + 65, 10);

  // Divider lines for sections
  drawLine(50, startY + 85, 545, startY + 85);

  // TABLE HEADER
  const tableTop = 280;
  drawText('Serial Number', 95, tableTop, 10, true, 'center');
  drawText('Sports Booked For', 225, tableTop, 10, true, 'center');
  drawText('Time Slot', 375, tableTop, 10, true, 'center');
  drawText('Amount', 495, tableTop, 10, true, 'center');

  // Draw table header lines
  drawLine(50, tableTop - 15, 545, tableTop - 15);
  drawLine(50, tableTop + 5, 545, tableTop + 5);

  // TABLE ROW
  const rowTop = tableTop + 25;
  drawText('1', 95, rowTop, 10, false, 'center');
  drawText(data.sportNames, 225, rowTop, 10, false, 'center');
  drawText(data.timeSlots, 375, rowTop, 10, false, 'center');
  drawText(formatCurrency(baseAmount), 540, rowTop, 10, false, 'right');

  // Draw table bottom line
  drawLine(50, rowTop + 15, 545, rowTop + 15);

  // TOTALS SECTION
  const totalsTop = rowTop + 35;
  drawText('Subtotal', 50, totalsTop, 10);
  drawText(formatCurrency(baseAmount), 540, totalsTop, 10, false, 'right');

  drawText('CGST', 50, totalsTop + 20, 10);
  drawText(formatCurrency(cgst), 540, totalsTop + 20, 10, false, 'right');

  drawText('SGST', 50, totalsTop + 40, 10);
  drawText(formatCurrency(sgst), 540, totalsTop + 40, 10, false, 'right');

  drawText('IGST', 50, totalsTop + 60, 10);
  drawText('-', 540, totalsTop + 60, 10, false, 'right');

  drawLine(50, totalsTop + 75, 545, totalsTop + 75);

  drawText('GRAND TOTAL', 50, totalsTop + 90, 10, true);
  drawText(formatCurrency(grandTotal), 540, totalsTop + 90, 10, true, 'right');

  drawLine(50, totalsTop + 105, 545, totalsTop + 105, rgb(0,0,0), 1);

  // AMOUNT IN WORDS
  const wordsTop = totalsTop + 130;
  drawText('Amount in Words', 50, wordsTop, 10, true);
  drawText(`Rupees ${numberToWords(Math.round(grandTotal))} only.`, 50, wordsTop + 15, 10);

  // SIGNATORY
  drawText('For ATHLETE PARK SPORTS ACADEMY', 545, wordsTop, 9, true, 'right');
  drawText('Authorized Signatory', 545, wordsTop + 40, 9, false, 'right');

  // FOOTER
  drawText(
    'ATHLETE PARK SPORTS ACADEMY • Rathnapuri Main Road, Hunsur, Mysuru, Karnataka - 571105 • GSTIN 29AAWAA4734A1ZN',
    297.5,
    800,
    7,
    false,
    'center'
  );

  return await pdfDoc.save();
}
