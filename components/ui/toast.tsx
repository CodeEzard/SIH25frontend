"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Info, AlertCircle, ExternalLink } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  linkHref?: string;
  linkLabel?: string;
  // optional raw content field for future use
};

type ToastContextValue = {
  showToast: (t: Omit<ToastItem, "id"> & { durationMs?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timeouts = useRef<Record<string, any>>({});

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      linkHref,
      linkLabel,
      durationMs = 5000,
    }: Omit<ToastItem, "id"> & { durationMs?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = {
        id,
        title,
        description,
        variant,
        linkHref,
        linkLabel,
      };
      setItems((prev) => [...prev, item]);
      // auto dismiss
      timeouts.current[id] = setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== id));
        clearTimeout(timeouts.current[id]);
        delete timeouts.current[id];
      }, durationMs);
    },
    []
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const remove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  };

  const iconFor = (variant?: ToastVariant) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const borderClass = (variant?: ToastVariant) => {
    switch (variant) {
      case "success":
        return "border-green-800/60 bg-gradient-to-br from-green-900/30 via-black/70 to-green-900/20";
      case "error":
        return "border-red-800/60 bg-gradient-to-br from-red-900/30 via-black/70 to-red-900/20";
      default:
        return "border-blue-800/60 bg-gradient-to-br from-blue-900/30 via-black/70 to-blue-900/20";
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Viewport */}
      <div className="pointer-events-none fixed top-6 right-6 z-[60] w-full max-w-sm space-y-3">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto rounded-2xl border ${borderClass(
                t.variant
              )} shadow-2xl backdrop-blur-xl p-4 sm:p-5`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {iconFor(t.variant)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-base">
                    {t.title}
                  </h4>
                  {t.description && (
                    <p className="text-sm text-gray-300 mt-1">
                      {t.description}
                    </p>
                  )}
                  {t.linkHref && (
                    <div className="mt-3">
                      <a
                        href={t.linkHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition"
                      >
                        {t.linkLabel || "Open Link"}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="-m-1 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
