"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Award,
  User,
  BookOpen,
  Hash,
  Shield,
  FileText,
  CheckCircle,
  Loader2,
  Sparkles,
  Zap,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { getStoredToken } from "@/components/auth/jwt";
import { BrowserProvider, Contract } from "ethers";
import mintAbi from "@/types/mint.abi.json";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";

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

interface University {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  website: string;
  walletAddress: string;
  verified: boolean;
  adminName: string;
  adminRole: string;
}

interface MintCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentialData: any) => void;
  student: Student | null;
  university: University | null;
}

interface CredentialFormData {
  name: string;
  description: string;
  credentialType: string;
  major: string;
  gpa: string;
  issueDate: string;
  graduationDate: string;
  credentialId: string;
  verificationUrl: string;
  accreditationBody: string;
  deanSignatureHash?: string;
}

export default function MintCredentialModal({
  isOpen,
  onClose,
  onSubmit,
  student,
  university,
}: MintCredentialModalProps) {
  // Generate a CID-like random hash (looks like Qm... base58)
  const makeRandomCid = () => {
    const alphabet =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let cid = "Qm";
    for (let i = 0; i < 44; i++)
      cid += alphabet[Math.floor(Math.random() * alphabet.length)];
    return cid;
  };

  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);
  const [pendingTokenURI, setPendingTokenURI] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Replace local success state with global toast
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CredentialFormData>({
    name: "",
    description: "",
    credentialType: "",
    major: "",
    gpa: "",
    issueDate: new Date().toISOString().split("T")[0],
    graduationDate: new Date().toISOString().split("T")[0],
    credentialId: "",
    verificationUrl: "",
    accreditationBody: "",
    deanSignatureHash: "",
  });

  // add uploadedCredentialData state
  const [uploadedCredentialData, setUploadedCredentialData] = useState<
    any | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const copyAddr = async (addr?: string) => {
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddr(addr);
      setTimeout(() => setCopiedAddr(null), 1200);
    } catch {}
  };

  // Initialize form with default values when modal opens
  useEffect(() => {
    if (isOpen && student && university) {
      const credentialId = `${String(
        university.id
      ).toUpperCase()}-${Date.now()}-${student.id}`;
      setFormData({
        name: "BTECH",
        description: `Official academic credential awarded by ${university.name} for the successful completion of the Bachelor of Science program.`,
        credentialType: "Bachelor's Degree",
        major: "Computer Science",
        gpa: "3.85",
        issueDate: new Date().toISOString().split("T")[0],
        graduationDate: new Date().toISOString().split("T")[0],
        credentialId: credentialId,
        verificationUrl: `https://vericred.com/verify?credentialId=${credentialId}`,
        accreditationBody: "Accreditation Council for Education (ACE)",
        deanSignatureHash: makeRandomCid(),
      });
      setIpfsLink(null);
    }
  }, [isOpen, student, university]);

  const handleInputChange = (
    field: keyof CredentialFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!student || !university) return;

    setIsSubmitting(true);

    // Build the credential data structure
    const credentialData: any = {
      name: formData.name,
      description: formData.description,
      attributes: [
        { trait_type: "Credential Type", value: formData.credentialType },
        { trait_type: "Issuing Institution", value: university.name },
        { trait_type: "Issuer Wallet", value: university.walletAddress },
        { trait_type: "Recipient Name", value: student.name },
        { trait_type: "Recipient Wallet", value: student.walletAddress },
        { trait_type: "Issue Date", value: formData.issueDate },
        { trait_type: "Graduation Date", value: formData.graduationDate },
        { trait_type: "Major", value: formData.major },
        { trait_type: "GPA", value: formData.gpa },
        { trait_type: "Credential ID", value: formData.credentialId },
        { trait_type: "Accreditation Body", value: formData.accreditationBody },
      ],
      custom_fields: {
        deanSignatureHash: formData.deanSignatureHash || "",
      },
    };

    try {
      const token = getStoredToken();
      const res = await fetch(
        "https://erired-harshitg7062-82spdej3.leapcell.dev/api/uploadtoipfs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(credentialData),
        }
      );
      const result = await res.json();
      console.log("Upload result:", result);
      if (!res.ok)
        throw new Error(
          `Upload failed (${res.status}) ${JSON.stringify(result)}`
        );
      // backend returns { ipfsurl: "ipfs://..." }
      const link =
        result?.ipfsurl || result?.ipfslink || result?.ipfsLink || null;
      setIpfsLink(link);

      // Store uploaded credential data locally and DO NOT notify parent yet.
      // Parent should not close the modal until admin confirms mint.
      setUploadedCredentialData({ ...credentialData });

      // Do NOT auto-mint. Ask user to confirm mint using the returned tokenURI.
      if (link) {
        setPendingTokenURI(link);
      }
    } catch (err) {
      console.error("Error uploading to IPFS:", err);
      // show error inline (could add state for error text)
      setIpfsLink(null);
      alert("Failed to upload credential to IPFS. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mint the token on-chain using ethers / MetaMask
  async function mintOnChain(tokenURI: string) {
    if (!student) return;
    try {
      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
        "0xc0a70a43CD5fAF5B15db983fe9f9E769B221738e";
      if (!contractAddress) throw new Error("Contract address not set");

      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask not available in this browser");
      }

      const provider = new BrowserProvider((window as any).ethereum as any);
      // Request account access if needed
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();

      const contract = new Contract(
        contractAddress,
        mintAbi as any,
        signer as any
      );

      setIsSubmitting(true);
      const tx = await contract.mintDoc(student.walletAddress, tokenURI);
      // wait for transaction to be mined
      const receipt = await tx.wait();

      // Post transaction hash to backend
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
      } catch (hashPersistErr) {
        console.warn("Failed to persist transaction hash:", hashPersistErr);
      }

      // Persist minted record to backend
      try {
        const nowIso = new Date().toISOString();
        const payload = {
          id: (globalThis as any).crypto?.randomUUID
            ? (globalThis as any).crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          degree_id: 0,
          student_wallet: student.walletAddress,
          university_wallet: university?.walletAddress || "",
          degree_name: formData.name,
          description: formData.description,
          type: formData.credentialType,
          major: formData.major,
          issued_date: new Date(formData.issueDate).toISOString(),
          graduation_date: formData.graduationDate,
          created_at: nowIso,
          updated_at: nowIso,
          ipfs_link: tokenURI,
          dean_sig: formData.deanSignatureHash || "",
        };

        const token = getStoredToken();
        await fetch(
          "https://erired-harshitg7062-82spdej3.leapcell.dev/credmint",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          }
        );
      } catch (persistErr) {
        console.warn("Failed to persist minted record to backend:", persistErr);
      }

      setIsSubmitting(false);
      setPendingTokenURI(null);

      if (uploadedCredentialData) {
        try {
          onSubmit({
            ...uploadedCredentialData,
            ipfslink: tokenURI,
            txHash: tx.hash,
          });
        } catch (e) {
          console.warn("onSubmit callback failed:", e);
        }
      }

      // Global success toast
      showToast({
        title: "Mint Successful!",
        description:
          "Your credential has been minted successfully on Sepolia testnet.",
        variant: "success",
        linkHref: `https://sepolia.etherscan.io/tx/${tx.hash}`,
        linkLabel: "View on Etherscan",
        durationMs: 6000,
      });

      // Close modal (no need to delay; toast is global)
      closeModal();
    } catch (err: any) {
      console.error("Minting failed", err);
      setIsSubmitting(false);
      alert("On-chain mint failed: " + (err?.message || String(err)));
    }
  }

  // Handler to confirm mint from UI
  const handleConfirmMint = async () => {
    if (!pendingTokenURI || !student) return;
    setShowConfirmModal(true);
  };

  // local close that clears transient state
  const closeModal = () => {
    setIpfsLink(null);
    setPendingTokenURI(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={closeModal}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-3xl sm:max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6 border-b border-gray-800">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-black" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 leading-tight break-words">
                  Mint New Credential
                  <div>
                    <Sparkles className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  </div>
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm break-words">
                  Create and mint a new NFT credential for {student?.name}
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Student Info */}
          {student && (
            <div className="mt-4 p-4 bg-black/20 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white break-words">
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-400 break-all">
                    ID: {student.universityId}
                  </p>
                </div>
                <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                  <Badge className="bg-green-900/30 text-green-300 border-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Eligible
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-800 border border-gray-700">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs sm:text-sm px-2 py-2 whitespace-normal leading-tight text-center"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs sm:text-sm px-2 py-2 whitespace-normal leading-tight text-center"
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Academic
              </TabsTrigger>
              <TabsTrigger
                value="metadata"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs sm:text-sm px-2 py-2 whitespace-normal leading-tight text-center"
              >
                <Hash className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Metadata
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs sm:text-sm px-2 py-2 whitespace-normal leading-tight text-center"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300">
                          Credential Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                          placeholder="e.g., BTECH, MBA, PhD"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="credentialType"
                          className="text-gray-300"
                        >
                          Credential Type *
                        </Label>
                        <Input
                          id="credentialType"
                          value={formData.credentialType}
                          onChange={(e) =>
                            handleInputChange("credentialType", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                          placeholder="e.g., Bachelor's Degree"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-gray-300">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                        rows={3}
                        placeholder="Detailed description of the credential..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="mt-6">
              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Academic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="major" className="text-gray-300">
                          Major/Field of Study *
                        </Label>
                        <Input
                          id="major"
                          value={formData.major}
                          onChange={(e) =>
                            handleInputChange("major", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpa" className="text-gray-300">
                          GPA/Grade
                        </Label>
                        <Input
                          id="gpa"
                          value={formData.gpa}
                          onChange={(e) =>
                            handleInputChange("gpa", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                          placeholder="e.g., 3.85"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="issueDate" className="text-gray-300">
                          Issue Date *
                        </Label>
                        <Input
                          id="issueDate"
                          type="date"
                          value={formData.issueDate}
                          onChange={(e) =>
                            handleInputChange("issueDate", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="graduationDate"
                          className="text-gray-300"
                        >
                          Graduation Date *
                        </Label>
                        <Input
                          id="graduationDate"
                          type="date"
                          value={formData.graduationDate}
                          onChange={(e) =>
                            handleInputChange("graduationDate", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="accreditationBody"
                        className="text-gray-300"
                      >
                        Accreditation Body
                      </Label>
                      <Input
                        id="accreditationBody"
                        value={formData.accreditationBody}
                        onChange={(e) =>
                          handleInputChange("accreditationBody", e.target.value)
                        }
                        className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                        placeholder="e.g., Accreditation Council for Education (ACE)"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="mt-6">
              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Metadata & URLs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="credentialId" className="text-gray-300">
                        Credential ID *
                      </Label>
                      <Input
                        id="credentialId"
                        value={formData.credentialId}
                        onChange={(e) =>
                          handleInputChange("credentialId", e.target.value)
                        }
                        className="bg-gray-900 border-gray-600 text-white focus:border-gray-500 font-mono"
                        placeholder="Auto-generated unique ID"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="verificationUrl"
                        className="text-gray-300"
                      >
                        Verification URL
                      </Label>
                      <Input
                        id="verificationUrl"
                        value={formData.verificationUrl}
                        onChange={(e) =>
                          handleInputChange("verificationUrl", e.target.value)
                        }
                        className="bg-gray-900 border-gray-600 text-white focus:border-gray-500"
                        placeholder="https://vericred.com/verify?credentialId=..."
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="deanSignatureHash"
                        className="text-gray-300"
                      >
                        Dean Signature Hash (IPFS)
                      </Label>
                      <Input
                        id="deanSignatureHash"
                        value={formData.deanSignatureHash}
                        onChange={(e) =>
                          handleInputChange("deanSignatureHash", e.target.value)
                        }
                        className="bg-gray-900 border-gray-600 text-white focus:border-gray-500 font-mono"
                        placeholder="QmDeanSignatureHashForThisCredential"
                      />
                    </div>
                    <Separator className="bg-gray-700" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Credential Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Award className="h-10 w-10 text-black" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 break-words">
                          {formData.name || "Credential Name"}
                        </h3>
                        <p className="text-gray-400 text-sm break-words">
                          {formData.description || "Credential description"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white break-words">
                              {formData.credentialType || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Major:</span>
                            <span className="text-white break-words">
                              {formData.major || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">GPA:</span>
                            <span className="text-white">
                              {formData.gpa || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Issue Date:</span>
                            <span className="text-white">
                              {formData.issueDate || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Graduation:</span>
                            <span className="text-white">
                              {formData.graduationDate || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <Badge className="bg-green-900/30 text-green-300 border-green-800 text-xs">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800 border-t border-gray-700 flex-shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-400 w-full sm:w-auto min-w-0 space-y-1">
              <p className="break-all text-xs sm:text-sm">
                Minting to: {student?.walletAddress}
              </p>
              <p className="text-xs sm:text-sm">
                Gas fees will be covered by university wallet
              </p>
            </div>
            <div className="w-full sm:w-auto flex flex-wrap justify-end gap-3">
              <div>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
              <div>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || !formData.name || !formData.description
                  }
                  className="bg-white text-black hover:bg-gray-100 font-semibold min-w-[120px] w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">Uploading...</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Mint NFT
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {ipfsLink && (
            <div className="mt-4">
              <Card className="relative overflow-hidden border border-purple-700/50 bg-gradient-to-r from-purple-900/20 via-gray-900/60 to-black backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-full bg-purple-900/40 text-purple-200 border border-purple-700/40 px-2 py-0.5 text-xs">
                          IPFS
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-900/30 text-emerald-200 border border-emerald-700/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          Sepolia
                        </span>
                      </div>
                      {/* Hide raw URL; show masked CID */}
                      <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-purple-300 mt-0.5 flex-shrink-0" />
                        {(() => {
                          const cid = (ipfsLink || "").replace(
                            /^ipfs:\/\//,
                            ""
                          );
                          const short = cid
                            ? `${cid.slice(0, 8)}…${cid.slice(-8)}`
                            : "(ready)";
                          return (
                            <p className="text-sm font-mono text-white/90 leading-relaxed">
                              <span className="text-purple-300/80 mr-1">#</span>
                              ipfs://{short}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(ipfsLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="bg-gray-900/60 border border-gray-700/60 text-gray-100 hover:bg-gray-800 inline-flex items-center gap-2"
                        aria-label="Copy IPFS link"
                        title={copied ? "Copied" : "Copy to clipboard"}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const gatewayUrl = ipfsLink!.startsWith("ipfs://")
                            ? `https://ipfs.io/ipfs/${ipfsLink!.replace(
                                "ipfs://",
                                ""
                              )}`
                            : ipfsLink!;
                          window.open(gatewayUrl, "_blank", "noreferrer");
                        }}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white inline-flex items-center gap-2"
                        aria-label="Open in gateway"
                        title="Open via IPFS gateway"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                      {pendingTokenURI && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirmModal(true);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-medium shadow-lg shadow-fuchsia-900/20"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Confirm & Mint
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-400 leading-relaxed">
                    Ensure the link resolves before minting. Minting will prompt
                    a wallet transaction on Sepolia.
                  </div>

                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -inset-px rounded-xl ring-1 ring-purple-700/30" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Custom confirm modal (styled) */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowConfirmModal(false)}
              />
              <div
                className="relative z-70 w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  Confirm NFT Mint
                </h3>
                <p className="text-sm text-gray-400 mb-2">Recipient address:</p>
                <p className="text-sm font-mono text-white break-all mb-4">
                  {student?.walletAddress}
                </p>
                <p className="text-sm text-gray-400 mb-2">Token URI (IPFS):</p>
                <p className="text-sm font-mono text-white break-all mb-4">
                  {pendingTokenURI}
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmModal(false);
                    }}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setShowConfirmModal(false);
                      if (pendingTokenURI) {
                        await mintOnChain(pendingTokenURI as string);
                        // Do not close immediately; toast will show and then auto-close the modal
                      }
                    }}
                    className="bg-green-600 text-white"
                  >
                    Confirm & Mint
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
