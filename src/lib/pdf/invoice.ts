import PDFDocument from 'pdfkit';

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

export function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      const grandTotal = data.finalAmountPaise / 100;
      const baseAmount = grandTotal / 1.18;
      const cgst = baseAmount * 0.09;
      const sgst = baseAmount * 0.09;
      
      const formatCurrency = (val: number) => `Rs. ${val.toFixed(2)}`;

      // HEADER
      doc.fontSize(20).font('Helvetica-Bold').text('ATHLETE PARK SPORTS', 50, 50);
      doc.text('ACADEMY', 50, 75);
      
      doc.fontSize(10).font('Helvetica')
         .text('Rathnapuri Main Road, Hunsur, Mysuru, Karnataka - 571105', 50, 100)
         .text('Building No.: 3541/1, 3541/2, 3541/7, 3541/8', 50, 115)
         .font('Helvetica-Bold')
         .text('GSTIN: 29AAWAA4734A1ZN', 50, 130);

      // TAX INVOICE (Right Aligned)
      doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10).font('Helvetica')
         .text(`Invoice No.: ${data.bookingRef}`, 350, 75, { align: 'right' })
         .text(`Invoice Date: ${data.dateStr}`, 350, 90, { align: 'right' })
         .text(`Place of Supply: Karnataka`, 350, 105, { align: 'right' });

      // Horizontal Line
      doc.moveTo(50, 150).lineTo(545, 150).strokeColor('#aa0000').lineWidth(2).stroke();
      doc.strokeColor('#000000').lineWidth(1);

      // BILL TO SECTION
      const startY = 170;
      doc.fontSize(11).font('Helvetica-Bold').text('BILL TO', 50, startY);
      doc.fontSize(10).font('Helvetica')
         .text(`Customer / Company Name: ${data.customerName}`, 50, startY + 20)
         .text(`Address: `, 50, startY + 35)
         .text(`GSTIN (if applicable): `, 50, startY + 50)
         .text(`Contact / Email: ${data.customerPhone}`, 50, startY + 65);

      // BOOKING DETAILS SECTION
      doc.fontSize(11).font('Helvetica-Bold').text('BOOKING DETAILS', 300, startY);
      doc.fontSize(10).font('Helvetica')
         .text(`Booking / Reference No.:`, 300, startY + 20)
         .text(data.bookingRef, 300, startY + 35)
         .text(`Payment Mode:`, 300, startY + 50)
         .text(`UPI`, 300, startY + 65);

      // Divider lines for sections
      doc.moveTo(50, startY + 85).lineTo(545, startY + 85).strokeColor('#e5e5e5').stroke();

      // TABLE HEADER
      const tableTop = 280;
      doc.font('Helvetica-Bold');
      doc.text('Serial Number', 50, tableTop, { width: 90, align: 'center' });
      doc.text('Sports Booked For', 150, tableTop, { width: 150, align: 'center' });
      doc.text('Time Slot', 310, tableTop, { width: 130, align: 'center' });
      doc.text('Amount', 450, tableTop, { width: 90, align: 'center' });

      // Draw table header lines
      doc.moveTo(50, tableTop - 10).lineTo(545, tableTop - 10).strokeColor('#e5e5e5').stroke();
      doc.moveTo(50, tableTop + 20).lineTo(545, tableTop + 20).strokeColor('#e5e5e5').stroke();

      // TABLE ROW
      const rowTop = tableTop + 40;
      doc.font('Helvetica');
      doc.text('1', 50, rowTop, { width: 90, align: 'center' });
      doc.text(data.sportNames, 150, rowTop, { width: 150, align: 'center' });
      doc.text(data.timeSlots, 310, rowTop, { width: 130, align: 'center' });
      doc.text(formatCurrency(baseAmount), 450, rowTop, { width: 90, align: 'right' });

      // Draw table bottom line
      doc.moveTo(50, rowTop + 30).lineTo(545, rowTop + 30).strokeColor('#e5e5e5').stroke();

      // TOTALS SECTION
      const totalsTop = rowTop + 50;
      doc.font('Helvetica');
      doc.text('Subtotal', 50, totalsTop);
      doc.text(formatCurrency(baseAmount), 450, totalsTop, { width: 90, align: 'right' });

      doc.text('CGST', 50, totalsTop + 20);
      doc.text(formatCurrency(cgst), 450, totalsTop + 20, { width: 90, align: 'right' });

      doc.text('SGST', 50, totalsTop + 40);
      doc.text(formatCurrency(sgst), 450, totalsTop + 40, { width: 90, align: 'right' });

      doc.text('IGST', 50, totalsTop + 60);
      doc.text('-', 450, totalsTop + 60, { width: 90, align: 'right' });

      doc.moveTo(50, totalsTop + 80).lineTo(545, totalsTop + 80).strokeColor('#e5e5e5').stroke();

      doc.font('Helvetica-Bold');
      doc.text('GRAND TOTAL', 50, totalsTop + 90);
      doc.text(formatCurrency(grandTotal), 450, totalsTop + 90, { width: 90, align: 'right' });

      doc.moveTo(50, totalsTop + 110).lineTo(545, totalsTop + 110).strokeColor('#000000').stroke();

      // AMOUNT IN WORDS
      const wordsTop = totalsTop + 140;
      doc.font('Helvetica-Bold');
      doc.text('Amount in Words', 50, wordsTop);
      doc.font('Helvetica');
      doc.text(`Rupees ${numberToWords(Math.round(grandTotal))} only.`, 50, wordsTop + 15);

      // SIGNATORY
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('For ATHLETE PARK SPORTS ACADEMY', 250, wordsTop, { align: 'right', width: 295 });
      doc.font('Helvetica').fontSize(9);
      doc.text('Authorized Signatory', 250, wordsTop + 40, { align: 'right', width: 295 });

      // FOOTER
      doc.fontSize(7).fillColor('#666666');
      doc.text(
        'ATHLETE PARK SPORTS ACADEMY • Rathnapuri Main Road, Hunsur, Mysuru, Karnataka - 571105 • GSTIN 29AAWAA4734A1ZN',
        50,
        780,
        { align: 'center', width: 495 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
