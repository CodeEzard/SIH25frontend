"use client"

// Minimal JWT helpers – client-only.
// Note: Store tokens securely in httpOnly cookies if you need stronger protection [^1][^2].

type DecodedJwt = {
  exp?: number
  iat?: number
  [key: string]: any
}

const STORAGE_KEY = "vericred_wallet"

export function decodeJwt(token: string | null | undefined): DecodedJwt | null {
  if (!token) return null
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

export function isJwtValid(token: string | null | undefined): boolean {
  if (!token) return false
  const decoded = decodeJwt(token)
  if (!decoded?.exp) return true // if no exp, treat as valid (backend-defined)
  const nowSeconds = Math.floor(Date.now() / 1000)
  return decoded.exp > nowSeconds
}

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token ?? null
  } catch {
    return null
  }
}

export function saveWalletSession(partial: Record<string, any>) {
  // merge into existing wallet object
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partial))
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}
