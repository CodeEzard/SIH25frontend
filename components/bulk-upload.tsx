"use client";

import React, { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  CloudUpload,
  FileSpreadsheet,
} from "lucide-react";
import { getStoredToken } from "@/components/auth/jwt";
import { motion } from "framer-motion";

type Status = "idle" | "uploading" | "success" | "error";

type ApiErrorItem = { row?: number; field?: string; message: string } | string;

const EXPECTED_HEADER = [
  "student_name",
  "roll_number",
  "program",
  "major",
  "batch_year",
  "issued_date",
  "graduation_date",
];

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const CSV_EXT = /\.csv$/i;

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [count, setCount] = useState<number | null>(null);
  const [headerOk, setHeaderOk] = useState<boolean | null>(null);
  const [headerError, setHeaderError] = useState<string>("");
  const [apiErrors, setApiErrors] = useState<ApiErrorItem[]>([]);
  const [techDetails, setTechDetails] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // New UI states
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      // Abort any in-flight request on unmount
      abortRef.current?.abort();
    };
  }, []);

  const normalize = (s: string) =>
    s
      .replace(/^\uFEFF/, "")
      .replace(/^[']|[']$/g, "")
      .replace(/^[\"]|[\"]$/g, "")
      .trim()
      .toLowerCase();

  // Split a single CSV line honoring quotes
  const splitCSVLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };

  async function validateHeader(f: File) {
    try {
      // Basic local validations first
      if (!CSV_EXT.test(f.name)) {
        setHeaderOk(false);
        setHeaderError("Invalid file type. Please upload a .csv file.");
        return false;
      }
      if (f.size === 0) {
        setHeaderOk(false);
        setHeaderError("File is empty.");
        return false;
      }
      if (f.size > MAX_SIZE_BYTES) {
        setHeaderOk(false);
        setHeaderError(`File too large. Max ${MAX_SIZE_MB} MB allowed.`);
        return false;
      }

      const text = await f.text();
      const firstNonEmpty =
        text
          .replace(/^\uFEFF/, "")
          .split(/\r?\n/)
          .find((l) => l.trim().length > 0) || "";
      if (!firstNonEmpty) {
        setHeaderOk(false);
        setHeaderError("File has no readable header row.");
        return false;
      }
      const cols = splitCSVLine(firstNonEmpty).map(normalize);

      const expected = EXPECTED_HEADER;
      const matches =
        cols.length === expected.length &&
        cols.every((c, i) => c === expected[i]);
      if (!matches) {
        setHeaderOk(false);
        setHeaderError(
          `Invalid CSV header. Expected exactly: ${EXPECTED_HEADER.join(",")}`
        );
        return false;
      }
      // Check duplicates
      const dup = cols.find((c, idx) => cols.indexOf(c) !== idx);
      if (dup) {
        setHeaderOk(false);
        setHeaderError(`Duplicate column detected: ${dup}`);
        return false;
      }

      setHeaderOk(true);
      setHeaderError("");
      return true;
    } catch (e: any) {
      setHeaderOk(false);
      setHeaderError(e?.message || "Failed to read CSV header");
      return false;
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setStatus("idle");
    setMessage("");
    setCount(null);
    setApiErrors([]);
    setTechDetails(null);
    setSuggestions([]);
    setProgress(0);
    if (f) {
      await validateHeader(f);
    } else {
      setHeaderOk(null);
      setHeaderError("");
    }
  };

  // Drag & drop handlers
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
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      // Simulate input event for reuse
      await onFileChange({ target: { files: [f] } } as any);
    }
  };

  const clearFile = () => {
    setFile(null);
    setHeaderOk(null);
    setHeaderError("");
    setApiErrors([]);
    setMessage("");
    setCount(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const parseApiErrors = (data: any): ApiErrorItem[] => {
    if (!data || typeof data !== "object") return [];
    const candidates = [
      data.errors,
      data.validationErrors,
      data.failedRows,
      data.failures,
      data.details?.errors,
      data.error?.details,
    ].filter(Boolean);
    const first = candidates.find((c: any) => Array.isArray(c));
    if (!first) return [];
    return (first as any[]).map((e) => {
      if (!e) return "Unknown error";
      if (typeof e === "string") return e;
      const row = e.row ?? e.line ?? e.index ?? undefined;
      const field = e.field ?? e.column ?? undefined;
      const msg = e.message ?? e.error ?? JSON.stringify(e);
      return { row, field, message: String(msg) } as ApiErrorItem;
    });
  };

  const buildErrorMessage = (err: unknown) => {
    let primary = "Upload failed";
    const nextSuggestions: string[] = [];
    let details: any = null;

    if (axios.isAxiosError(err)) {
      const ax = err as AxiosError<any>;
      const status = ax.response?.status;
      const statusText = ax.response?.statusText;
      const code = ax.code;

      if (status)
        primary = `Request failed (${status}${
          statusText ? ` ${statusText}` : ""
        })`;
      else if (code === "ERR_CANCELED") primary = "Upload canceled";
      else if (code === "ECONNABORTED") primary = "Request timed out";
      else if (code) primary = `Network error (${code})`;

      const serverMsg = ax.response?.data?.message || ax.response?.data?.error;
      if (serverMsg) primary += `: ${serverMsg}`;

      // Suggestions
      if (!status) {
        nextSuggestions.push(
          "Is the backend running at https://localhost:8080?",
          "If using self-signed TLS locally, ensure your browser trusts it or switch to http."
        );
      }
      if (status === 401 || status === 403) {
        nextSuggestions.push(
          "Your session may have expired. Please log in again."
        );
      }
      if (status === 413) {
        nextSuggestions.push(`File too large. Keep under ${MAX_SIZE_MB} MB.`);
      }
      if (status && status >= 500) {
        nextSuggestions.push(
          "Server error. Try again later or contact support."
        );
      }

      details = {
        status,
        statusText,
        code,
        response: ax.response?.data ?? null,
      };
    } else if (err instanceof Error) {
      primary = err.message || primary;
    } else if (typeof err === "string") {
      primary = err;
    }

    return { primary, suggestions: nextSuggestions, details };
  };

  const onUpload = async () => {
    if (!file) return;
    if (headerOk === false) return; // block invalid header

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("uploading");
    setMessage("");
    setCount(null);
    setApiErrors([]);
    setTechDetails(null);
    setSuggestions([]);
    setProgress(0);

    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("Not authenticated. Please log in and try again.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:8080/api/v1/institution/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
          timeout: 60000, // 60s timeout
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const p = Math.round((evt.loaded / evt.total) * 100);
            setProgress(p);
          },
        }
      );

      const data = res.data || {};
      const imported =
        data.importedCount ??
        data.count ??
        data.rowsImported ??
        data.total ??
        null;

      const parsedErrors = parseApiErrors(data);

      setStatus("success");
      setCount(typeof imported === "number" ? imported : null);
      setMessage(
        typeof data.message === "string"
          ? data.message
          : parsedErrors.length > 0
          ? `Completed with ${parsedErrors.length} row error(s).`
          : "Upload completed successfully."
      );
      setApiErrors(parsedErrors);
      setTechDetails(null);
      setProgress(100);
    } catch (e: any) {
      const { primary, suggestions: tips, details } = buildErrorMessage(e);
      setStatus("error");
      setMessage(primary);
      setSuggestions(tips);
      setTechDetails(details);
      // If server returned structured errors, surface them
      const serverData = (e?.response && e.response.data) || null;
      setApiErrors(parseApiErrors(serverData));
    }
  };

  const disabled = !file || status === "uploading" || headerOk === false;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/40 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-purple-300" />
            <span>Bulk Upload Historical Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {/* Hero */}
          <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-black/50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-gray-300">
                  Import legacy credentials in one go using our CSV template.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Required header order:
                  <span className="block mt-1 font-mono text-[11px] text-gray-200/90 break-words">
                    {EXPECTED_HEADER.join(",")}
                  </span>
                </p>
              </div>
              <a href="/template.csv" download>
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 inline-flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Download Template
                </Button>
              </a>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={[
              "relative rounded-xl border-2 border-dashed p-4 sm:p-6 transition",
              dragActive
                ? "border-purple-400/60 bg-purple-900/10"
                : "border-gray-800 bg-gray-900/60",
            ].join(" ")}
          >
            <input
              ref={inputRef}
              id="csv-input"
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload CSV"
            />
            <div className="pointer-events-none flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
              <motion.div
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30"
              >
                <CloudUpload className="h-6 w-6 text-purple-300" />
              </motion.div>
              <div className="text-gray-200 text-sm">
                Drag & drop your CSV here
                <span className="text-gray-400"> or click to browse</span>
              </div>
              <div className="text-[11px] text-gray-500">
                Max {MAX_SIZE_MB} MB • .csv only
              </div>
            </div>

            {/* Selected file pill */}
            {file && (
              <div className="pointer-events-auto absolute left-3 top-3 flex items-center gap-2 rounded-full border border-gray-800 bg-black/50 px-3 py-1 text-xs text-gray-200 shadow">
                <span className="truncate max-w-[50vw] sm:max-w-[40ch]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="rounded-full p-1 hover:bg-white/10"
                  aria-label="Remove selected file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Header validation badges */}
            {headerOk === false && (
              <div className="mt-4 sm:mt-5 rounded-md border border-red-700/40 bg-red-900/20 p-3 text-red-300 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="font-medium">Invalid CSV header</div>
                    <div className="mt-1">
                      {headerError || `Expected: ${EXPECTED_HEADER.join(",")}`}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {headerOk === true && (
              <div className="mt-4 sm:mt-5 rounded-md border border-green-700/40 bg-green-900/20 p-3 text-green-300 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Header looks valid
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={onUpload}
              disabled={disabled}
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 inline-flex items-center gap-2 justify-center"
            >
              {status === "uploading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {status === "uploading" ? "Uploading…" : "Upload & Process"}
            </Button>
            {file && (
              <Button
                variant="outline"
                onClick={clearFile}
                className="w-full sm:w-auto border-gray-700 text-gray-200 hover:bg-white/5 inline-flex items-center gap-2 justify-center"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Clear file
              </Button>
            )}
          </div>

          {/* Progress */}
          {status === "uploading" && (
            <div className="space-y-2" aria-live="polite">
              <div className="flex items-center gap-3 text-gray-300">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                Uploading and validating... this may take a few minutes.
              </div>
              <div className="h-2 w-full overflow-hidden rounded bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">{progress}%</div>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="space-y-3" aria-live="polite">
              <div className="rounded-md border border-green-700/40 bg-green-900/20 p-3 text-green-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Upload complete</div>
                    <div className="mt-1 text-green-200/90">
                      {count !== null ? `${count} records` : "Records"} were
                      imported successfully.
                    </div>
                    {message && (
                      <div className="mt-1 text-xs text-green-200/80">
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {apiErrors.length > 0 && (
                <div className="rounded-md border border-yellow-700/40 bg-yellow-900/20 p-3 text-yellow-200">
                  <div className="font-medium">
                    Some rows failed to import ({apiErrors.length})
                  </div>
                  <ul className="mt-2 max-h-48 overflow-auto space-y-1 text-xs">
                    {apiErrors.slice(0, 50).map((e, i) =>
                      typeof e === "string" ? (
                        <li key={i}>• {e}</li>
                      ) : (
                        <li key={i}>
                          • {e.row ? `Row ${e.row}: ` : ""}
                          {e.field ? `[${e.field}] ` : ""}
                          {e.message}
                        </li>
                      )
                    )}
                    {apiErrors.length > 50 && (
                      <li className="opacity-80">
                        • and {apiErrors.length - 50} more…
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="space-y-3" aria-live="assertive">
              <div className="rounded-md border border-red-700/40 bg-red-900/20 p-3 text-red-300">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Upload error</div>
                    <div className="mt-1">
                      {message ||
                        "Upload failed. Please ensure the CSV matches the template."}
                    </div>
                  </div>
                </div>
              </div>
              {apiErrors.length > 0 && (
                <div className="rounded-md border border-yellow-700/40 bg-yellow-900/20 p-3 text-yellow-200">
                  <div className="font-medium">Validation errors</div>
                  <ul className="mt-2 max-h-48 overflow-auto space-y-1 text-xs">
                    {apiErrors.slice(0, 50).map((e, i) =>
                      typeof e === "string" ? (
                        <li key={i}>• {e}</li>
                      ) : (
                        <li key={i}>
                          • {e.row ? `Row ${e.row}: ` : ""}
                          {e.field ? `[${e.field}] ` : ""}
                          {e.message}
                        </li>
                      )
                    )}
                    {apiErrors.length > 50 && (
                      <li className="opacity-80">
                        • and {apiErrors.length - 50} more…
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {(suggestions.length > 0 || techDetails) && (
                <details className="rounded-md border border-gray-700/50 bg-black/40 p-3 text-gray-300">
                  <summary className="cursor-pointer text-sm">
                    Show technical details
                  </summary>
                  {suggestions.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold mb-1">Suggestions</div>
                      <ul className="list-disc ml-5 space-y-1">
                        {suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {techDetails && (
                    <pre className="mt-3 max-h-60 overflow-auto rounded bg-black/60 p-3 text-[11px] text-gray-400 border border-gray-700/40">
                      {JSON.stringify(techDetails, null, 2)}
                    </pre>
                  )}
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
