"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Building2,
  User as UserIcon,
  CalendarDays,
  Hash,
  BadgeCheck,
  GraduationCap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Wallet,
  Share2,
  Clock,
  X as XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { getStoredToken, isJwtValid } from "@/components/auth/jwt";

interface BackendCred {
  id: string;
  degree_id?: number;
  student_wallet?: string;
  university_wallet?: string;
  universityName?: string;
  degree_name?: string;
  description?: string;
  type?: string;
  major?: string;
  gpa?: string | number;
  issued_date?: string;
  graduation_date?: string;
  created_at?: string;
  updated_at?: string;
  ipfs_link?: string;
  dean_sig?: string;
  [key: string]: any;
}

interface MintedCredentialsSummaryProps {
  credentials?: BackendCred[];
}

export default function MintedCredentialsSummary({
  credentials = [],
}: MintedCredentialsSummaryProps) {
  const [creds, setCreds] = useState<BackendCred[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeCred, setActiveCred] = useState<BackendCred | null>(null);
  const [ipfsData, setIpfsData] = useState<any>(null);
  const [ipfsLoading, setIpfsLoading] = useState(false);
  const [ipfsError, setIpfsError] = useState<string | null>(null);

  const [walletsOpen, setWalletsOpen] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<BackendCred | null>(null);
  const qrWrapRef = useRef<HTMLDivElement | null>(null);

  // Helper to read values from IPFS JSON attributes array (trait_type/value)
  const getAttr = useCallback(
    (key: string): string | null => {
      const attrs = (ipfsData as any)?.attributes;
      if (Array.isArray(attrs)) {
        const found = attrs.find(
          (a: any) => (a?.trait_type || a?.traitType) === key
        );
        return (found?.value ?? null) as any;
      }
      return null;
    },
    [ipfsData]
  );

  // Normalize a single credential object from varying backend shapes
  const normalizeCred = useCallback((c: any): BackendCred => {
    const id =
      c?.id ?? c?.ID ?? c?.uuid ?? c?._id ?? c?.credential_id ?? undefined;
    const degree_name =
      c?.degree_name ?? c?.degreeName ?? c?.name ?? c?.title ?? undefined;
    const description = c?.description ?? c?.details ?? c?.desc ?? undefined;
    const type =
      c?.type ?? c?.credential_type ?? c?.credentialType ?? undefined;
    const major = c?.major ?? c?.field ?? undefined;
    const gpa = c?.gpa ?? c?.grade ?? undefined;
    const issued_date =
      c?.issued_date ??
      c?.issuedDate ??
      c?.issue_date ??
      c?.issueDate ??
      c?.issued_at ??
      c?.created_at ??
      undefined;
    const graduation_date =
      c?.graduation_date ?? c?.graduationDate ?? undefined;

    const student_wallet =
      c?.student_wallet ??
      c?.recipient_wallet ??
      c?.studentAddress ??
      c?.recipient ??
      c?.student?.metamask_address ??
      c?.student?.wallet ??
      undefined;
    const university_wallet =
      c?.university_wallet ??
      c?.issuer_wallet ??
      c?.issuerWallet ??
      c?.universityWallet ??
      c?.organization?.metamask_address ??
      c?.university?.metamask_address ??
      undefined;

    const ipfs_link =
      c?.ipfs_link ??
      c?.ip_fs_link ??
      c?.ipfsHash ??
      c?.ipfs ??
      c?.ipfsurl ??
      c?.ipfs_url ??
      c?.tokenURI ??
      c?.tokenUri ??
      undefined;

    return {
      ...(id ? { id } : {}),
      ...(degree_name ? { degree_name } : {}),
      ...(description ? { description } : {}),
      ...(type ? { type } : {}),
      ...(major ? { major } : {}),
      ...(gpa ? { gpa } : {}),
      ...(issued_date ? { issued_date } : {}),
      ...(graduation_date ? { graduation_date } : {}),
      ...(student_wallet ? { student_wallet } : {}),
      ...(university_wallet ? { university_wallet } : {}),
      ...(ipfs_link ? { ipfs_link } : {}),
    } as BackendCred;
  }, []);

  // Helper to extract an array from different response shapes
  const extractRows = useCallback((data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data?.rows && Array.isArray(data.rows)) return data.rows;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.result && Array.isArray(data.result)) return data.result;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data && typeof data === "object") return [data];
    return [];
  }, []);

  const fetchCreds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token && isJwtValid(token))
        headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/creds", { headers });

      if (res.status === 404) {
        setCreds([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Status ${res.status}`);
      }

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error("Invalid JSON from /api/creds");
      }

      const rows = extractRows(data);
      const normalized = rows.map(normalizeCred);
      setCreds(normalized);
    } catch (err: any) {
      console.error("Error fetching minted credentials:", err);
      setError("Unable to load minted credentials");
    } finally {
      setLoading(false);
    }
  }, [extractRows, normalizeCred]);

  useEffect(() => {
    fetchCreds();
  }, [fetchCreds]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // minimal feedback could be added (toast) — keeping silent per requirements
    } catch (e) {
      console.debug("Copy failed", e);
    }
  };

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  // IPFS fetch with gateway fallbacks
  const openDetails = async (c: BackendCred) => {
    setActiveCred(c);
    setIpfsData(null);
    setIpfsError(null);
    setWalletsOpen(false);
    setDetailsOpen(true);

    const rawIpfs =
      c.ipfs_link ||
      c.ip_fs_link ||
      c.ipfsHash ||
      c.ipfs ||
      (c as any)?.ipfsurl ||
      (c as any)?.ipfs_url ||
      (c as any)?.tokenURI ||
      (c as any)?.tokenUri ||
      null;
    if (!rawIpfs) {
      setIpfsError("No IPFS link available for this credential");
      return;
    }

    // normalize: accept ipfs://<hash>/path or /ipfs/<hash>/path or full http(s)
    const normalize = (link: string) => {
      if (/^https?:\/\//.test(link)) return link;
      if (link.startsWith("ipfs://")) return link.replace(/^ipfs:\/\//, "");
      if (link.startsWith("/ipfs/")) return link.replace(/^\/ipfs\//, "");
      return link;
    };

    const normalized = normalize(rawIpfs);

    // candidate gateways (try in order) - cloudflare/ipfs.io/dweb.link
    const gateways = [
      (h: string) => `https://cloudflare-ipfs.com/ipfs/${h}`,
      (h: string) => `https://ipfs.io/ipfs/${h}`,
      (h: string) => `https://dweb.link/ipfs/${h}`,
    ];

    // if the normalized value already looks like a full URL, try it first
    const tryUrls: string[] = [];
    if (/^https?:\/\//.test(normalized)) {
      tryUrls.push(normalized);
    } else {
      // split hash and path if present
      const [hash, ...rest] = normalized.split("/");
      const path = rest.length ? `/${rest.join("/")}` : "";
      for (const g of gateways) tryUrls.push(g(hash) + path);
    }

    setIpfsLoading(true);
    let success = false;
    for (const url of tryUrls) {
      try {
        const r = await fetch(url, { mode: "cors" });
        if (!r.ok) {
          console.debug(`IPFS gateway ${url} returned ${r.status}`);
          continue;
        }
        // try parsing JSON first, otherwise read text
        const ct = r.headers.get("content-type") || "";
        if (ct.includes("application/json") || ct.includes("text/json")) {
          const json = await r.json();
          setIpfsData(json);
        } else {
          // attempt to parse as JSON even if content-type is missing
          const text = await r.text();
          try {
            const maybe = JSON.parse(text);
            setIpfsData(maybe);
          } catch (e) {
            setIpfsData({ content: text });
          }
        }
        success = true;
        break;
      } catch (err) {
        console.debug("IPFS fetch failed for", url, err);
        // try next gateway
      }
    }

    if (!success) {
      setIpfsError(
        "Failed to fetch IPFS content (CORS or gateway error). Consider using a backend proxy to avoid CORS."
      );
    }

    setIpfsLoading(false);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setActiveCred(null);
    setIpfsData(null);
    setIpfsError(null);
    setIpfsLoading(false);
    setWalletsOpen(false);
    setAdditionalOpen(false);
  };

  const openShare = (c: BackendCred) => {
    setShareFor(c);
    setShareUrl(null);
    setShareError(null);
    setShareLoading(false);
    setShareOpen(true);
  };
  const closeShare = () => {
    setShareOpen(false);
    setShareFor(null);
    setShareUrl(null);
    setShareError(null);
    setShareLoading(false);
  };

  const generateShare = async (hours: number) => {
    if (!shareFor) return;
    try {
      setShareLoading(true);
      setShareError(null);
      const token = getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(
        "http://localhost:8080/api/v1/credentials/generate-share-link",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ credential_id: shareFor.id, duration: hours }),
        }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Failed (${res.status})`);
      }
      const json = await res.json();
      const url = json?.shareable_url || json?.url || json?.link || null;
      if (!url) throw new Error("No URL returned by server");
      setShareUrl(url);
    } catch (e: any) {
      setShareError(e?.message || "Failed to generate share link");
    } finally {
      setShareLoading(false);
    }
  };

  const summarizeShareUrl = (u: string) => {
    try {
      const url = new URL(u);
      const hasToken = url.searchParams.has("token");
      if (hasToken) url.search = "?token=•••";
      return `${url.origin}${url.pathname}${url.search}`;
    } catch {
      return u.length > 48 ? `${u.slice(0, 48)}…` : u;
    }
  };

  const getQrCanvas = (): HTMLCanvasElement | null => {
    return (qrWrapRef.current?.querySelector("canvas") ||
      null) as HTMLCanvasElement | null;
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const buildBrandedCanvas = async (qr: HTMLCanvasElement) => {
    const padding = 24;
    const headerH = 72;
    const width = qr.width + padding * 2;
    const height = headerH + qr.height + padding * 2;
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const ctx = out.getContext("2d");
    if (!ctx) return out;
    // background
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, width, height);
    // header brand
    try {
      const logo = await loadImage("/favicon.svg");
      const logoSize = 28;
      ctx.drawImage(
        logo,
        padding,
        Math.floor((headerH - logoSize) / 2),
        logoSize,
        logoSize
      );
    } catch {}
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("VeriCred", padding + 36, Math.floor(headerH / 2));
    // divider
    ctx.fillStyle = "#1f2937"; // gray-800
    ctx.fillRect(padding, headerH - 1, width - padding * 2, 1);
    // QR
    ctx.drawImage(qr, padding, headerH + padding);
    return out;
  };

  const downloadBrandedQR = async () => {
    const qr = getQrCanvas();
    if (!qr) return;
    const out = await buildBrandedCanvas(qr);
    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(shareFor?.degree_name || "credential")
      .toString()
      .replace(/\s+/g, "-")
      .toLowerCase()}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const nativeShareBrandedQR = async () => {
    const qr = getQrCanvas();
    if (!qr) return;
    const out = await buildBrandedCanvas(qr);
    return new Promise<void>((resolve) => {
      out.toBlob(async (blob) => {
        if (!blob) return resolve();
        const file = new File([blob], "vericred-credential-qr.png", {
          type: "image/png",
        });
        if (
          (navigator as any).canShare &&
          (navigator as any).canShare({ files: [file] })
        ) {
          try {
            await (navigator as any).share({
              files: [file],
              title: "VeriCred QR",
              text: "Scan to verify credential",
            });
          } catch {
            // ignore cancel
          }
        } else {
          // fallback to download
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "vericred-credential-qr.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
        resolve();
      }, "image/png");
    });
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/60 border border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="flex items-center gap-3 text-white">
              <Award className="h-5 w-5 text-purple-300" />
              <span className="text-lg font-semibold">
                My Minted Credentials
              </span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Verified credentials minted to your wallet
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchCreds()}
              className="text-gray-300"
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-800/30 animate-pulse h-28"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-300">{error}</div>
        ) : creds.length === 0 ? (
          <div className="p-6 text-center">
            <Award className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-300">
              You don't have any minted credentials yet.
            </p>
            <p className="text-xs text-gray-500">
              Request or mint credentials to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {creds.map((c, idx) => (
              <motion.article
                key={c.id || (c as any).ipfs_link || (c as any).tokenURI || idx}
                layout
                whileHover={{ translateY: -6 }}
                className="group relative rounded-3xl p-[1.5px] bg-gradient-to-br from-purple-600/30 via-fuchsia-500/10 to-indigo-600/30 hover:from-purple-500/40 hover:to-indigo-500/40 transition-all duration-300"
              >
                <div className="relative rounded-3xl bg-gradient-to-br from-gray-900/85 to-gray-900/70 border border-gray-800/70 shadow-xl overflow-hidden">
                  <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-purple-600/15 blur-3xl opacity-60 group-hover:opacity-80 transition" />

                  {/* ID chip removed per request */}

                  <div className="p-5 sm:p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg sm:text-xl tracking-tight truncate">
                          {c.degree_name || "Untitled Credential"}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {c.major && (
                            <Badge className="bg-purple-900/40 text-purple-200 border-purple-800 text-[11px]">
                              {c.major}
                            </Badge>
                          )}
                          {c.type && (
                            <Badge className="bg-indigo-900/30 text-indigo-200 border-indigo-800 text-[11px]">
                              {c.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openDetails(c)}
                        className="bg-white text-black hover:bg-gray-100 shadow-sm h-8 px-3 sm:px-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">
                          View Full Credential
                        </span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 mt-3 line-clamp-2 sm:line-clamp-3">
                      {c.description || "No description provided."}
                    </p>

                    {/* Footer row */}
                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-500">Issuer</span>
                        <span className="truncate max-w-[180px] sm:max-w-[260px] flex items-center gap-1">
                          {c.university_wallet || c.universityName || "Unknown"}
                          {c.university_wallet && (
                            <button
                              className="p-1 rounded-md hover:bg-white/10"
                              onClick={() => copy(c.university_wallet!)}
                              title="Copy issuer wallet"
                            >
                              {copied === c.university_wallet ? (
                                <Check className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-gray-300" />
                              )}
                            </button>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="whitespace-nowrap">
                          {c.issued_date
                            ? new Date(c.issued_date).toLocaleDateString()
                            : ""}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-gray-200 hover:bg-white/5 h-8 px-3"
                          onClick={() => openShare(c)}
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* details modal - polished layout, not raw json */}
        {detailsOpen && activeCred && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={closeDetails}
            />

            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-50 w-full max-w-3xl"
            >
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Premium header */}
                <div className="relative p-6 border-b border-gray-800">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.18),transparent_60%)] pointer-events-none" />
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                          {ipfsData?.name ||
                            ipfsData?.degree_name ||
                            activeCred.degree_name ||
                            "Credential"}
                        </h3>
                        {getAttr("Credential Type") && (
                          <Badge className="bg-purple-900/40 text-purple-200 border-purple-800">
                            {getAttr("Credential Type")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {ipfsData?.description || activeCred.description || ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Issued</div>
                        <div className="text-sm text-white">
                          {getAttr("Issue Date") ||
                          ipfsData?.issued_date ||
                          activeCred.issued_date
                            ? new Date(
                                (getAttr("Issue Date") ||
                                  ipfsData?.issued_date ||
                                  activeCred.issued_date) as string
                              ).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={closeDetails}
                        className="text-gray-300"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {ipfsLoading ? (
                    <div className="text-sm text-gray-400">
                      Loading credential from IPFS...
                    </div>
                  ) : ipfsError ? (
                    <div className="text-sm text-red-400">{ipfsError}</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Top section (important info) */}
                      <div className="md:col-span-2 bg-gradient-to-br from-gray-950/80 to-gray-900/70 p-5 rounded-xl border border-gray-800/70">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Issuing Institution
                              </div>
                              <div className="text-sm text-white">
                                {getAttr("Issuing Institution") ||
                                  ipfsData?.institution ||
                                  ipfsData?.universityName ||
                                  activeCred.universityName ||
                                  "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <UserIcon className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Recipient
                              </div>
                              <div className="text-sm text-white">
                                {getAttr("Recipient Name") || "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <GraduationCap className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">Major</div>
                              <div className="text-sm text-white">
                                {getAttr("Major") ||
                                  ipfsData?.major ||
                                  activeCred.major ||
                                  "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <BarChart3 className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">GPA</div>
                              <div className="text-sm text-white">
                                {getAttr("GPA") ||
                                  ipfsData?.gpa ||
                                  (ipfsData?.score as any) ||
                                  "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Hash className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Credential ID
                              </div>
                              <div className="text-sm text-white break-words">
                                {getAttr("Credential ID") ||
                                  ipfsData?.id ||
                                  activeCred.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <BadgeCheck className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Accreditation Body
                              </div>
                              <div className="text-sm text-white">
                                {getAttr("Accreditation Body") ||
                                  ipfsData?.accreditation ||
                                  ipfsData?.authority ||
                                  "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <CalendarDays className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Issue Date
                              </div>
                              <div className="text-sm text-white">
                                {getAttr("Issue Date") ||
                                ipfsData?.issued_date ||
                                activeCred.issued_date
                                  ? new Date(
                                      (getAttr("Issue Date") ||
                                        ipfsData?.issued_date ||
                                        activeCred.issued_date) as string
                                    ).toLocaleDateString()
                                  : "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <CalendarDays className="h-5 w-5 text-purple-300 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Graduation Date
                              </div>
                              <div className="text-sm text-white">
                                {getAttr("Graduation Date") ||
                                ipfsData?.graduation_date ||
                                activeCred.graduation_date
                                  ? new Date(
                                      (getAttr("Graduation Date") ||
                                        ipfsData?.graduation_date ||
                                        activeCred.graduation_date) as string
                                    ).toLocaleDateString()
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Wallets + signature + extra */}
                      <div className="md:col-span-1 flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900/85 to-gray-900/75 border border-gray-800">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between text-left"
                            onClick={() => setWalletsOpen((s) => !s)}
                          >
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-purple-300" />
                              <div>
                                <div className="text-xs text-gray-400">
                                  Wallets
                                </div>
                                <div className="text-sm text-white">
                                  Recipient / Issuer
                                </div>
                              </div>
                            </div>
                            {walletsOpen ? (
                              <ChevronUp className="h-4 w-4 text-gray-300" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-300" />
                            )}
                          </button>

                          <AnimatePresence initial={false}>
                            {walletsOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 space-y-3 text-sm text-gray-300">
                                  <div>
                                    <div className="text-xs text-gray-400">
                                      Recipient
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="break-words max-w-full">
                                        {getAttr("Recipient Wallet") ||
                                          ipfsData?.student_wallet ||
                                          activeCred.student_wallet ||
                                          "—"}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          copyToClipboard(
                                            String(
                                              getAttr("Recipient Wallet") ||
                                                ipfsData?.student_wallet ||
                                                activeCred.student_wallet ||
                                                ""
                                            )
                                          )
                                        }
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-400">
                                      Issuer
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="break-words max-w-full">
                                        {getAttr("Issuer Wallet") ||
                                          ipfsData?.university_wallet ||
                                          activeCred.university_wallet ||
                                          "—"}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          copyToClipboard(
                                            String(
                                              getAttr("Issuer Wallet") ||
                                                ipfsData?.university_wallet ||
                                                activeCred.university_wallet ||
                                                ""
                                            )
                                          )
                                        }
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900/85 to-gray-900/75 border border-gray-800 text-sm">
                          <div className="text-xs text-gray-400">Signature</div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-sm text-white break-words">
                              {ipfsData?.custom_fields?.deanSignatureHash ||
                                ipfsData?.dean_sig ||
                                activeCred?.dean_sig ||
                                "—"}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(
                                  String(
                                    ipfsData?.custom_fields
                                      ?.deanSignatureHash ||
                                      ipfsData?.dean_sig ||
                                      activeCred?.dean_sig ||
                                      ""
                                  )
                                )
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Only render additional attributes container when open and available to avoid blank spacing */}
                        {Array.isArray(ipfsData?.attributes) &&
                          (() => {
                            const known = [
                              "Credential Type",
                              "Issuing Institution",
                              "Issuer Wallet",
                              "Recipient Name",
                              "Recipient Wallet",
                              "Issue Date",
                              "Graduation Date",
                              "Major",
                              "GPA",
                              "Credential ID",
                              "Accreditation Body",
                            ];
                            const extra = ipfsData!.attributes.filter(
                              (a: any) => {
                                const k = a?.trait_type || a?.traitType;
                                return k && !known.includes(k);
                              }
                            );
                            if (!additionalOpen || extra.length === 0)
                              return null;
                            return (
                              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900/85 to-gray-900/75 border border-gray-800 text-sm">
                                <AnimatePresence initial={false}>
                                  {additionalOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-3 space-y-2 text-sm text-gray-300 max-h-40 overflow-auto pr-1">
                                        {extra.map((a: any, idx: number) => (
                                          <div
                                            key={`${
                                              a?.trait_type || a?.traitType
                                            }-${idx}`}
                                            className="flex items-start gap-2"
                                          >
                                            <div className="text-xs text-gray-400 w-36">
                                              {a?.trait_type || a?.traitType}
                                            </div>
                                            <div className="text-sm text-white break-words">
                                              {String(a?.value ?? "—")}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Share Modal */}
        {shareOpen && shareFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={closeShare}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-50 w-full max-w-md"
            >
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">
                      Share Credential
                    </div>
                    <div className="text-xs text-gray-400">
                      {shareFor.degree_name || "Credential"}
                    </div>
                  </div>
                  <button
                    onClick={closeShare}
                    className="text-gray-400 hover:text-white p-1 rounded-md"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="text-sm text-gray-300">Select expiration</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      className="bg-white text-black hover:bg-gray-100"
                      disabled={shareLoading}
                      onClick={() => generateShare(1)}
                    >
                      1 Hour
                    </Button>
                    <Button
                      className="bg-white text-black hover:bg-gray-100"
                      disabled={shareLoading}
                      onClick={() => generateShare(24)}
                    >
                      24 Hours
                    </Button>
                    <Button
                      className="bg-white text-black hover:bg-gray-100"
                      disabled={shareLoading}
                      onClick={() => generateShare(7 * 24)}
                    >
                      7 Days
                    </Button>
                  </div>
                  {shareError && (
                    <div className="text-xs text-red-300 bg-red-900/20 border border-red-800 rounded px-3 py-2">
                      {shareError}
                    </div>
                  )}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 flex items-center justify-center min-h-44">
                    {shareLoading ? (
                      <div className="text-gray-400 text-sm">
                        Generating link…
                      </div>
                    ) : shareUrl ? (
                      <div
                        className="flex flex-col items-center gap-3"
                        ref={qrWrapRef}
                      >
                        <QRCodeCanvas
                          value={shareUrl}
                          size={208}
                          bgColor="#0b0b0b"
                          fgColor="#ffffff"
                          includeMargin={false}
                        />
                        <div className="text-[11px] text-gray-400 truncate max-w-[220px]">
                          {summarizeShareUrl(shareUrl)}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            size="sm"
                            className="bg-white text-black hover:bg-gray-100"
                            onClick={() =>
                              navigator.clipboard.writeText(shareUrl!)
                            }
                          >
                            Copy URL
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-200 hover:bg-white/5"
                            onClick={downloadBrandedQR}
                          >
                            Download PNG
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-200 hover:bg-white/5"
                            onClick={nativeShareBrandedQR}
                          >
                            Share Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Choose an expiration to
                        generate
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
