"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/logo";
import WalletStatus from "@/components/wallet-status";
import { clearSession } from "@/components/auth/jwt";
import { Wallet, Copy, Check } from "lucide-react";

export default function SiteNavbar() {
  const pathname = usePathname();

  // Hide the global navbar on landing pages to avoid double navbars
  if (pathname === "/" || pathname?.startsWith("/landing-ledger")) {
    return null;
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/university", label: "Issuer Hub" },
    { href: "/public-ledger", label: "Public Ledger" },
  ];

  const [userProfile, setUserProfile] = useState<{
    walletAddress: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vericred_wallet");
      const userRaw = localStorage.getItem("vericred_user");
      let addr = null;
      let role = "Individual";
      if (raw) {
        const parsed = JSON.parse(raw);
        addr = parsed?.address || parsed?.walletAddress || null;
      }
      if (userRaw) {
        const parsedUser = JSON.parse(userRaw);
        role = parsedUser?.role || role;
      }
      if (addr) setUserProfile({ walletAddress: addr, role });
    } catch (e) {
      setUserProfile(null);
    }
  }, []);

  const handleDisconnect = () => {
    try {
      clearSession();
      localStorage.removeItem("vericred_user");
    } catch (e) {}
    if (typeof window !== "undefined") window.location.reload();
  };

  // mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddressMobile = async () => {
    if (!userProfile?.walletAddress) return;
    try {
      await navigator.clipboard.writeText(userProfile.walletAddress);
      setCopiedMobile(true);
      setTimeout(() => setCopiedMobile(false), 1200);
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* Glass, rounded pill container (landing style) */}
        <div className="w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] px-3 md:px-4 py-2">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-3 items-center gap-2">
            {/* Left: Logo + compact mobile status */}
            <div className="flex items-center gap-2 min-w-0 justify-self-start">
              <Link href="/home" className="group flex items-center">
                <Logo
                  size="md"
                  className="group-hover:scale-105 transition-transform duration-200"
                />
              </Link>
              {userProfile && (
                <div className="md:hidden flex items-center gap-1 text-[10px] min-[360px]:text-[11px] sm:text-xs text-gray-300 whitespace-nowrap flex-nowrap shrink min-w-0 max-w-[60vw] overflow-hidden rounded-full border border-white/10 bg-white/5 pl-1 pr-1 py-0.5">
                  <Wallet className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  <span className="hidden min-[420px]:inline">
                    Connected:&nbsp;
                  </span>
                  <span className="font-mono text-white truncate max-w-[34vw] min-[420px]:max-w-[38vw] inline-block align-bottom">
                    {formatAddress(userProfile.walletAddress)}
                  </span>
                  <button
                    onClick={copyAddressMobile}
                    title="Copy address"
                    className="ml-1 inline-flex items-center justify-center rounded-md border border-gray-700 p-1 min-[360px]:p-1 text-gray-300 hover:bg-gray-800 hover:text-white transition flex-shrink-0"
                  >
                    {copiedMobile ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Navigation: centered with tight spacing, slightly left shift and no wrap */}
            <div className="hidden md:flex items-center gap-1 justify-self-center -translate-x-4 lg:-translate-x-6 whitespace-nowrap">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-2 py-2 text-sm text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Desktop Wallet: right aligned with nowrap */}
            <div className="hidden md:flex items-center gap-3 justify-self-end whitespace-nowrap">
              <WalletStatus
                userProfile={userProfile}
                onDisconnect={handleDisconnect}
                showRoleBadge={false}
              />
            </div>

            {/* Mobile menu button: pinned to right on small screens */}
            <div className="md:hidden justify-self-end">
              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((s) => !s)}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
              >
                {menuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation (landing style dropdown) */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur-md">
          <div className="px-3 py-3 space-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                {l.label}
              </Link>
            ))}

            <div className="border-t border-white/10 pt-3">
              <WalletStatus
                userProfile={userProfile}
                onDisconnect={() => {
                  setMenuOpen(false);
                  handleDisconnect();
                }}
                showRoleBadge={false}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
