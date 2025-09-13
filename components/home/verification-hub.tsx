"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ShieldCheck, UserCheck, Loader2 } from "lucide-react";
import { getStoredToken } from "@/components/auth/jwt";
// ethers imports for on-chain org verification
import { BrowserProvider, Contract } from "ethers";
import mintAbi from "@/types/mint.abi.json";

interface VerificationSignupModalProps {
  open: boolean;
  mode: "student" | "university";
  onClose: () => void;
  onSuccess?: () => void;
}

export function VerificationSignupModal({
  open,
  mode,
  onClose,
  onSuccess,
}: VerificationSignupModalProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    studentEmail: "",
    // University-only fields
    AcadEmail: "",
    OrgName: "",
    OrgType: "",
    OrgUrl: "",
    OrgDesc: "",
    Country: "",
    State: "",
    City: "",
    Address: "",
    PostalCode: "",
    TotalStudents: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Helper: push new organization to on-chain registry via newOrg(address _org)
  async function registerOrgOnChain(orgAddress?: string) {
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask not available");
      }

      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
        "0xc0a70a43CD5fAF5B15db983fe9f9E769B221738e"; // updated contract

      const provider = new BrowserProvider((window as any).ethereum as any);
      // Ensure account access
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();

      const contract = new Contract(
        contractAddress,
        mintAbi as any,
        signer as any
      );

      // Default to the connected MetaMask address if none provided
      const targetAddress =
        orgAddress && orgAddress !== ""
          ? orgAddress
          : await signer.getAddress();

      const tx = await contract.newOrg(targetAddress);
      const receipt = await tx.wait();

      // Optional: Persist tx hash to backend (best-effort)
      try {
        const token = getStoredToken();
        await fetch(
          "https://erired-harshitg7062-82spdej3.leapcell.dev/transactionhash",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ transaction_hash: tx.hash }),
          }
        );
      } catch (e) {
        console.warn("Failed to persist tx hash:", e);
      }

      return receipt;
    } catch (err) {
      console.error("registerOrgOnChain failed:", err);
      throw err;
    }
  }

  const reset = () => {
    setForm({
      email: "",
      firstName: "",
      lastName: "",
      studentEmail: "",
      AcadEmail: "",
      OrgName: "",
      OrgType: "",
      OrgUrl: "",
      OrgDesc: "",
      Country: "",
      State: "",
      City: "",
      Address: "",
      PostalCode: "",
      TotalStudents: "",
    });
    setSubmitting(false);
    setDone(false);
    setError(null);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 180);
    } else {
      reset();
    }
  }, [open]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      // Ensure wallet exists for demo; backend expects JWT token set earlier on login
      if (!localStorage.getItem("vericred_wallet")) {
        localStorage.setItem(
          "vericred_wallet",
          JSON.stringify({
            address: "0xDEMO000000000000000000000000000000000000",
          })
        );
      }

      const token = getStoredToken();
      const payload = {
        mode,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        studentEmail: form.studentEmail,
        AcadEmail: form.AcadEmail,
        OrgName: form.OrgName,
        OrgType: form.OrgType,
        OrgUrl: form.OrgUrl,
        OrgDesc: form.OrgDesc,
        Country: form.Country,
        State: form.State,
        City: form.City,
        Address: form.Address,
        PostalCode: form.PostalCode,
        TotalStudents: form.TotalStudents,
      };

      const res = await fetch(
        mode === "university"
          ? "https://erired-harshitg7062-82spdej3.leapcell.dev/api/create/org"
          : "https://erired-harshitg7062-82spdej3.leapcell.dev/api/create/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const createdUser = await res.json();

      try {
        localStorage.setItem("vericred_user", JSON.stringify(createdUser));
      } catch {}

      // If university signup, push org to on-chain registry using MetaMask address
      if (mode === "university") {
        try {
          const storedWalletRaw = localStorage.getItem("vericred_wallet");
          const storedWallet = storedWalletRaw
            ? JSON.parse(storedWalletRaw)
            : null;
          const orgAddress =
            createdUser?.metamask_address ||
            createdUser?.metamaskAddress ||
            storedWallet?.address ||
            undefined;

          await registerOrgOnChain(orgAddress);
        } catch (chainErr: any) {
          console.warn("On-chain org registration failed:", chainErr);
        }
      }

      setDone(true);
      setSubmitting(false);

      // Store the created user data (again, keep prior behavior)
      try {
        localStorage.setItem("vericred_user", JSON.stringify(createdUser));
      } catch {}

      setTimeout(() => {
        onSuccess?.();
        onClose();
        const role = createdUser?.role || mode;
        const next =
          String(role).toLowerCase() === "university"
            ? "/university"
            : "/dashboard";
        router.push(next);
      }, 600);
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || "Failed to create user");
    }
  };

  const CardStatus = ({ status }: { status: Status }) => {
    if (status === "pending") {
      return (
        <Badge className="bg-yellow-900/30 text-yellow-300 border-yellow-800 inline-flex items-center gap-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Pending
        </Badge>
      );
    }
    if (status === "verified") {
      return (
        <Badge className="bg-green-900/30 text-green-300 border-green-800 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-800 text-gray-400 border-gray-700 inline-flex items-center gap-1">
        <ShieldCheck className="h-3.5 w-3.5" />
        Unverified
      </Badge>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* ambient orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute rounded-full bg-purple-500/10 blur-3xl"
              style={{
                width: 220,
                height: 220,
                top: `${10 + i * 8}%`,
                left: `${(i * 137) % 70}%`,
              }}
              animate={{
                x: [0, 30, -40, 0],
                y: [0, -25, 35, 0],
                scale: [1, 1.15, 0.95, 1],
              }}
              transition={{
                duration: 12 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            className="relative z-[91] w-full max-w-lg sm:max-w-xl md:max-w-2xl overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-purple-dark/60 via-black-primary/70 to-purple-dark/60 backdrop-blur-xl shadow-2xl"
            initial={{ y: 50, scale: 0.9, opacity: 0 }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 220, damping: 24 },
            }}
            exit={{
              y: 30,
              scale: 0.9,
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-400 via-white-primary to-purple-500 animate-pulse" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute right-3 top-3 z-[92] inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <form
              onSubmit={submit}
              className="relative z-10 flex flex-col gap-6 p-5 sm:p-7"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white-primary flex items-center gap-2">
                  {mode === "student" ? "Student" : "University"} Demo
                  Verification
                </h2>
                <p className="text-xs text-white-primary/60 leading-relaxed">
                  Demo notice: No real identity or university verification
                  happens yet. Anyone may sign up as a student or university.
                  Full document & institutional validation will be added later.
                </p>
                {error && (
                  <div className="text-xs text-red-300 bg-red-900/20 border border-red-800 rounded px-3 py-2">
                    {error}
                  </div>
                )}
              </div>

              {/* Student fields */}
              {mode === "student" && (
                <div className="grid gap-4 max-h-[65vh] sm:max-h-[72vh] overflow-y-auto pr-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white-primary/70">
                      Email
                    </label>
                    <input
                      ref={firstFieldRef}
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        First name
                      </label>
                      <input
                        required
                        value={form.firstName}
                        onChange={update("firstName")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="Jane"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        Last name
                      </label>
                      <input
                        required
                        value={form.lastName}
                        onChange={update("lastName")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white-primary/70">
                      Student email (institutional)
                    </label>
                    <input
                      required
                      type="email"
                      value={form.studentEmail}
                      onChange={update("studentEmail")}
                      className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                      placeholder="jane.doe@university.edu"
                    />
                  </div>
                </div>
              )}

              {/* University fields */}
              {mode === "university" && (
                <div className="grid gap-4 max-h-[65vh] sm:max-h-[72vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        Academic Email
                      </label>
                      <input
                        ref={firstFieldRef}
                        required
                        type="email"
                        value={form.AcadEmail}
                        onChange={update("AcadEmail")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="registrar@university.edu"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        University Name
                      </label>
                      <input
                        required
                        value={form.OrgName}
                        onChange={update("OrgName")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="Massachusetts Institute of Technology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        University Type
                      </label>
                      <input
                        required
                        value={form.OrgType}
                        onChange={update("OrgType")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="University / College / Institute"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        University Website
                      </label>
                      <input
                        type="url"
                        value={form.OrgUrl}
                        onChange={update("OrgUrl")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="https://www.university.edu"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white-primary/70">
                      University Description
                    </label>
                    <textarea
                      value={form.OrgDesc}
                      onChange={update("OrgDesc")}
                      className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition min-h-24"
                      placeholder="Brief description of the organization"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        Country
                      </label>
                      <input
                        value={form.Country}
                        onChange={update("Country")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="United States"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        State
                      </label>
                      <input
                        value={form.State}
                        onChange={update("State")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="Massachusetts"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        City
                      </label>
                      <input
                        value={form.City}
                        onChange={update("City")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="Cambridge"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        Address
                      </label>
                      <input
                        value={form.Address}
                        onChange={update("Address")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="77 Massachusetts Ave"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white-primary/70">
                        PostalCode
                      </label>
                      <input
                        value={form.PostalCode}
                        onChange={update("PostalCode")}
                        className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                        placeholder="02139"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white-primary/70">
                      Total Students
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.TotalStudents}
                      onChange={update("TotalStudents")}
                      className="w-full rounded-md bg-black/40 border border-border/60 px-3 py-2 text-sm text-white-primary placeholder-white-primary/30 focus:outline-none focus:ring-2 focus:ring-purple-primary/60 focus:border-transparent transition"
                      placeholder="e.g., 11457"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white-primary/40">
                  Press Enter to continue • Demo only
                </span>
                <button
                  type="submit"
                  disabled={submitting || done}
                  className="relative overflow-hidden rounded-md bg-white-primary px-5 py-2 text-sm font-semibold text-black-primary shadow hover:bg-white/90 transition disabled:opacity-60"
                >
                  <span className="relative flex items-center gap-2">
                    {submitting && (
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-black-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          ease: "linear",
                        }}
                      />
                    )}
                    {done && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {done
                      ? "Completed"
                      : submitting
                      ? "Processing..."
                      : "Complete demo signup"}
                  </span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-purple-primary/0 via-purple-primary/25 to-purple-primary/0"
                    initial={{ x: "-100%" }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.2,
                      ease: "linear",
                    }}
                  />
                </button>
              </div>
            </form>

            {/* subtle success flash */}
            <AnimatePresence>
              {done && (
                <motion.div
                  className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-primary/10 via-purple-primary/0 to-purple-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type Status = "idle" | "pending" | "verified";

export default function VerificationHub() {
  const [uniStatus, setUniStatus] = useState<Status>("idle");
  const [studentStatus, setStudentStatus] = useState<Status>("idle");
  // Modal state
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupMode, setSignupMode] = useState<"student" | "university">(
    "student"
  );

  function simulate(setter: (s: Status) => void) {
    setter("pending");
    setTimeout(() => setter("verified"), 1500 + Math.random() * 1000);
  }

  const CardStatus = ({ status }: { status: Status }) => {
    if (status === "pending") {
      return (
        <Badge className="bg-yellow-900/30 text-yellow-300 border-yellow-800 inline-flex items-center gap-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Pending
        </Badge>
      );
    }
    if (status === "verified") {
      return (
        <Badge className="bg-green-900/30 text-green-300 border-green-800 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-800 text-gray-400 border-gray-700 inline-flex items-center gap-1">
        <ShieldCheck className="h-3.5 w-3.5" />
        Unverified
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Verification Hub</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  <p className="text-white font-medium">Verify as University</p>
                </div>
                <CardStatus status={uniStatus} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Submit institutional details to become an authorized issuer.
              </p>
              <div className="mt-3">
                <Button
                  className="bg-white text-black hover:bg-gray-100"
                  disabled={uniStatus === "pending" || uniStatus === "verified"}
                  onClick={() => {
                    setSignupMode("university");
                    setSignupOpen(true);
                  }}
                >
                  Start verification
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-400" />
                  <p className="text-white font-medium">Verify as Student</p>
                </div>
                <CardStatus status={studentStatus} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Verify your identity to connect credentials to your wallet.
              </p>
              <div className="mt-3">
                <Button
                  className="bg-white text-black hover:bg-gray-100"
                  disabled={
                    studentStatus === "pending" || studentStatus === "verified"
                  }
                  onClick={() => {
                    setSignupMode("student");
                    setSignupOpen(true);
                  }}
                >
                  Start verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal mount */}
      <VerificationSignupModal
        open={signupOpen}
        mode={signupMode}
        onClose={() => setSignupOpen(false)}
      />
    </div>
  );
}
