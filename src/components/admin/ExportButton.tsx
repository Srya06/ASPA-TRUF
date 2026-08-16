"use client";

import { useState } from "react";
import { Download, Loader2, Check, X } from "lucide-react";
import { exportBookingsAction } from "@/lib/actions/export";
import { cn } from "@/lib/utils";

export function ExportButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleExport = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await exportBookingsAction();
      if (res.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(res.error || "Failed to export");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {status === "error" && (
        <span className="text-xs text-red-400 font-medium">{errorMessage}</span>
      )}
      <button
        onClick={handleExport}
        disabled={status === "loading" || status === "success"}
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-lg",
          status === "idle" && "bg-truf-lime text-truf-dark hover:bg-truf-lime/90 hover:shadow-truf-lime/20",
          status === "loading" && "bg-truf-lime/50 text-truf-dark/50 cursor-not-allowed",
          status === "success" && "bg-green-500 text-white shadow-green-500/20",
          status === "error" && "bg-red-500 text-white shadow-red-500/20"
        )}
      >
        {status === "idle" && (
          <>
            <Download className="h-4 w-4" />
            Export Data
          </>
        )}
        {status === "loading" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        )}
        {status === "success" && (
          <>
            <Check className="h-4 w-4" />
            Sent to Email!
          </>
        )}
        {status === "error" && (
          <>
            <X className="h-4 w-4" />
            Export Failed
          </>
        )}
      </button>
    </div>
  );
}
