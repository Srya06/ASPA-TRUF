"use client";

import { usePathname } from "next/navigation";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/super-admin")) {
    return null;
  }
  
  return <>{children}</>;
}
