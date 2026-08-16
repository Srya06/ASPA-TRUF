import { NextRequest } from "next/server";
import { getClient, getCollection, isDatabaseConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max duration for Vercel functions

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return new Response("Database not configured", { status: 500 });
  }

  const client = await getClient();
  const db = client.db();
  const adminNotifCol = await getCollection("admin_notifications");

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(`retry: 5000\n\n`);

      let changeStream: any = null;

      try {
        // Attempt to use Change Streams (Works on MongoDB Atlas replica sets)
        changeStream = adminNotifCol.watch();
        changeStream.on("change", (change: any) => {
          if (change.operationType === "insert") {
            const payload = {
              type: change.fullDocument.type, 
              timestamp: new Date().toISOString()
            };
            controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
          }
        });
      } catch (err) {
         // Change streams might fail if not a replica set, fallback gracefully
         console.warn("Change streams not available, falling back to basic SSE without real-time DB triggers.");
      }

      // Keep connection alive with heartbeat
      const heartbeatId = setInterval(() => {
        controller.enqueue(`: heartbeat\n\n`);
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatId);
        if (changeStream) {
           changeStream.close();
        }
        controller.close();
      });
    },
    cancel() {
      // client cleanup is handled in abort listener
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
