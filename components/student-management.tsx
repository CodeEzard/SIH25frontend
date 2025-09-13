"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Award,
  Users,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { getStoredToken } from "@/components/auth/jwt";
import UserInfoModal from "@/components/user-info-modal";

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

interface StudentManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  onMintCredential: (student: Student) => void;
}

export default function StudentManagement({
  students,
  setStudents,
  onMintCredential,
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewAddress, setViewAddress] = useState<string>("");
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const copy = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddr(addr);
      setTimeout(() => setCopiedAddr(null), 1200);
    } catch {}
  };

  // Fetch students from backend and map to UI shape
  useEffect(() => {
    let mounted = true;
    const fetchStudents = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const token = getStoredToken();
        const res = await fetch(
          "https://erired-harshitg7062-82spdej3.leapcell.dev/students",
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok)
          throw new Error(`Failed to fetch students (${res.status})`);

        const data: any[] = await res.json();

        const mapped: Student[] = data.map((s) => ({
          id: String(s.id),
          name:
            `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
            s.email ||
            s.student_id ||
            `Student ${s.id}`,
          universityId: s.student_id || "",
          walletAddress: s.metamask_address || "",
          eligibilityStatus: s.is_verified ? "eligible" : "pending_review",
          mintingStatus: "none",
          joinDate: s.created_at || "",
          lastActivity: s.last_activity || "",
        }));

        if (mounted) setStudents(mapped);
      } catch (err) {
        console.error("Error loading students:", err);
        if (mounted) {
          setStudents([]);
          setFetchError("Failed to load students. Try again later.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, [setStudents]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.universityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === "all" || student.eligibilityStatus === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const handleMintRequest = async (studentId: string) => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setStudents(
        students.map((student) =>
          student.id === studentId
            ? { ...student, mintingStatus: "pending" as const }
            : student
        )
      );
      setLoading(false);
    }, 1000);
  };

  const handleStatusUpdate = async (
    studentId: string,
    newStatus: Student["eligibilityStatus"]
  ) => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setStudents(
        students.map((student) =>
          student.id === studentId
            ? { ...student, eligibilityStatus: newStatus }
            : student
        )
      );
      setLoading(false);
    }, 1000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Users className="h-6 w-6 text-purple-400" />
              </motion.div>
              Students & Credential Issuance
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filter */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search by name, ID, or wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-400 focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-gray-800/60 border-gray-700/60 text-white focus:border-purple-600/60 focus:ring-purple-600/20 transition-all duration-200">
                  <Filter className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/90 border-gray-700/60 backdrop-blur-xl">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-purple-900/30"
                  >
                    All Students
                  </SelectItem>
                  <SelectItem
                    value="graduated"
                    className="text-white hover:bg-purple-900/30"
                  >
                    Graduated
                  </SelectItem>
                  <SelectItem
                    value="eligible"
                    className="text-white hover:bg-purple-900/30"
                  >
                    Eligible
                  </SelectItem>
                  <SelectItem
                    value="pending_review"
                    className="text-white hover:bg-purple-900/30"
                  >
                    Pending Review
                  </SelectItem>
                  <SelectItem
                    value="not_eligible"
                    className="text-white hover:bg-purple-900/30"
                  >
                    Not Eligible
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Students Table (desktop/tablet) */}
            <motion.div
              className="hidden sm:block border border-gray-700/60 rounded-lg overflow-hidden bg-gray-800/20 backdrop-blur-sm"
              variants={itemVariants}
            >
              <div className="overflow-x-auto">
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow className="border-gray-700/60 hover:bg-gray-800/40 transition-colors duration-200">
                      <TableHead className="text-purple-300 font-semibold text-center w-1/4">
                        Student
                      </TableHead>
                      <TableHead className="text-purple-300 font-semibold text-center w-1/4">
                        University ID
                      </TableHead>
                      <TableHead className="text-purple-300 font-semibold text-center w-1/4">
                        Wallet Address
                      </TableHead>
                      <TableHead className="text-purple-300 font-semibold text-center w-1/4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: "rgba(147, 51, 234, 0.1)",
                          scale: 1.01,
                        }}
                        className="border-gray-700/60 hover:bg-gray-800/40 transition-all duration-200"
                      >
                        <TableCell className="text-center align-middle">
                          <div className="text-center">
                            <p className="font-medium text-white">
                              {student.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-center align-middle">
                          {student.universityId}
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-center align-middle">
                          <div className="inline-flex items-center gap-1">
                            {formatAddress(student.walletAddress)}
                            <button
                              onClick={() => copy(student.walletAddress)}
                              className="p-1 rounded-md hover:bg-white/10"
                              title="Copy address"
                              aria-label="Copy wallet address"
                            >
                              {copiedAddr === student.walletAddress ? (
                                <Check className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-gray-300" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                size="sm"
                                onClick={() => onMintCredential(student)}
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Mint
                              </Button>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-700/60 text-purple-300 hover:bg-purple-900/20 bg-transparent transition-all duration-200"
                                onClick={() => {
                                  setViewAddress(student.walletAddress);
                                  setViewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </motion.div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>

            {/* Students List (mobile) */}
            <motion.div
              className="block sm:hidden space-y-3"
              variants={itemVariants}
            >
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-gray-700/60 bg-gray-800/40 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-medium text-base break-words">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 break-all">
                        ID: {student.universityId}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono break-all flex items-center gap-1">
                        {formatAddress(student.walletAddress)}
                        <button
                          onClick={() => copy(student.walletAddress)}
                          className="p-1 rounded-md hover:bg-white/10"
                          title="Copy address"
                          aria-label="Copy wallet address"
                        >
                          {copiedAddr === student.walletAddress ? (
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-300" />
                          )}
                        </button>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => onMintCredential(student)}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                    >
                      Mint
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-700/60 text-purple-300 hover:bg-purple-900/20 bg-transparent"
                      onClick={() => {
                        setViewAddress(student.walletAddress);
                        setViewOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </motion.div>
              ))}

              {filteredStudents.length === 0 && (
                <motion.div
                  className="text-center py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-800/60 flex items-center justify-center">
                    <Users className="h-7 w-7 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No students found.</p>
                </motion.div>
              )}
            </motion.div>

            {/* Reusable user info modal */}
            <UserInfoModal
              open={viewOpen}
              onOpenChange={setViewOpen}
              address={viewAddress}
            />

            {filteredStudents.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/60 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg">
                  No students found matching your criteria.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search or filter settings.
                </p>
              </motion.div>
            )}
            {fetchError && (
              <motion.div
                className="text-red-400 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {fetchError}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
