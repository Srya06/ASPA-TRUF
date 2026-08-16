"use client";

import { useAdminNotifications } from "@/components/admin/NotificationProvider";
import Link from "next/link";

export function AdminHeader({ title }: { title: string }) {
  const { isConnected } = useAdminNotifications();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-truf-dark px-8">
      <h1 className="text-lg font-bold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Live connection badge */}
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-truf-darker px-3 py-1.5">
          <span className={`relative flex h-2 w-2 rounded-full ${isConnected ? "bg-truf-lime" : "bg-amber-500"}`}>
            {isConnected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-truf-lime opacity-75" />
            )}
          </span>
          <span className="text-xs text-white/50">{isConnected ? "Live" : "Reconnecting…"}</span>
        </div>
        <Link href="/" target="_blank" className="text-xs text-white/40 hover:text-white">
          View Site ↗
        </Link>
      </div>
    </header>
  );
}
