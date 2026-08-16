"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface AdminEvent {
  type: string;
  payload: any;
  timestamp: string;
}

interface NotificationContextType {
  lastEvent: AdminEvent | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  lastEvent: null,
  isConnected: false,
});

export const useAdminNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [lastEvent, setLastEvent] = useState<AdminEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = new EventSource("/api/admin/events");

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent({
            type: data.type,
            payload: data.payload,
            timestamp: new Date().toISOString(),
          });

          // Show Toast
          const id = Math.random().toString(36).substring(7);
          let message = "New Event received";
          if (data.type === "booking_confirmed") {
            message = "A new booking was just confirmed!";
            // Invalidate router cache to refresh data if on bookings/calendar page
            router.refresh();
          }

          setToasts((prev) => [...prev, { id, message }]);

          // Auto remove toast
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 5000);
        } catch (err) {
          console.error("Error parsing SSE data", err);
        }
      };

      eventSource.onerror = (e) => {
        console.error("SSE Connection Error", e);
        setIsConnected(false);
        eventSource.close();
        // Attempt reconnect after 5s
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [router]);

  return (
    <NotificationContext.Provider value={{ lastEvent, isConnected }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="rounded-xl border border-truf-lime/30 bg-truf-dark p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-truf-lime/20 text-truf-lime">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
