"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { isJwtValid, getStoredToken } from "./jwt"
import { motion } from "framer-motion"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = getStoredToken()
    const valid = isJwtValid(token)
    if (!valid) {
      // If not on landing, go to landing
      if (pathname !== "/") {
        router.replace("/")
      }
    }
    // Done checking
    setChecking(false)
  }, [router, pathname])

  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <motion.div
            className="w-12 h-12 border-2 border-white/70 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="text-gray-400">Checking authentication…</p>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
