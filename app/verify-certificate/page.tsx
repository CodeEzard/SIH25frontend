"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type VerifyStatus =
  | "idle"
  | "checking"
  | "VERIFIED"
  | "NOT_FOUND"
  | "TAMPERED"
  | "error";

const statusConfig: Record<
  Exclude<VerifyStatus, "idle" | "checking" | "error">,
  { label: string; color: string; subtle: string; border: string }
> = {
  VERIFIED: {
    label: "Original certificate",
    color: "text-green-400",
    subtle: "from-green-500/10 via-green-500/5 to-transparent",
    border: "border-green-500/30",
  },
  NOT_FOUND: {
    label: "Possible forgery",
    color: "text-red-400",
    subtle: "from-red-500/10 via-red-500/5 to-transparent",
    border: "border-red-500/30",
  },
  TAMPERED: {
    label: "Integrity mismatch",
    color: "text-amber-400",
    subtle: "from-amber-500/10 via-amber-500/5 to-transparent",
    border: "border-amber-500/30",
  },
};

export default function VerifyCertificatePage() {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [linkValue, setLinkValue] = useState<string>("");

  const icon = useMemo(() => {
    if (status === "checking")
      return <Loader2 className="h-5 w-5 animate-spin text-purple-400" />;
    if (status === "VERIFIED")
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    if (status === "TAMPERED")
      return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    if (status === "NOT_FOUND")
      return <XCircle className="h-5 w-5 text-red-400" />;
    return null;
  }, [status]);

  // Narrowed key for safe indexing into statusConfig
  const statusKey = useMemo<keyof typeof statusConfig | null>(() => {
    return status === "VERIFIED" ||
      status === "NOT_FOUND" ||
      status === "TAMPERED"
      ? status
      : null;
  }, [status]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const sha256 = async (buf: ArrayBuffer) => {
    const d = await crypto.subtle.digest("SHA-256", buf);
    const bytes = Array.from(new Uint8Array(d));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const submit = useCallback(async () => {
    if (mode === "link") {
      // If the user pasted a share link, route them to it (QR flow)
      const m = linkValue.match(/\/verify\/(\w[\w-]*)/i);
      if (m) {
        window.location.href = linkValue;
        return;
      }
      setStatus("error");
      setMessage("Unrecognized link. Please paste a valid credential link.");
      return;
    }

    if (!file) return;
    setStatus("checking");
    setMessage("");
    try {
      const buf = await file.arrayBuffer();
      const hash = await sha256(buf);

      // Try backend verification (adjust endpoint if needed)
      const form = new FormData();
      form.append("file", file);
      form.append("hash", hash);

      const resp = await fetch("http://localhost:8080/api/v1/verify-document", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Verification failed (${resp.status})`);
      }
      const data = await resp.json();
      const raw = String(data?.status || data?.result || "").toUpperCase();

      // Robust status mapping
      let mapped: VerifyStatus;
      if (["VERIFIED", "VALID", "AUTHENTIC", "ORIGINAL"].includes(raw)) {
        mapped = "VERIFIED";
      } else if (
        raw.includes("TAMPER") || // e.g., POTENTIALLY_TAMPERED, TAMPERED
        raw.includes("MISMATCH") || // e.g., INTEGRITY_MISMATCH, NAME_MISMATCH
        ["INVALID", "FORGED", "FAKE"].includes(raw)
      ) {
        mapped = "TAMPERED";
      } else if (
        raw.includes("NOT_FOUND") ||
        raw.includes("NO_MATCH") ||
        ["UNKNOWN", "MISSING", "NO_RECORD"].includes(raw)
      ) {
        mapped = "NOT_FOUND";
      } else {
        // Safe default: treat as tampered if unrecognized
        mapped = "TAMPERED";
      }

      setStatus(mapped);
      setMessage(data?.message || "");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Verification failed");
    }
  }, [file, mode, linkValue]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black text-white py-10 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Verify a Certificate
          </h1>
          <p className="mt-3 text-gray-400 text-sm md:text-base">
            Upload a certificate file to check authenticity. Or paste a
            credential link to follow its QR verification flow.
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-6 text-sm">
          <button
            className={`px-3 py-1.5 rounded-full border ${
              mode === "upload"
                ? "border-white/30 bg-white/10"
                : "border-white/10 text-gray-300"
            }`}
            onClick={() => setMode("upload")}
          >
            Upload File
          </button>
          <button
            className={`px-3 py-1.5 rounded-full border ${
              mode === "link"
                ? "border-white/30 bg-white/10"
                : "border-white/10 text-gray-300"
            }`}
            onClick={() => setMode("link")}
          >
            Paste Link
          </button>
        </div>

        {mode === "upload" ? (
          <div>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`rounded-2xl border ${
                dragActive
                  ? "border-purple-500/50 bg-purple-900/10"
                  : "border-white/10 bg-gray-900/50"
              } p-6 text-center`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-purple-300" />
                </div>
                <div className="text-sm text-gray-300">
                  Drag & drop a PDF/Image here, or select a file
                </div>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={pick}
                  className="hidden"
                  id="cert-file"
                />
                <label
                  htmlFor="cert-file"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer text-sm"
                >
                  Choose file
                </label>
                {file && (
                  <div className="text-xs text-gray-400 mt-1">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={submit}
                disabled={!file || status === "checking"}
                className="bg-white text-black hover:bg-gray-100"
              >
                {status === "checking" ? "Checking…" : "Verify"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <LinkIcon className="h-4 w-4 text-purple-300" />
              Paste a credential link (e.g., QR share link)
            </div>
            <input
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://your-app.com/verify/UUID?token=…"
              className="mt-3 w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={submit}
                className="bg-white text-black hover:bg-gray-100"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Result */}
        {status !== "idle" && status !== "checking" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 relative overflow-hidden rounded-xl border ${
              statusKey ? statusConfig[statusKey].border : "border-white/10"
            } p-5`}
          >
            {statusKey && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${statusConfig[statusKey].subtle} pointer-events-none`}
              />
            )}
            <div className="relative flex items-start gap-3">
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-lg ${
                    statusKey ? statusConfig[statusKey].color : "text-white"
                  }`}
                >
                  {status === "error"
                    ? "Verification failed"
                    : statusKey
                    ? statusConfig[statusKey].label
                    : "Result"}
                </h3>
                {!!message && (
                  <p className="mt-1 text-sm text-gray-300 leading-relaxed break-words">
                    {message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
