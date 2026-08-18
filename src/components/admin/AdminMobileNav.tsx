"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/lib/actions/admin";
import { Menu, X } from "lucide-react";
import { links } from "./AdminNav";

interface AdminMobileNavProps {
  email?: string;
  role?: string;
}

export function AdminMobileNav({ email, role }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  const handleLinkClick = () => setIsOpen(false);

  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-truf-dark px-4 shadow-md">
      <Link href="/admin" className="text-lg font-black tracking-widest text-truf-lime uppercase" onClick={handleLinkClick}>
        TRUF Admin
      </Link>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-truf-lime/10 text-truf-lime hover:bg-truf-lime/20"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-white/5 bg-truf-dark shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 space-y-1">
            {links.map((link) => {
              const isActive = link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-truf-lime/10 text-truf-lime"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white truncate max-w-[150px]">
                {email || "Admin User"}
              </span>
              <span className="text-xs text-white/50 capitalize">
                {role || "admin"}
              </span>
            </div>
            <button 
              onClick={() => adminLogoutAction()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
