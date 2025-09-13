"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Award,
  LogOut,
  Shield,
  TrendingUp,
  Activity,
  Zap,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  ListChecks,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import UniversityProfile from "@/components/university-profile";
import StudentManagement from "@/components/student-management";
import MintCredentialModal from "@/components/mint-credential-modal";
import AuthGuard from "@/components/auth/auth-guard";
import { motion } from "framer-motion";
import Logo from "@/components/ui/logo";
import { getStoredToken } from "@/components/auth/jwt";
import { useToast } from "@/components/ui/toast";
import { VerificationSignupModal } from "@/components/home/verification-hub";

// Mock data types
interface University {
  id: string;
  name: string;
  description: string;
  website: string;
  walletAddress: string;
  verified: boolean;
  adminName: string;
  adminRole: string;
  logo: string;
  banner: string;
}

interface Student {
  id: string;
  name: string;
  universityId: string;
  walletAddress: string;
  eligibilityStatus:
    | "graduated"
    | "eligible"
    | "pending_review"
    | "not_eligible";
  mintingStatus: "none" | "pending" | "minting" | "minted" | "failed";
  joinDate: string;
  lastActivity: string;
}

interface Credential {
  id: string;
  name: string;
  type: string;
  description: string;
  totalIssued: number;
  status: "active" | "inactive";
  createdDate: string;
}

export default function UniversityDashboard() {
  const [university, setUniversity] = useState<University | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [selectedStudentForMint, setSelectedStudentForMint] =
    useState<Student | null>(null);
  const [animatedStats, setAnimatedStats] = useState({
    students: 0,
    credentials: 0,
    pending: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [quickActions] = useState([
    {
      id: "add-student",
      label: "Add Student",
      icon: Plus,
      action: () => console.log("Add student"),
    },
    {
      id: "create-credential",
      label: "Create Credential",
      icon: Award,
      action: () => console.log("Create credential"),
    },
    {
      id: "bulk-import",
      label: "Bulk Import",
      icon: Users,
      action: () => console.log("Bulk import"),
    },
    {
      id: "analytics",
      label: "View Analytics",
      icon: BarChart3,
      action: () => console.log("View analytics"),
    },
  ]);
  const [isClient, setIsClient] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // New: track 404 state
  const [notFound, setNotFound] = useState(false);
  // New: control modal visibility for inline university signup
  const [showUniversitySignup, setShowUniversitySignup] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<
    Array<{ student_wallet: string; university_wallet: string; id?: string }>
  >([]);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const { showToast } = useToast();

  // Helper to copy wallet addresses in Pending list
  const copyWallet = async (addr?: string) => {
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedWallet(addr);
      setTimeout(() => setCopiedWallet(null), 1200);
    } catch {}
  };

  // Set client state after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load university data - check for first-time user or returning user
  useEffect(() => {
    if (!isClient) return; // Don't load data until client is ready

    const loadUniversityData = async () => {
      try {
        setErrorMsg(null);
        setNotFound(false);
        // Check if this is a first-time user (has user data in localStorage)
        // Only access localStorage on the client side
        const storedUser =
          typeof window !== "undefined"
            ? localStorage.getItem("vericred_user")
            : null;
        const token = typeof window !== "undefined" ? getStoredToken() : null;

        // Prefer fetching from API when a token exists. If there's no token,
        // fall back to stored signup data (vericred_user) or mock data.
        if (token) {
          // Returning user - fetch data from API
          const fetchUrl =
            "https://erired-harshitg7062-82spdej3.leapcell.dev/university";
          console.log(
            "Fetching university from",
            fetchUrl,
            "token present:",
            !!token
          );
          const response = await fetch(fetchUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          // Handle 404 explicitly
          if (response.status === 404) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          console.log("University API status:", response.status);
          const text = await response.text();
          console.log("University API raw response:", text);
          let data: any = null;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (parseErr) {
            console.error(
              "Failed to parse university response JSON:",
              parseErr
            );
            data = {};
          }

          if (response.ok) {
            // Map backend fields to frontend University interface
            const mapped: University = {
              id: data?.id
                ? String(data.id)
                : data?.org_name?.toLowerCase() || "unknown",
              name: data?.org_name || data?.name || "Unknown University",
              description: data?.org_desc || data?.description || "",
              website: data?.org_url || data?.orgUrl || "",
              walletAddress:
                data?.metamask_address ||
                data?.metamask ||
                data?.walletAddress ||
                "",
              verified: Boolean(data?.is_verified),
              adminName: data?.acad_email || "",
              adminRole: "Administrator",
              logo: data?.logo_ip_fs_hash
                ? `https://ipfs.io/ipfs/${data.logo_ip_fs_hash}`
                : data?.logo || "",
              banner: data?.banner_ip_fs_hash
                ? `https://ipfs.io/ipfs/${data.banner_ip_fs_hash}`
                : data?.banner || "",
            };

            setUniversity(mapped);
            setStudents(data?.students || []);
            setCredentials(data?.credentials || []);
            setRecentActivities(data?.activities || []);

            setAnimatedStats({
              students: Number(
                data?.total_students || data?.totalStudents || 0
              ),
              credentials: Number(
                data?.total_credentials ||
                  data?.totalCredentials ||
                  data?.active_credentials ||
                  0
              ),
              pending: Number(data?.pending_requests || data?.pending || 0),
            });

            setLoading(false);
          } else if (response.status === 401 || response.status === 403) {
            setErrorMsg("Authentication failed. Please log in again.");
            setLoading(false);
          } else {
            setErrorMsg(`Failed to load university data: ${response.status}`);
            setLoading(false);
          }
        } else if (storedUser) {
          // No token but we have stored signup data – use it as a fallback
          const userData = JSON.parse(storedUser);
          const newUniversity: University = {
            id: userData.id || "new-org",
            name: userData.OrgName || "New Organization",
            description: userData.OrgDesc || "Organization description",
            website: userData.OrgUrl || "https://example.com",
            walletAddress:
              userData.walletAddress ||
              "0x0000000000000000000000000000000000000000",
            verified: false,
            adminName: `${userData.firstName} ${userData.lastName}`,
            adminRole: "Administrator",
            logo: "https://example.com/logo.png",
            banner: "https://example.com/banner.jpg",
          };

          setUniversity(newUniversity);
          setStudents([]);
          setCredentials([]);
          setRecentActivities([
            {
              id: 1,
              type: "org_created",
              student: "System",
              credential: "Organization Created",
              time: "Just now",
              status: "completed",
            },
          ]);
          setAnimatedStats({ students: 0, credentials: 0, pending: 0 });
          setLoading(false);
        } else {
          // No token and no stored user – fallback to mock data
          loadMockData();
        }
      } catch (error: any) {
        console.error("Error loading university data:", error);
        setErrorMsg(error?.message || String(error));
        // Fallback to mock data to keep the UI functional
        loadMockData();
      }
    };

    const loadMockData = () => {
      const mockUniversity: University = {
        id: "mit",
        name: "Massachusetts Institute of Technology",
        description:
          "MIT is a world-renowned institution of higher learning known for its cutting-edge research and innovation in science, technology, engineering, and mathematics.",
        website: "https://web.mit.edu",
        walletAddress: "0x1234567890123456789012345678901234567890",
        verified: true,
        adminName: "Dr. Sarah Johnson",
        adminRole: "Registrar",
        logo: "https://web.mit.edu/favicon.ico",
        banner: "https://web.mit.edu/images/mit-campus.jpg",
      };

      const mockStudents: Student[] = [
        {
          id: "1",
          name: "John Smith",
          universityId: "MIT2024001",
          walletAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          eligibilityStatus: "graduated",
          mintingStatus: "none",
          joinDate: "2024-01-15",
          lastActivity: "2024-01-20",
        },
        {
          id: "2",
          name: "Emily Chen",
          universityId: "MIT2024002",
          walletAddress: "0x8f3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
          eligibilityStatus: "eligible",
          mintingStatus: "pending",
          joinDate: "2024-01-10",
          lastActivity: "2024-01-22",
        },
        {
          id: "3",
          name: "Michael Rodriguez",
          universityId: "MIT2024003",
          walletAddress: "0x2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f",
          eligibilityStatus: "pending_review",
          mintingStatus: "none",
          joinDate: "2024-01-12",
          lastActivity: "2024-01-21",
        },
        {
          id: "4",
          name: "Lisa Wang",
          universityId: "MIT2023045",
          walletAddress: "0x9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b",
          eligibilityStatus: "graduated",
          mintingStatus: "minted",
          joinDate: "2023-09-01",
          lastActivity: "2024-01-19",
        },
      ];

      const mockCredentials: Credential[] = [
        {
          id: "1",
          name: "Bachelor of Science in Computer Science",
          type: "Undergraduate Degree",
          description: "4-year undergraduate program in computer science",
          totalIssued: 156,
          status: "active",
          createdDate: "2023-01-01",
        },
        {
          id: "2",
          name: "Master of Science in Artificial Intelligence",
          type: "Graduate Degree",
          description: "2-year graduate program specializing in AI",
          totalIssued: 89,
          status: "active",
          createdDate: "2023-01-01",
        },
        {
          id: "3",
          name: "Certificate in Blockchain Technology",
          type: "Certificate",
          description: "Professional certificate program in blockchain",
          totalIssued: 234,
          status: "active",
          createdDate: "2023-06-01",
        },
      ];

      const mockActivities = [
        {
          id: 1,
          type: "credential_minted",
          student: "John Smith",
          credential: "BS Computer Science",
          time: "2 hours ago",
          status: "completed",
        },
        {
          id: 2,
          type: "student_added",
          student: "Emily Chen",
          credential: "New student registration",
          time: "1 day ago",
          status: "completed",
        },
        {
          id: 3,
          type: "credential_pending",
          student: "Michael Rodriguez",
          credential: "MS AI",
          time: "2 days ago",
          status: "pending",
        },
        {
          id: 4,
          type: "verification_completed",
          student: "Lisa Wang",
          credential: "Blockchain Certificate",
          time: "3 days ago",
          status: "completed",
        },
      ];

      setUniversity(mockUniversity);
      setStudents(mockStudents);
      setCredentials(mockCredentials);
      setRecentActivities(mockActivities);
      setLoading(false);

      // Set initial stats
      setAnimatedStats({
        students: mockStudents.length,
        credentials: mockCredentials.reduce(
          (sum, cred) => sum + cred.totalIssued,
          0
        ),
        pending: mockStudents.filter((s) => s.mintingStatus === "pending")
          .length,
      });
    };

    loadUniversityData();
  }, [isClient]);

  const fetchPending = useCallback(async () => {
    try {
      const token = getStoredToken();
      console.log("[Pending] GET /api/pending/for-org", {
        tokenPresent: !!token,
      });
      const res = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/api/pending/for-org",
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const text = await res.text();
      if (!res.ok) throw new Error(`Failed (${res.status}): ${text}`);
      const data = text ? JSON.parse(text) : [];
      const rows = Array.isArray(data) ? data : data?.rows || [];
      const normalized = rows
        .map((r: any) => {
          // Support multiple backend shapes, including nested requester/organization objects
          const student_wallet =
            r?.student_wallet ??
            r?.studentWallet ??
            r?.student ??
            r?.requester_wallet ??
            r?.requesterWallet ??
            r?.student_address ??
            r?.walletAddress ??
            r?.wallet ??
            r?.user_wallet ??
            r?.requester?.metamask_address ??
            r?.requester?.metamaskAddress ??
            r?.requester?.wallet_address ??
            r?.requester?.walletAddress ??
            r?.requester?.address ??
            "";

          const university_wallet =
            r?.university_wallet ??
            r?.universityWallet ??
            r?.university_address ??
            r?.org_wallet ??
            r?.orgWallet ??
            r?.issuer_wallet ??
            r?.university ??
            r?.organization?.metamask_address ??
            r?.organization?.metamaskAddress ??
            r?.organization?.wallet_address ??
            r?.organization?.walletAddress ??
            university?.walletAddress ??
            "";

          return {
            id: r?.id ?? r?.request_id ?? r?._id ?? undefined,
            student_wallet,
            university_wallet,
          };
        })
        .filter((r: any) => !!r.student_wallet);
      setPendingRequests(normalized);
      console.log("[Pending] Loaded", normalized);
    } catch (e) {
      console.warn("[Pending] fetch error", e);
    }
  }, [university?.walletAddress]);

  // Fetch when the Pending tab is opened
  useEffect(() => {
    if (activeTab === "pending") {
      fetchPending();
    }
  }, [activeTab, fetchPending]);

  // Helper: logout user
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vericred_wallet");
        localStorage.removeItem("vericred_user");
      } catch (e) {
        console.error("Error clearing storage on logout:", e);
      }
      // Redirect to home or login
      window.location.href = "/";
    }
  };

  // Helper: return an icon for activity types
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "credential_minted":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "student_added":
        return <Users className="h-4 w-4 text-purple-400" />;
      case "credential_pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  // Helper: render status badge for activity
  const getActivityStatus = (status: string) => {
    if (status === "completed") {
      return (
        <Badge className="bg-green-900/40 text-green-300">Completed</Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge className="bg-yellow-900/30 text-yellow-300">Pending</Badge>
      );
    }
    return <Badge className="bg-gray-800/30 text-gray-300">Status</Badge>;
  };

  // Open the mint modal for a given student
  const handleMintCredential = (student: Student) => {
    setSelectedStudentForMint(student);
    setIsMintModalOpen(true);
  };

  // Approve flow handler: called after mint success
  async function markApproved(student_wallet: string) {
    try {
      const token = getStoredToken();
      const res = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/api/pending/approve",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ student_wallet }),
        }
      );
      if (!res.ok) throw new Error(`Approve failed (${res.status})`);
      setPendingRequests((prev) =>
        prev.filter((p) => p.student_wallet !== student_wallet)
      );
      showToast({
        title: "Approved",
        description: "Request approved after mint",
        variant: "success",
      });
    } catch (e) {
      console.error("Approve API error", e);
      alert("Failed to mark request approved");
    }
  }

  // Called when the MintCredentialModal completes (after successful on-chain mint)
  const handleMintSubmit = async (payload: any) => {
    console.log("Mint completed payload:", payload);
    const recipient =
      payload?.recipient ||
      payload?.walletAddress ||
      selectedStudentForMint?.walletAddress ||
      null;
    // Update local students list
    if (recipient) {
      setStudents((prev) =>
        prev.map((s) =>
          s.walletAddress === recipient ? { ...s, mintingStatus: "minted" } : s
        )
      );
    }
    // If this recipient was part of pendingRequests, call approve API
    if (
      recipient &&
      pendingRequests.some((p) => p.student_wallet === recipient)
    ) {
      await markApproved(recipient);
    }
    setIsMintModalOpen(false);
    setSelectedStudentForMint(null);
  };

  // Don't render anything until client is ready
  if (!isClient) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Initializing...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Simple background animations */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-24 h-80 w-80 rounded-full bg-purple-800/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.1 }}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {notFound && (
            <div className="min-h-screen flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-xl"
              >
                <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-300" />
                    </div>
                    <CardTitle className="text-white text-xl">
                      No University Account Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 text-center">
                    <p className="text-gray-300">
                      We couldn’t find a university account linked to your
                      profile. To issue credentials and access the Issuer Hub,
                      please create your university account first.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button
                        className="bg-white text-black hover:bg-gray-100"
                        onClick={() => setShowUniversitySignup(true)}
                      >
                        Create University Account
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => setShowUniversitySignup(true)}
                      >
                        Start Verification
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Inline University Signup Modal */}
              <VerificationSignupModal
                open={showUniversitySignup}
                mode="university"
                onClose={() => setShowUniversitySignup(false)}
                onSuccess={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/university";
                  }
                }}
              />
            </div>
          )}

          {university && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              {/* Navigation Tabs */}
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-1 bg-gray-900/80 border border-gray-800 backdrop-blur-sm p-1">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:border-purple-700 text-gray-400 transition-all duration-200 hover:text-white px-2 py-2"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:border-purple-700 text-gray-400 transition-all duration-200 hover:text-white px-2 py-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Students</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:border-purple-700 text-gray-400 transition-all duration-200 hover:text-white px-2 py-2"
                >
                  <ListChecks className="h-4 w-4" />
                  <span className="inline sm:hidden">Pending</span>
                  <span className="hidden sm:inline">Pending Requests</span>
                  {pendingRequests.length > 0 && (
                    <span className="ml-1 sm:ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-300 text-[10px] sm:text-xs">
                      {pendingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Overview */}
              <TabsContent value="dashboard" className="space-y-6">
                <UniversityProfile university={university} />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        Total Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-white mb-1">
                        {animatedStats.students}
                      </div>
                      <p className="text-xs text-gray-500">
                        Active on platform
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-400" />
                        Pending Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-white mb-1">
                        {animatedStats.pending}
                      </div>
                      <p className="text-xs text-gray-500">Awaiting approval</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Removed Recent Activity card for a cleaner aesthetic */}
                {/* <Card> ...Recent Activity... </Card> */}
              </TabsContent>

              {/* Students Management */}
              <TabsContent value="students">
                <StudentManagement
                  students={students}
                  setStudents={setStudents}
                  onMintCredential={handleMintCredential}
                />
              </TabsContent>

              {/* Pending Requests */}
              <TabsContent value="pending" className="space-y-4">
                <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">
                        Pending Mint Requests
                      </CardTitle>
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={fetchPending}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pendingRequests.length === 0 ? (
                      <p className="text-gray-400">No pending requests.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequests.map((req, idx) => {
                          const wallet = req?.student_wallet || "";
                          const uniWallet = req?.university_wallet || "";
                          const short = wallet
                            ? wallet.slice(0, 6) + "…" + wallet.slice(-4)
                            : "Unknown";
                          return (
                            <div
                              key={req.id || wallet || idx}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">
                                  Student Wallet
                                </p>
                                <p className="font-mono text-xs sm:text-sm text-gray-300 break-all flex items-center gap-1">
                                  {wallet || "—"}
                                  {wallet && (
                                    <button
                                      onClick={() => copyWallet(wallet)}
                                      className="p-1 rounded-md hover:bg-white/10"
                                      title="Copy student wallet"
                                    >
                                      {copiedWallet === wallet ? (
                                        <Check className="h-3.5 w-3.5 text-green-400" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5 text-gray-300" />
                                      )}
                                    </button>
                                  )}
                                </p>
                                <p className="text-[11px] sm:text-xs text-gray-500 mt-1 break-all flex items-center gap-1">
                                  University: {uniWallet || "—"}
                                  {uniWallet && (
                                    <button
                                      onClick={() => copyWallet(uniWallet)}
                                      className="p-1 rounded-md hover:bg-white/10 ml-1"
                                      title="Copy university wallet"
                                    >
                                      {copiedWallet === uniWallet ? (
                                        <Check className="h-3.5 w-3.5 text-green-400" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5 text-gray-300" />
                                      )}
                                    </button>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <Button
                                  className="bg-white text-black hover:bg-gray-100 w-full sm:w-auto"
                                  onClick={() => {
                                    if (!wallet) {
                                      alert(
                                        "Invalid request data (missing student wallet)"
                                      );
                                      return;
                                    }
                                    const match = students.find(
                                      (s) =>
                                        s.walletAddress?.toLowerCase() ===
                                        wallet.toLowerCase()
                                    );
                                    const student =
                                      match ||
                                      ({
                                        id: wallet,
                                        name: short,
                                        universityId: university?.id || "org",
                                        walletAddress: wallet,
                                        eligibilityStatus: "eligible",
                                        mintingStatus: "none",
                                        joinDate: "",
                                        lastActivity: "",
                                      } as any);
                                    setSelectedStudentForMint(student);
                                    setIsMintModalOpen(true);
                                  }}
                                >
                                  Approve
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Mint Credential Modal */}
          <MintCredentialModal
            isOpen={isMintModalOpen}
            onClose={() => {
              setIsMintModalOpen(false);
              setSelectedStudentForMint(null);
            }}
            onSubmit={handleMintSubmit}
            student={selectedStudentForMint}
            university={university}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
