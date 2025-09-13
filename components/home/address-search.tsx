"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Search, ExternalLink, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStoredToken } from "@/components/auth/jwt";

// Types for API responses
interface ShowUserResponse {
  id: number;
  metamask_address: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  student_id?: string;
  is_verified?: boolean;
}

interface UserCred {
  id: string;
  degree_id: number;
  student_wallet: string;
  university_wallet: string;
  degree_name: string;
  description?: string;
  type?: string;
  major?: string;
  issued_date?: string;
  graduation_date?: string;
  created_at?: string;
  updated_at?: string;
  ipfs_link?: string;
  dean_sig?: string;
}

export default function AddressSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ShowUserResponse | null>(null);
  const [creds, setCreds] = useState<UserCred[]>([]);
  const [copied, setCopied] = useState(false);

  const isLikelyAddress = useMemo(
    () => /^0x[a-fA-F0-9]{6,}$/.test(query.trim()),
    [query]
  );

  function copy(value: string) {
    navigator.clipboard.writeText(value);
  }

  const copyAddress = async () => {
    if (!profile?.metamask_address) return;
    try {
      await navigator.clipboard.writeText(profile.metamask_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const handleSearch = async () => {
    if (!isLikelyAddress) return;
    setLoading(true);
    setError(null);
    try {
      const addr = query.trim();
      const token = getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1) Fetch user profile
      const res = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/showuser",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ metamask_address: addr }),
        }
      );
      if (!res.ok) throw new Error(`showuser failed (${res.status})`);
      const userJson: any = await res.json();
      const user: ShowUserResponse = Array.isArray(userJson)
        ? userJson[0]
        : userJson?.data?.[0] || userJson;
      setProfile(user || null);

      // 2) Fetch user credentials
      const cr = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/usercreds",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ metamask_address: addr }),
        }
      );
      if (!cr.ok) throw new Error(`usercreds failed (${cr.status})`);
      const cj: any = await cr.json();
      const list: UserCred[] = Array.isArray(cj)
        ? cj
        : cj?.rows || (cj ? [cj] : []);
      setCreds(list);

      setOpen(true);
    } catch (e: any) {
      console.error(e);
      setError("Search failed. Please try again.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const niceDate = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString();
  };

  const SAMPLE_ADDR = "0x0894556908f344151c0BF6633423274b96D27B8A";

  return (
    <Card className="bg-gradient-to-br from-gray-900/85 to-gray-900/70 border border-gray-800/70 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search by Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="0x…"
            className="h-11 bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-500"
          />
          <Button
            disabled={!isLikelyAddress || loading}
            className="h-11 bg-white text-black hover:bg-gray-100"
            onClick={handleSearch}
          >
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>

        {/* Sample address helper */}
        <div className="flex items-center justify-between gap-2 rounded-md border border-gray-800 bg-gray-900/60 px-3 py-2">
          <span className="text-xs text-gray-300 font-mono truncate">
            {SAMPLE_ADDR}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={() => copy(SAMPLE_ADDR)}
            title="Copy sample address"
          >
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy
          </Button>
        </div>

        {!isLikelyAddress && query && (
          <p className="text-xs text-gray-500">
            Enter a valid address starting with 0x
          </p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Subtle hint */}
        <p className="text-xs text-gray-400">
          We’ll look up the profile and minted credentials for this wallet.
        </p>
      </CardContent>

      {/* Results Modal - redesigned visuals only */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-950 via-black/90 to-gray-900 border border-gray-800 text-white rounded-2xl shadow-2xl p-0">
          <div className="relative">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-400 via-white to-purple-500" />

            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="flex items-center gap-2 text-white">
                User Profile
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-gray-400 flex items-center gap-2">
                {profile?.metamask_address
                  ? `${profile.metamask_address.slice(
                      0,
                      10
                    )}...${profile.metamask_address.slice(-8)}`
                  : ""}
                {profile?.metamask_address && (
                  <button
                    onClick={copyAddress}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-0.5 text-[11px] text-gray-300 hover:bg-gray-800 hover:text-white transition"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-6 space-y-6">
              {/* Profile grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="text-gray-200">
                    {profile?.first_name || ""} {profile?.last_name || ""}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-gray-200">{profile?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Student ID</p>
                  <p className="text-gray-200">{profile?.student_id || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Verified</p>
                  <p className="text-gray-200">
                    {profile?.is_verified ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Minted credentials */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900/85 to-gray-900/75 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-300">Minted Credentials</p>
                  <Badge className="bg-purple-900/40 text-purple-200 border-purple-800">
                    {creds.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AnimatePresence initial={false}>
                    {creds.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No credentials found for this user.
                      </p>
                    ) : (
                      creds.map((c, i) => (
                        <motion.div
                          key={c.id || i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.02 }}
                          className="p-3 rounded-lg bg-gray-900/70 border border-gray-800"
                        >
                          <div className="text-white font-medium truncate">
                            {c.degree_name || "Credential"}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {c.type || ""} {c.major ? `• ${c.major}` : ""}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Issued:{" "}
                            <span className="text-gray-300">
                              {niceDate(c.issued_date)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {c.ipfs_link && (
                              <Button
                                asChild
                                size="sm"
                                className="h-7 px-2 bg-white text-black hover:bg-gray-100"
                              >
                                <a
                                  href={c.ipfs_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />{" "}
                                  IPFS
                                </a>
                              </Button>
                            )}
                            {c.dean_sig && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-gray-700/60 text-gray-300 hover:bg-gray-900/60"
                                onClick={() => copy(c.dean_sig!)}
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" /> Copy Sig
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 pb-6">
              <Button
                variant="outline"
                className="border-gray-700/60 text-gray-300 hover:bg-gray-900/60"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
