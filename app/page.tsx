"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Menu,
  X,
  BookOpen,
  Compass,
  LifeBuoy,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import DocsSection from "@/components/landing/docs-section";
import ExploreSection from "@/components/landing/explore-section";
import SupportSection from "@/components/landing/support-section";
import { useRouter } from "next/navigation";
import {
  getStoredToken,
  isJwtValid,
  saveWalletSession,
} from "@/components/auth/jwt";
import Logo from "@/components/ui/logo";
import LogoReveal from "@/components/ui/logo-reveal";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const router = useRouter();

  // Redirect to /home if a valid JWT exists
  // Disabled to allow viewing public landing pages (e.g., /landing-ledger) even when logged in
  useEffect(() => {
    // const token = getStoredToken();
    // if (isJwtValid(token)) {
    //   router.replace("/home");
    // }
  }, [router]);

  const navItems = useMemo(
    () => [
      { label: "Home", href: "#home" },
      { label: "Docs", href: "#docs" },
      { label: "Explore", href: "#explore" },
      { label: "Public Ledger", href: "/landing-ledger" },
      { label: "Support", href: "#support" },
    ],
    []
  );

  async function handleMetaMaskConnect() {
    setIsConnecting(true);
    try {
      const hasEthereum = typeof (window as any).ethereum !== "undefined";
      const ua = (
        typeof navigator !== "undefined" ? navigator.userAgent : ""
      ).toLowerCase();
      const isMobile =
        /android|iphone|ipad|ipod|opera mini|iemobile|mobile/.test(ua);

      if (!hasEthereum) {
        if (isMobile) {
          // Deep-link to MetaMask mobile to open this DApp
          const dappHost =
            typeof window !== "undefined" ? window.location.host : "";
          const path = "/home";
          const deepLink = `https://metamask.app.link/dapp/${dappHost}${path}`;
          window.location.href = deepLink;
          return;
        } else {
          alert(
            "MetaMask is not installed. Please install MetaMask to continue."
          );
          window.open("https://metamask.io/download/", "_blank");
          return;
        }
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Step 1 — get nonce (backend)
      const nonceRes = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/getnonce",
        {
          method: "POST",
          body: JSON.stringify({ metamask_address: address }),
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      // Step 2 — sign the nonce
      const signature = await signer.signMessage(nonce);

      // Step 3 — login with signature (backend)
      const loginRes = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/auth/metamasklogin",
        {
          method: "POST",
          body: JSON.stringify({ metamask_address: address, signature }),
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!loginRes.ok) throw new Error("Login failed");
      const token = await loginRes.text();

      const network = await provider.getNetwork();
      saveWalletSession({
        address,
        chainId: `0x${network.chainId.toString(16)}`,
        isConnected: true,
        timestamp: Date.now(),
        token,
      });

      // Show logo reveal, then redirect
      setShowReveal(true);
      setTimeout(() => router.replace("/home"), 1400);
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      if (error?.code === 4001) {
        alert("MetaMask connection was rejected by user.");
      } else if (error?.code === -32002) {
        alert(
          "MetaMask connection request is already pending. Please check MetaMask."
        );
      } else {
        alert(
          `Failed to connect MetaMask: ${error?.message ?? "Unknown error"}`
        );
      }
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white scroll-smooth">
      {showReveal && <LogoReveal onComplete={() => setShowReveal(false)} />}
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {/* Glass, rounded pill container */}
          <div className="w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] px-3 md:px-4 py-2">
            <div className="flex justify-between items-center gap-3">
              {/* Logo */}
              <a href="#home" className="group flex items-center">
                <Logo
                  size="md"
                  className="group-hover:scale-105 transition-transform duration-200"
                />
              </a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  onClick={handleMetaMaskConnect}
                  disabled={isConnecting}
                  className="ml-2 bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-white shadow-sm"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Login with MetaMask"}
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </nav>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur-md">
            <div className="px-3 py-3 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                >
                  {item.label}
                </a>
              ))}
              <Button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting}
                className="w-full h-12 bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-white shadow-sm"
              >
                <Wallet className="mr-3 h-5 w-5" />
                {isConnecting ? "Connecting..." : "Login with MetaMask"}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        {/* Background orbs */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-24 h-80 w-80 rounded-full bg-purple-800/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 }}
        />

        <div className="relative flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
          {/* Left - Hero Copy */}
          <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
            <div className="max-w-2xl w-full space-y-8">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-gray-800/60 bg-gray-900/40 px-3 py-1 text-xs text-gray-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                Secure, decentralized, verifiable
              </motion.div>

              <motion.h1
                className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Own your credentials with
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent">
                  VeriCred
                </span>
              </motion.h1>

              <motion.p
                className="text-gray-400 text-lg"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
              >
                A decentralized platform for verified academic and professional
                credentials on-chain. Connect your wallet to start exploring.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <Button
                  onClick={handleMetaMaskConnect}
                  disabled={isConnecting}
                  className="h-12 px-6 bg-white text-black hover:bg-gray-100"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  {isConnecting ? "Connecting..." : "Login with MetaMask"}
                </Button>
                <a
                  href="#explore"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md border border-gray-800 hover:bg-gray-900 transition-colors"
                >
                  Explore platform <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </motion.div>

              {/* Mini feature bullets */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-sm text-gray-400"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10% 0px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {[
                  { label: "Forgery-proof NFTs", icon: BookOpen },
                  { label: "Instant verification", icon: Compass },
                  { label: "Own your records", icon: LifeBuoy },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 rounded-md border border-gray-800/60 bg-gray-900/30 px-3 py-2"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <f.icon className="h-4 w-4 text-purple-400" />
                    {f.label}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right - Animated display */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black h-64 sm:h-80 md:h-auto">
            {/* Rotating squares */}
            <motion.div
              className="absolute w-12 h-12 border border-gray-700 left-[15%] top-[20%]"
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute w-8 h-8 border border-gray-600 left-[70%] top-[15%]"
              animate={{ rotate: -360 }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute w-14 h-14 border border-gray-700 left-[25%] top-[60%]"
              animate={{ rotate: 360 }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute w-10 h-10 border border-gray-600 left-[80%] top-[70%]"
              animate={{ rotate: -360 }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/40" />
            {/* Pulsing circles */}
            <motion.div
              className="absolute w-48 h-48 border border-gray-600 rounded-full left-1/2 top-1/2 -ml-24 -mt-24"
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.06, 1] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute w-72 h-72 border border-gray-700 rounded-full left-1/2 top-1/2 -ml-36 -mt-36"
              animate={{ opacity: [0.1, 0.28, 0.1], scale: [1, 1.05, 1] }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <motion.div
              className="absolute w-96 h-96 border border-gray-800 rounded-full left-1/2 top-1/2 -ml-48 -mt-48"
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.04, 1] }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
            {/* Central rotating element */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-gray-600 rotate-45"
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            {/* Star particles */}
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${10 + ((i * 37) % 80)}%`,
                  top: `${15 + ((i * 53) % 70)}%`,
                  opacity: 0.35 + ((i * 7) % 40) / 100,
                }}
                animate={{ y: [0, -6, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: 3 + (i % 4),
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Docs */}
      <DocsSection />

      {/* Explore */}
      <ExploreSection />

      {/* Support */}
      <SupportSection />

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} VeriCred. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#docs" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="#explore" className="hover:text-white transition-colors">
              Explore
            </a>
            <a href="#support" className="hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
