export const otpStore = (globalThis as any).__otps || new Map<string, { code: string; expiresAt: number }>();

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).__otps = otpStore;
}
