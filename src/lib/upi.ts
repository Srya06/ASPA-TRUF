export function generateUPIIntent(
  payeeVPA: string,
  payeeName: string,
  amount: number, // in INR
  transactionRef: string,
  transactionNote: string = "TRUF Sports Booking"
): string {
  // upi://pay?pa=...&pn=...&am=...&cu=INR&tr=...&tn=...
  const url = new URL("upi://pay");
  url.searchParams.append("pa", payeeVPA);
  url.searchParams.append("pn", payeeName);
  url.searchParams.append("am", amount.toFixed(2));
  url.searchParams.append("cu", "INR");
  url.searchParams.append("tr", transactionRef);
  url.searchParams.append("tn", transactionNote);
  
  return url.toString();
}

export function generateBookingRef(): string {
  // e.g., TRUF-BKG-8A72K
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TRUF-BKG-${randomStr}`;
}

export function generatePaymentRef(bookingRef: string): string {
  // e.g., TRUF-BKG-8A72K-PAY-001 (simplified to avoid incrementing versions for now)
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${bookingRef}-PAY-${randomStr}`;
}
