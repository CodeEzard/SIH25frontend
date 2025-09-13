"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Building2, Shield } from "lucide-react";
import { getStoredToken } from "@/components/auth/jwt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

// Backend university shape
interface BackendUniversity {
  id: number;
  metamask_address: string;
  acad_email?: string;
  org_name: string;
  org_type?: string;
  org_url?: string;
  org_desc?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  is_verified: boolean;
  total_students?: number;
  created_at?: string;
  updated_at?: string;
  Account?: any;
}

// UI shape expected by parent (keeps previous contract)
interface University {
  id: string;
  name: string;
  logo: string;
  walletAddress: string;
  verified: boolean;
}

interface UniversitySelectorProps {
  onUniversitySelect: (university: University) => void;
  selectedUniversity: University | null;
}

export default function UniversitySelector({
  onUniversitySelect,
  selectedUniversity,
}: UniversitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [universities, setUniversities] = useState<BackendUniversity[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    BackendUniversity[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<BackendUniversity | null>(null);

  // New: Portal modal state
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalUni, setPortalUni] = useState<BackendUniversity | null>(null);
  const [portalRaw, setPortalRaw] = useState<any>(null);
  const { showToast } = useToast();

  // Helpers to parse and normalize backend responses of varying shape
  const extractOne = (data: any): any => {
    if (!data) return null;
    if (Array.isArray(data)) return data[0] ?? null;
    if (data?.rows && Array.isArray(data.rows)) return data.rows[0] ?? null;
    if (data?.data && Array.isArray(data.data)) return data.data[0] ?? null;
    if (data?.result && Array.isArray(data.result))
      return data.result[0] ?? null;
    if (data?.university) return data.university;
    if (data?.organization) return data.organization;
    return data;
  };

  const normalizeUni = (u: any): BackendUniversity => {
    if (!u || typeof u !== "object")
      return {
        id: 0,
        metamask_address: "",
        org_name: "",
        is_verified: false,
      } as BackendUniversity;

    const id = u.id ?? u.ID ?? u._id ?? u.uuid ?? 0;
    const metamask_address =
      u.metamask_address ||
      u.wallet ||
      u.address ||
      u.metamask ||
      u.account ||
      "";
    const org_name =
      u.org_name || u.name || u.organization_name || u.title || "";
    const org_type = u.org_type || u.type || u.category || undefined;
    const org_url = u.org_url || u.website || u.url || undefined;
    const org_desc = u.org_desc || u.description || u.desc || undefined;
    const country = u.country || u.location?.country || undefined;
    const state = u.state || u.location?.state || undefined;
    const city = u.city || u.location?.city || undefined;
    const address = u.address || u.street || u.location?.address || undefined;
    const postal_code = u.postal_code || u.zip || u.postal || undefined;
    const is_verified = !!(
      u.is_verified ??
      u.verified ??
      u.isVerified ??
      false
    );
    const total_students =
      u.total_students ?? u.students ?? u.totalStudents ?? undefined;

    return {
      id,
      metamask_address,
      org_name,
      org_type,
      org_url,
      org_desc,
      country,
      state,
      city,
      address,
      postal_code,
      is_verified,
      total_students,
    } as BackendUniversity;
  };

  // Fetch universities from API
  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getStoredToken();
        const res = await fetch(
          "https://erired-harshitg7062-82spdej3.leapcell.dev/universities",
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch (${res.status})`);
        }

        const data: BackendUniversity[] = await res.json();
        setUniversities(data);
        setFilteredUniversities(data);
      } catch (err: any) {
        console.error("Error fetching universities:", err);
        setError("Unable to load universities. Please try again later.");
        setUniversities([]);
        setFilteredUniversities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Filter universities based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUniversities(universities);
    } else {
      const filtered = universities.filter((uni) =>
        uni.org_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUniversities(filtered);
    }
  }, [searchTerm, universities]);

  const handleWalletAddressSubmit = async () => {
    if (!walletAddress.trim()) return;

    setPortalLoading(true);
    try {
      const token = getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const payload = { metamask_address: walletAddress.trim() };

      // Use POST with JSON body (browsers do not allow GET bodies)
      const res = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/api/specific-university",
        {
          method: "POST",
          mode: "cors",
          cache: "no-store",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        const first = extractOne(json);
        const normalized = normalizeUni(first);
        setPortalUni(normalized);
        setPortalRaw(first);
        setPortalOpen(true);
        return;
      }

      alert(`Failed to fetch university details (${res.status})`);
    } catch (err) {
      console.error("specific-university fetch failed", err);
      alert("Failed to fetch university details");
    } finally {
      setPortalLoading(false);
    }
  };

  // Request NFT Mint from modal (same behavior as university card)
  const requestMintFromPopup = async () => {
    try {
      if (!portalUni?.metamask_address) {
        alert("Missing university wallet address");
        return;
      }
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("vericred_wallet")
          : null;
      const parsed = raw ? JSON.parse(raw) : null;
      const student_wallet = parsed?.address || "";
      const university_wallet = portalUni.metamask_address;
      const token = getStoredToken();
      if (!student_wallet || !university_wallet) {
        alert("Missing wallet information");
        return;
      }
      const r = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/api/pending/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ student_wallet, university_wallet }),
        }
      );
      if (!r.ok) throw new Error(`Request failed (${r.status})`);

      showToast({
        title: "Request sent",
        description: "Pending request sent successfully",
        variant: "success",
        durationMs: 4000,
      });
    } catch (e) {
      console.error("Pending request error", e);
      alert("Failed to send mint request");
    }
  };

  const handleRowClick = (uni: BackendUniversity) => {
    // toggle expanded
    setExpanded((prev) => (prev?.id === uni.id ? null : uni));
  };

  const handleSelectFromDetails = (uni: BackendUniversity) => {
    onUniversitySelect({
      id: String(uni.id),
      name: uni.org_name,
      logo: "/placeholder.svg",
      walletAddress: uni.metamask_address,
      verified: !!uni.is_verified,
    });
  };

  // Create a simple initials avatar from org name
  const initialsFor = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  };

  // Title and description fallbacks
  const titleFrom = (u: BackendUniversity | null, raw: any) =>
    u?.org_name ||
    raw?.org_name ||
    raw?.name ||
    raw?.organization?.name ||
    "University";
  const walletFrom = (u: BackendUniversity | null, raw: any) =>
    u?.metamask_address ||
    raw?.metamask_address ||
    raw?.wallet ||
    raw?.address ||
    "";

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Building2 className="h-5 w-5 text-purple-300" />
          University Selection
        </CardTitle>
        <CardDescription className="text-gray-400">
          Find your university to view available credentials and request NFT
          minting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Search Universities */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/70" />
            <Input
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
            />
          </div>

          {/* University List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.700)_transparent]">
            {loading && (
              <p className="text-center text-gray-400 py-4">
                Loading universities...
              </p>
            )}
            {error && <p className="text-center text-red-400 py-4">{error}</p>}

            {filteredUniversities.map((university) => (
              <div
                key={university.id}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
                  selectedUniversity?.id === String(university.id)
                    ? "border-purple-500/40 bg-purple-900/10 shadow-lg"
                    : "border-gray-800/60 bg-gray-900/30 hover:bg-gray-900/60 hover:border-purple-700/40"
                }`}
                onClick={() => handleRowClick(university)}
              >
                <div className="flex items-center gap-4">
                  {/* Gradient initials avatar (replaces white circle) */}
                  <div className="shrink-0 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-purple-700 via-fuchsia-600 to-indigo-600 text-white font-semibold shadow-md ring-1 ring-white/10">
                    {initialsFor(university.org_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-base text-white truncate">
                        {university.org_name}
                      </h4>
                      {university.is_verified && (
                        <Shield className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {university.metamask_address
                        ? `${university.metamask_address.slice(
                            0,
                            10
                          )}...${university.metamask_address.slice(-8)}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded?.id === university.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Academic Email</p>
                        <p className="text-gray-200">
                          {university.acad_email || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Website</p>
                        <p className="text-gray-200 break-all">
                          {university.org_url || "—"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-400">Description</p>
                        <p className="text-gray-200">
                          {university.org_desc || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Location</p>
                        <p className="text-gray-200">
                          {[
                            university.city,
                            university.state,
                            university.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Address / Postal</p>
                        <p className="text-gray-200">
                          {university.address || "—"}
                          {university.postal_code
                            ? ` / ${university.postal_code}`
                            : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Students</p>
                        <p className="text-gray-200">
                          {university.total_students ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Verified</p>
                        <p className="text-gray-200">
                          {university.is_verified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleSelectFromDetails(university)}
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Select University
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setExpanded(null)}
                        className="border-gray-700/60 text-gray-300 hover:bg-gray-900/60"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredUniversities.length === 0 && searchTerm && !loading && (
            <p className="text-center text-gray-500 py-4">
              No universities found matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800/60" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-500">or</span>
          </div>
        </div>

        {/* Wallet Address Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Enter University's Official Wallet Address
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono text-sm bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20"
            />
            <Button
              onClick={handleWalletAddressSubmit}
              disabled={!walletAddress.trim() || portalLoading}
              className="bg-white text-black hover:bg-gray-100"
            >
              {portalLoading ? "Loading..." : "Go to Portal"}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Paste the official wallet address of your university to access their
            credential portal
          </p>
        </div>
      </CardContent>

      {/* Portal Modal */}
      <Dialog open={portalOpen} onOpenChange={setPortalOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              {titleFrom(portalUni, portalRaw)}
              {(portalUni?.is_verified ||
                portalRaw?.is_verified ||
                portalRaw?.verified) && (
                <Shield className="h-5 w-5 text-emerald-400" />
              )}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-gray-400">
              {walletFrom(portalUni, portalRaw)
                ? `${walletFrom(portalUni, portalRaw).slice(
                    0,
                    10
                  )}...${walletFrom(portalUni, portalRaw).slice(-8)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Academic Email</p>
                <p className="text-gray-200">
                  {portalUni?.acad_email ||
                    portalRaw?.acad_email ||
                    portalRaw?.email ||
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Website</p>
                <p className="text-gray-200 break-all">
                  {portalUni?.org_url ||
                    portalRaw?.org_url ||
                    portalRaw?.website ||
                    portalRaw?.url ||
                    "—"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400">Description</p>
                <p className="text-gray-200">
                  {portalUni?.org_desc ||
                    portalRaw?.org_desc ||
                    portalRaw?.description ||
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Location</p>
                <p className="text-gray-200">
                  {[portalUni?.city, portalUni?.state, portalUni?.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Address / Postal</p>
                <p className="text-gray-200">
                  {
                    (portalUni?.address ||
                      portalRaw?.address ||
                      portalRaw?.location?.address ||
                      "—") as string
                  }
                  {portalUni?.postal_code ||
                  portalRaw?.postal_code ||
                  portalRaw?.zip
                    ? ` / ${
                        portalUni?.postal_code ||
                        portalRaw?.postal_code ||
                        portalRaw?.zip
                      }`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Students</p>
                <p className="text-gray-200">
                  {portalUni?.total_students ??
                    portalRaw?.total_students ??
                    portalRaw?.students ??
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Verified</p>
                <p className="text-gray-200">
                  {portalUni?.is_verified ??
                  portalRaw?.is_verified ??
                  portalRaw?.verified
                    ? "Yes"
                    : "No"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={requestMintFromPopup}
              className="bg-white text-black hover:bg-gray-100"
            >
              Request NFT Mint
            </Button>
            <Button
              variant="outline"
              className="border-gray-700/60 text-gray-300 hover:bg-gray-900/60"
              onClick={() => setPortalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
