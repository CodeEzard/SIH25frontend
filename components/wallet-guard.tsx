"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle } from "lucide-react"

interface WalletGuardProps {
  children: React.ReactNode
}

export default function WalletGuard({ children }: WalletGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkWalletConnection = () => {
      try {
        const storedWallet = localStorage.getItem("vericred_wallet")

        if (!storedWallet) {
          setIsConnected(false)
          setIsChecking(false)
          return
        }

        const walletData = JSON.parse(storedWallet)
        const isExpired = Date.now() - walletData.timestamp > 24 * 60 * 60 * 1000

        if (isExpired || !walletData.isConnected) {
          localStorage.removeItem("vericred_wallet")
          setIsConnected(false)
        } else {
          setIsConnected(true)
        }

        setIsChecking(false)
      } catch (error) {
        console.error("Error checking wallet connection:", error)
        localStorage.removeItem("vericred_wallet")
        setIsConnected(false)
        setIsChecking(false)
      }
    }

    checkWalletConnection()
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Checking wallet connection...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-white">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Wallet Not Connected
            </CardTitle>
            <CardDescription className="text-gray-400">
              You need to connect your wallet to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-400">
              <p>Please connect your MetaMask wallet to continue</p>
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-white text-black hover:bg-gray-100"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
