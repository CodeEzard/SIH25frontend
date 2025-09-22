"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building2,
  User as UserIcon,
  GraduationCap,
  Hash,
  BarChart3,
  ExternalLink,
  Copy,
  Check,
  Award,
  CalendarDays,
  Wallet,
  ShieldCheck,
} from "lucide-react";

interface VerificationResult {
  status: "VERIFIED" | "NOT_FOUND" | "TAMPERED" | null;
  message?: string;
  details?: any;
}

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    subtle: string;
  }
> = {
  VERIFIED: {
    label: "Original certificate",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    subtle: "from-green-500/10 via-green-500/5 to-transparent",
  },
  NOT_FOUND: {
    label: "Possible forgery",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    subtle: "from-red-500/10 via-red-500/5 to-transparent",
  },
  TAMPERED: {
    label: "Integrity mismatch",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    subtle: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
};

const defaultResultText: Record<"VERIFIED" | "NOT_FOUND" | "TAMPERED", string> =
  {
    VERIFIED:
      "No forgery detected. The document matches our registered record.",
    NOT_FOUND:
      "We couldn’t match this document in our records. It may be unregistered or a possible forgery.",
    TAMPERED:
      "The document’s integrity check failed. Content appears altered from the registered record.",
  };

export default function VerifyByUuidPage() {
  const params = useParams();
  const search = useSearchParams();
  const uuid = (params as any)?.uuid as string | undefined;
  const token = search?.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult>({ status: null });
  const [error, setError] = useState<string | null>(null);

  // IPFS state
  const [ipfsData, setIpfsData] = useState<any>(null);
  const [ipfsLoading, setIpfsLoading] = useState(false);
  const [ipfsError, setIpfsError] = useState<string | null>(null);
  const [ipfsResolvedUrl, setIpfsResolvedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<
    null | "link" | "issuer" | "recipient" | "credid"
  >(null);

  // helpers
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

  const fetchIpfs = useCallback(async (rawIpfs: string) => {
    if (!rawIpfs) return;
    const normalize = (link: string) => {
      if (/^https?:\/\//.test(link)) return link;
      if (link.startsWith("ipfs://")) return link.replace(/^ipfs:\/\//, "");
      if (link.startsWith("/ipfs/")) return link.replace(/^\/ipfs\//, "");
      return link;
    };
    const normalized = normalize(rawIpfs);
    const gateways = [
      (h: string) => `https://cloudflare-ipfs.com/ipfs/${h}`,
      (h: string) => `https://ipfs.io/ipfs/${h}`,
      (h: string) => `https://dweb.link/ipfs/${h}`,
    ];
    const tryUrls: string[] = [];
    if (/^https?:\/\//.test(normalized)) {
      tryUrls.push(normalized);
    } else {
      const [hash, ...rest] = normalized.split("/");
      const path = rest.length ? `/${rest.join("/")}` : "";
      for (const g of gateways) tryUrls.push(g(hash) + path);
    }

    setIpfsLoading(true);
    setIpfsError(null);
    setIpfsData(null);
    setIpfsResolvedUrl(null);
    let success = false;
    for (const url of tryUrls) {
      try {
        const r = await fetch(url, { mode: "cors" });
        if (!r.ok) continue;
        const ct = r.headers.get("content-type") || "";
        if (ct.includes("application/json") || ct.includes("text/json")) {
          const json = await r.json();
          setIpfsData(json);
        } else {
          const text = await r.text();
          try {
            setIpfsData(JSON.parse(text));
          } catch {
            setIpfsData({ content: text });
          }
        }
        setIpfsResolvedUrl(url);
        success = true;
        break;
      } catch {}
    }
    if (!success)
      setIpfsError("Failed to fetch IPFS content (CORS or gateway error).");
    setIpfsLoading(false);
  }, []);

  useEffect(() => {
    if (!uuid || !token) return;
    (async () => {
      setLoading(true);
      setError(null);
      setResult({ status: null });
      try {
        const url = `http://localhost:8080/api/v1/credential-info/${encodeURIComponent(
          uuid
        )}?token=${encodeURIComponent(token)}`;
        const res = await axios.get(url);
        const data = res.data || {};

        let status: VerificationResult["status"] = null;
        const rawStatus = (data.status || data.result || "")
          .toString()
          .toUpperCase();
        if (["VERIFIED", "VALID", "SUCCESS"].includes(rawStatus))
          status = "VERIFIED";
        else if (["NOT_FOUND", "MISSING", "NO_MATCH"].includes(rawStatus))
          status = "NOT_FOUND";
        else if (["TAMPERED", "INVALID", "MANIPULATED"].includes(rawStatus))
          status = "TAMPERED";
        else status = "VERIFIED"; // treat data presence as verified

        setResult({ status, message: data.message, details: data });

        const ipfs =
          data?.ipfs_link ||
          data?.ip_fs_link ||
          data?.ipfsHash ||
          data?.ipfs ||
          data?.tokenURI ||
          data?.tokenUri ||
          (data as any)?.credential?.ipfs_link ||
          (data as any)?.credential?.tokenURI ||
          (data as any)?.credential?.tokenUri ||
          null;
        const trimmed = typeof ipfs === "string" ? ipfs.trim() : ipfs;
        if (trimmed) fetchIpfs(trimmed as string);
      } catch (e: any) {
        const st = e?.response?.status;
        if (st === 401 || st === 403)
          setError("This verification link is invalid or has expired.");
        else
          setError(
            e?.response?.data?.message || e.message || "Verification failed"
          );
      } finally {
        setLoading(false);
      }
    })();
  }, [uuid, token, fetchIpfs]);

  const formatDate = (d?: string) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black py-12 px-4 md:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Credential Verification
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Opened via a share link? Verification happens automatically.
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-300 pt-2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            Verifying credential...
          </div>
        )}

        {error && !loading && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* IPFS full details */}
        {ipfsLoading && (
          <div className="mt-6 text-sm text-gray-400">
            Loading credential details…
          </div>
        )}
        {ipfsError && (
          <div className="mt-4 text-xs text-amber-300">{ipfsError}</div>
        )}
        {ipfsData && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/70 to-black/60 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {ipfsData?.name || ipfsData?.degree_name || "Credential"}
                </h3>
                {ipfsData?.description && (
                  <p className="text-sm text-gray-300 mt-1">
                    {ipfsData.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {ipfsResolvedUrl && (
                  <a
                    href={ipfsResolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-200 hover:bg-white/5"
                    title="Open IPFS URL"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                )}
                {ipfsResolvedUrl && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(ipfsResolvedUrl);
                        setCopied("link");
                        setTimeout(() => setCopied(null), 1200);
                      } catch {}
                    }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-200 hover:bg-white/5"
                    title="Copy IPFS URL"
                  >
                    {copied === "link" ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy URL
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <Building2 className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">
                    Issuing Institution
                  </div>
                  <div className="text-white">
                    {getAttr("Issuing Institution") ||
                      ipfsData?.institution ||
                      ipfsData?.universityName ||
                      "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <UserIcon className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">Recipient</div>
                  <div className="text-white">
                    {getAttr("Recipient Name") ||
                      ipfsData?.recipient ||
                      ipfsData?.studentName ||
                      "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <GraduationCap className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">Major</div>
                  <div className="text-white">
                    {getAttr("Major") || ipfsData?.major || "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <BarChart3 className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">GPA</div>
                  <div className="text-white">
                    {getAttr("GPA") ||
                      (ipfsData as any)?.gpa ||
                      (ipfsData as any)?.score ||
                      "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <Award className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">Credential Type</div>
                  <div className="text-white">
                    {getAttr("Credential Type") ||
                      ipfsData?.type ||
                      ipfsData?.degree_type ||
                      "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <CalendarDays className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">Issue Date</div>
                  <div className="text-white">
                    {formatDate(
                      getAttr("Issue Date") ||
                        (ipfsData as any)?.issued_date ||
                        (ipfsData as any)?.issue_date
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <CalendarDays className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">Graduation Date</div>
                  <div className="text-white">
                    {formatDate(
                      getAttr("Graduation Date") ||
                        (ipfsData as any)?.graduation_date
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <Wallet className="h-4 w-4 text-purple-300 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">Issuer Wallet</div>
                  <div className="text-white break-all text-xs flex items-center gap-2">
                    {getAttr("Issuer Wallet") ||
                      (ipfsData as any)?.issuer_wallet ||
                      (ipfsData as any)?.university_wallet ||
                      "—"}
                    {getAttr("Issuer Wallet") && (
                      <button
                        onClick={async () => {
                          const v = getAttr("Issuer Wallet");
                          if (!v) return;
                          try {
                            await navigator.clipboard.writeText(v);
                            setCopied("issuer");
                            setTimeout(() => setCopied(null), 1000);
                          } catch {}
                        }}
                        className="p-1 rounded hover:bg-white/10"
                        title="Copy issuer wallet"
                      >
                        {copied === "issuer" ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <Wallet className="h-4 w-4 text-purple-300 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">Recipient Wallet</div>
                  <div className="text-white break-all text-xs flex items-center gap-2">
                    {getAttr("Recipient Wallet") ||
                      (ipfsData as any)?.recipient_wallet ||
                      (ipfsData as any)?.student_wallet ||
                      "—"}
                    {getAttr("Recipient Wallet") && (
                      <button
                        onClick={async () => {
                          const v = getAttr("Recipient Wallet");
                          if (!v) return;
                          try {
                            await navigator.clipboard.writeText(v);
                            setCopied("recipient");
                            setTimeout(() => setCopied(null), 1000);
                          } catch {}
                        }}
                        className="p-1 rounded hover:bg-white/10"
                        title="Copy recipient wallet"
                      >
                        {copied === "recipient" ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <Hash className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">Credential ID</div>
                  <div className="text-white break-all text-xs">
                    {getAttr("Credential ID") ||
                      (ipfsData as any)?.credentialId ||
                      (ipfsData as any)?.id ||
                      "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-900/40 p-4 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-purple-300 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-400">
                    Accreditation Body
                  </div>
                  <div className="text-white">
                    {getAttr("Accreditation Body") ||
                      (ipfsData as any)?.accreditationBody ||
                      (ipfsData as any)?.accreditation?.name ||
                      "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!uuid && (
          <div className="mt-6 text-sm text-gray-400">
            Provide a valid credential link to verify.
          </div>
        )}
      </div>
    </div>
  );
}
