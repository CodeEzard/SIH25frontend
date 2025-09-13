"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/logo";

export default function LogoReveal({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  // Fallback completion in case animation callbacks don't fire
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 1800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Soft background aura (centered, responsive) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-purple-700/20 blur-3xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(60vmin, 24rem)", height: "min(60vmin, 24rem)" }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Concentric pulse rings (centered, responsive) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-full border border-purple-500/30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(42vmin, 18rem)", height: "min(42vmin, 18rem)" }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.95, 1.05, 1], opacity: [0.6, 0.8, 1] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-full border border-purple-500/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(64vmin, 26rem)", height: "min(64vmin, 26rem)" }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.85, 1.1, 1], opacity: [0.4, 0.7, 0.8] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />

        {/* Logo reveal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          onAnimationComplete={() => {
            // Short hold then fade out via parent AnimatePresence timeout
            setTimeout(() => onComplete?.(), 600);
          }}
          className="relative z-10 scale-90 sm:scale-100 px-4 sm:px-0 max-w-[92vw]"
        >
          {/* Show logo + brand text, stack on mobile, inline on larger screens */}
          <Logo
            size="lg"
            showText
            className="flex-col sm:flex-row gap-3 sm:gap-2 text-center sm:text-left text-white"
          />
          {/* Shine sweep */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl"
            initial={{ x: "-120%", opacity: 0.0 }}
            animate={{ x: ["-120%", "120%"], opacity: [0.0, 0.3, 0.0] }}
            transition={{ duration: 0.9, ease: "easeInOut", delay: 0.25 }}
            style={{
              background:
                "linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 60%)",
              WebkitMaskImage:
                "radial-gradient(circle at center, black 60%, transparent 62%)",
              maskImage:
                "radial-gradient(circle at center, black 60%, transparent 62%)",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
