"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";
import { getStoredToken } from "@/components/auth/jwt";
import { useToast } from "@/components/ui/toast";

interface University {
  id: string;
  name: string;
  logo: string;
  walletAddress: string;
  verified: boolean;
}

interface Credential {
  id: string;
  name: string;
  issueDate: string;
  universityId: string;
  universityName: string;
  status: "eligible" | "pending" | "minted" | "rejected";
  description?: string;
}

interface UniversitySpecificViewProps {
  university: University;
  credentials: Credential[];
  loading: boolean;
  userProfile: UserProfile | null;
  onMintRequest: (credentialId: string) => void;
}

interface UserProfile {
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  student_id?: string;
}

export default function UniversitySpecificView({
  university,
  credentials,
  loading,
  userProfile,
  onMintRequest,
}: UniversitySpecificViewProps) {
  const eligibleCredentials = credentials.filter(
    (cred) => cred.status === "eligible"
  );
  const pendingCredentials = credentials.filter(
    (cred) => cred.status === "pending"
  );
  const { showToast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "eligible":
        return <Award className="h-4 w-4 text-green-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "minted":
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  async function handleRequestMint(credentialId: string) {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("vericred_wallet")
          : null;
      const parsed = raw ? JSON.parse(raw) : null;
      const student_wallet = parsed?.address || "";
      const university_wallet = university.walletAddress;
      const token = getStoredToken();
      if (!student_wallet || !university_wallet) {
        alert("Missing wallet information");
        return;
      }
      const res = await fetch(
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
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      showToast({
        title: "Request sent",
        description: "Pending request sent successfully",
        variant: "success",
        durationMs: 4000,
      });
      // Optional: let parent know
      onMintRequest?.(credentialId);
    } catch (e: any) {
      console.error("Pending request error", e);
      alert("Failed to send mint request");
    }
  }

  // Helper: initials avatar fallback
  const initialsFor = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-700 rounded-lg">
                <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse mb-3"></div>
                <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          {/* Avatar: logo or gradient initials */}
          {university.logo && university.logo !== "/placeholder.svg" ? (
            <img
              src={university.logo}
              alt={`${university.name} logo`}
              className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-purple-700 via-fuchsia-600 to-indigo-600 text-white font-semibold shadow-md ring-1 ring-white/10">
              {initialsFor(university.name)}
            </div>
          )}
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              {university.name}
              {university.verified && (
                <Shield className="h-5 w-5 text-emerald-400" />
              )}
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-400">
              {university.walletAddress.slice(0, 10)}...
              {university.walletAddress.slice(-8)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eligible Credentials */}
        {eligibleCredentials.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-green-400" />
              Available Credentials
            </h3>
            <div className="space-y-3">
              {eligibleCredentials.map((credential) => (
                <div
                  key={credential.id}
                  className="p-5 rounded-xl border backdrop-blur-sm border-gray-800/60 bg-gray-900/30 hover:bg-gray-900/60 hover:border-purple-700/40 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(credential.status)}
                        <h4 className="font-medium text-white truncate">
                          {credential.name}
                        </h4>
                      </div>
                      {credential.description && (
                        <p className="text-sm text-gray-400 mb-2">
                          {credential.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Issue Date:{" "}
                          {new Date(credential.issueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {credential.status === "eligible" && (
                        <Button
                          onClick={() => handleRequestMint(credential.id)}
                          disabled={loading}
                          className="ml-2 bg-white text-black hover:bg-gray-100"
                        >
                          Request NFT Mint
                        </Button>
                      )}
                      {/* View button removed as requested */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests (hidden for now) */}
        {false && pendingCredentials.length > 0 && (
          <>
            {eligibleCredentials.length > 0 && <></>}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-yellow-400" />
                Pending Requests
              </h3>
              <div className="space-y-3">
                {pendingCredentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="p-4 border border-yellow-800 rounded-lg bg-yellow-900/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(credential.status)}
                      <h4 className="font-medium text-white">
                        {credential.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      Your mint request has been submitted and is awaiting
                      university approval.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {credentials.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Credentials Available
            </h3>
            <p className="text-gray-400">
              You don't have any eligible credentials from {university.name} at
              this time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
