"use client";

import AuthGuard from "@/components/auth/auth-guard";
import AddressSearch from "@/components/home/address-search";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  GraduationCap,
  ShieldCheck,
  LayoutDashboard,
  Share2,
  Droplets,
} from "lucide-react";
import Link from "next/link";

type VerificationStatus = "unverified" | "pending" | "verified";
interface UserProfile {
  walletAddress: string;
  role: string;
  name?: string;
  email?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
}

export default function HomePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vericred_wallet");
      if (!raw) return;
      const w = JSON.parse(raw);
      const profile: UserProfile = {
        walletAddress: w.address,
        role: "Individual",
        name: "Anonymous",
        email: "",
        isVerified: false,
        verificationStatus: "unverified",
      };
      setUserProfile(profile);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Ambient gradients */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-28 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-24 h-96 w-96 rounded-full bg-indigo-700/20 blur-[64px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />

        {/* Header / hero */}
        <header className="border-b border-gray-900/70 bg-gradient-to-b from-gray-950/60 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight"
            >
              Welcome to VeriCred
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-2 text-gray-400 max-w-2xl mx-auto"
            >
              Search a wallet to view profile and credentials. Verify your
              account and access your dashboard.
            </motion.p>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Prominent Search - centered */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <AddressSearch />
          </motion.section>

          {/* How it works */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className=""
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                How the site works
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <motion.div
                className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 backdrop-blur-xl p-5 shadow-2xl"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center mb-3">
                  <Wallet className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-white text-sm font-medium">
                  Connect your wallet
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Use MetaMask to sign in.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 backdrop-blur-xl p-5 shadow-2xl"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-white text-sm font-medium">
                  Verify your profile
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Create a student or university account.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 backdrop-blur-xl p-5 shadow-2xl"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center mb-3">
                  <LayoutDashboard className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-white text-sm font-medium">
                  Use your dashboard
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Manage, request, and mint credentials.
                </p>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 backdrop-blur-xl p-5 shadow-2xl"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center mb-3">
                  <Share2 className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-white text-sm font-medium">
                  Share & verify
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  View on the public ledger. Share with anyone.
                </p>
              </motion.div>
            </div>
          </motion.section>

          {/* Test faucet info */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 backdrop-blur-xl p-5 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium">
                    Need Sepolia test ETH?
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Use Google Cloud’s faucet to fund your wallet on Sepolia.
                  </p>
                  <Link
                    href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                    target="_blank"
                    className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-black bg-white hover:bg-gray-100 rounded-md px-3 py-1.5"
                  >
                    Get Sepolia ETH
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </AuthGuard>
  );
}
