"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import Logo from "@/components/ui/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownUp,
  Copy,
  Search,
  ExternalLink,
  Wallet,
  Menu,
  X,
} from "lucide-react";

const TOKEN_URL =
  "https://sepolia.etherscan.io/token/0xc0a70a43CD5fAF5B15db983fe9f9E769B221738e";

// Helper to build a Sepolia Etherscan TX url from the hash
const TX_URL = (hash: string) => `https://sepolia.etherscan.io/tx/${hash}`;

interface Txn {
  tx_hash: string;
  block_number: number | string;
  from: string; // University Wallet
  to: string; // Student Wallet
  value_eth: number | string;
  gas: number | string;
  gas_price: number | string;
  timestamp: string | number; // ISO or epoch seconds
  status?: "success" | "pending" | "failed"; // Optional, if provided by backend
}

export default function LandingPublicLedgerPage() {
  // Landing-style navbar state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const navItems = useMemo(
    () => [
      { label: "Home", href: "/#home" },
      { label: "Docs", href: "/#docs" },
      { label: "Explore", href: "/#explore" },
      { label: "Public Ledger", href: "/landing-ledger" },
      { label: "Support", href: "/#support" },
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
      // Persist session (same as landing page util)
      try {
        localStorage.setItem(
          "vericred_wallet",
          JSON.stringify({
            address,
            chainId: `0x${network.chainId.toString(16)}`,
            isConnected: true,
            timestamp: Date.now(),
          })
        );
        localStorage.setItem("vericred_token", token);
      } catch {}

      alert("MetaMask connected and authenticated successfully!");
      router.replace("/home");
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // This page is public and does not perform any auth redirect
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          "https://erired-harshitg7062-82spdej3.leapcell.dev/transactions"
        );
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const data = await res.json();
        const rows: any[] = Array.isArray(data) ? data : data?.rows || [];

        // Normalize to Txn interface
        const normalized: Txn[] = rows
          .map((r) => ({
            tx_hash: r.tx_hash ?? r.id ?? "",
            block_number: r.block_number ?? r.blockNumber ?? r.block ?? "",
            from: r.from ?? r.sender ?? "",
            to: r.to ?? r.receiver ?? "",
            value_eth: r.value_eth ?? r.amount ?? r.value ?? "",
            gas: r.gas ?? r.gas_used ?? "",
            gas_price: r.gas_price ?? r.gasPrice ?? "",
            timestamp: r.timestamp ?? r.time ?? r.created_at ?? "",
            status: r.status,
          }))
          .filter((r) => r.tx_hash);
        setTxns(normalized);
      } catch (e) {
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const toNumber = (v: string | number | undefined) => {
    if (v === undefined || v === null) return NaN;
    if (typeof v === "number") return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const formatNumber = (v: string | number) => {
    const n = toNumber(v);
    if (Number.isNaN(n)) return String(v ?? "");
    return n.toLocaleString();
  };

  const formatTimestamp = (ts: string | number) => {
    if (ts === undefined || ts === null) return "";
    let d: Date;
    if (typeof ts === "number") {
      d = new Date(String(ts).length === 10 ? ts * 1000 : ts);
    } else {
      const num = Number(ts);
      if (Number.isFinite(num) && (ts as string).trim().length <= 13) {
        d = new Date((ts as string).length === 10 ? num * 1000 : num);
      } else {
        d = new Date(ts);
      }
    }
    if (isNaN(d.getTime())) return String(ts);
    const dd = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const tt = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dd} ${tt}`;
  };

  const truncateMiddle = (s: string, start = 6, end = 4) => {
    if (!s) return "";
    if (s.length <= start + end + 3) return s;
    return `${s.slice(0, start)}...${s.slice(-end)}`;
  };

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {}
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? txns.filter(
          (t) =>
            t.tx_hash?.toLowerCase().includes(q) ||
            t.from?.toLowerCase().includes(q) ||
            t.to?.toLowerCase().includes(q)
        )
      : txns.slice();

    list.sort((a, b) => {
      if (sortBy === "value") {
        const va = toNumber(a.value_eth);
        const vb = toNumber(b.value_eth);
        return sortDir === "asc" ? va - vb : vb - va;
      } else {
        const ta = new Date(formatTimestamp(a.timestamp)).getTime();
        const tb = new Date(formatTimestamp(b.timestamp)).getTime();
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
    });

    return list;
  }, [query, txns, sortBy, sortDir]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Landing-style Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] px-3 md:px-4 py-2">
            <div className="flex justify-between items-center gap-3">
              <a href="/#home" className="group flex items-center">
                <Logo
                  size="md"
                  className="group-hover:scale-105 transition-transform duration-200"
                />
              </a>

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

      {/* Ledger content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
              <CardTitle className="text-xl">Public Ledger</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by Tx Hash, University or Student Wallet"
                    className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 text-sm"
                    onClick={() =>
                      setSortBy((s) => (s === "date" ? "value" : "date"))
                    }
                  >
                    <ArrowDownUp className="h-4 w-4 mr-2" /> Sort: {sortBy}
                  </Button>
                  <Button
                    className="bg-white text-black hover:bg-gray-100 px-3 py-2 text-sm"
                    onClick={() =>
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                    }
                  >
                    {sortDir.toUpperCase()}
                  </Button>
                  <Button
                    asChild
                    className="relative overflow-hidden rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md focus-visible:ring-2 focus-visible:ring-purple-400/50 px-3 sm:px-4 py-2 text-sm"
                  >
                    <a
                      href={TOKEN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open contract transactions on Sepolia Etherscan"
                      className="inline-flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        Contract Transactions
                      </span>
                      <span className="sm:hidden">Contract Txns</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-400">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No transactions.
              </div>
            ) : (
              <div className="-mx-4 sm:mx-0">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Time</TableHead>
                      <TableHead className="text-gray-400">Tx Hash</TableHead>
                      <TableHead className="text-gray-400">Block</TableHead>
                      <TableHead className="text-gray-400">
                        University
                      </TableHead>
                      <TableHead className="text-gray-400">Student</TableHead>
                      <TableHead className="text-right text-gray-400">
                        Transaction
                      </TableHead>
                      <TableHead className="text-right text-gray-400">
                        Gas
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.tx_hash} className="border-gray-800">
                        <TableCell className="whitespace-nowrap text-gray-300">
                          {formatTimestamp(t.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-gray-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="whitespace-nowrap">
                              {truncateMiddle(t.tx_hash, 10, 8)}
                            </span>
                            <button
                              className="p-1 rounded-md hover:bg-white/10"
                              onClick={() => copy(t.tx_hash)}
                              aria-label="Copy Transaction Hash"
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-300" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-200">
                          {formatNumber(t.block_number)}
                        </TableCell>
                        <TableCell className="font-mono text-gray-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="whitespace-nowrap">
                              {truncateMiddle(t.from)}
                            </span>
                            <button
                              className="p-1 rounded-md hover:bg-white/10"
                              onClick={() => copy(t.from)}
                              aria-label="Copy University Wallet"
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-300" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-gray-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="whitespace-nowrap">
                              {truncateMiddle(t.to)}
                            </span>
                            <button
                              className="p-1 rounded-md hover:bg-white/10"
                              onClick={() => copy(t.to)}
                              aria-label="Copy Student Wallet"
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-300" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            size="sm"
                            className="bg-white text-black hover:bg-gray-100"
                          >
                            <a
                              href={TX_URL(t.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View transaction ${t.tx_hash} on Sepolia`}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">
                                View on Sepolia
                              </span>
                              <span className="sm:hidden">View</span>
                            </a>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right text-gray-200">
                          {formatNumber(t.gas)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
