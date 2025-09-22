"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

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

export default function VerifierPortalPage() {
  const params = useParams();
  const search = useSearchParams();
  const uuid = (params as any)?.uuid as string | undefined;
  const token = search?.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult>({ status: null });
  const [error, setError] = useState<string | null>(null);

  // If UUID and token exist, auto-fetch credential info
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

        // If successful, map server result to our statuses
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
        else status = "VERIFIED"; // if API returns data, treat as verified by default

        setResult({ status, message: data.message, details: data });
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          setError("This verification link is invalid or has expired.");
        } else {
          setError(
            e?.response?.data?.message || e.message || "Verification failed"
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [uuid, token]);

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
            If this page was opened from a share link, verification happens
            automatically.
          </p>
        </motion.div>

        {/* States */}
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

        {result.status && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 relative overflow-hidden rounded-xl border ${
              statusConfig[result.status].border
            } ${statusConfig[result.status].bg} p-5`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                statusConfig[result.status].subtle
              } pointer-events-none`}
            />
            <div className="relative flex items-start gap-4">
              <div className="mt-1">
                {React.createElement(statusConfig[result.status].icon, {
                  className: `h-6 w-6 ${statusConfig[result.status].color}`,
                })}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-lg ${
                    statusConfig[result.status].color
                  }`}
                >
                  {statusConfig[result.status].label}
                </h3>
                <p className="mt-1 text-sm text-gray-300 leading-relaxed break-words">
                  {result.message ??
                    defaultResultText[
                      result.status as "VERIFIED" | "NOT_FOUND" | "TAMPERED"
                    ]}
                </p>
              </div>
            </div>
          </motion.div>
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
