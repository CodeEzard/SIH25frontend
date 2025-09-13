"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredToken } from "@/components/auth/jwt";

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

export default function UserInfoModal({
  open,
  onOpenChange,
  address,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  address: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ShowUserResponse | null>(null);
  const [creds, setCreds] = useState<UserCred[]>([]);
  const [copied, setCopied] = useState(false);

  const isLikelyAddress = useMemo(
    () => /^0x[a-fA-F0-9]{6,}$/.test((address || "").trim()),
    [address]
  );

  function copy(value: string) {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  useEffect(() => {
    const run = async () => {
      if (!open || !isLikelyAddress) return;
      setLoading(true);
      setError(null);
      try {
        const addr = address.trim();
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
      } catch (e: any) {
        console.error(e);
        setError("Failed to load user info.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, address, isLikelyAddress]);

  const niceDate = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            User Profile
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-gray-400 flex items-center gap-2">
            {isLikelyAddress
              ? `${address.slice(0, 10)}...${address.slice(-8)}`
              : ""}
            {isLikelyAddress && (
              <button
                onClick={() => copy(address)}
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

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="space-y-6">
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
                              <ExternalLink className="h-3.5 w-3.5 mr-1" /> IPFS
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

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-white text-black hover:bg-gray-100"
            disabled={loading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
