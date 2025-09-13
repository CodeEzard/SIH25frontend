"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Award,
  Calendar,
  ExternalLink,
  Shield,
  User,
  Building2,
  FileText,
  CheckCircle,
  Download,
  Share2,
  Eye,
  Star,
  Wallet,
  Hash,
  BookOpen,
  UserCheck,
  Heart,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import Logo from "@/components/ui/logo";

interface CredentialAttribute {
  trait_type: string;
  value: string;
}

interface CredentialData {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: CredentialAttribute[];
  animation_url: string | null;
  youtube_url: string | null;
  background_color: string;
  custom_fields: {
    deanSignatureHash: string;
    facultyAdvisor: string;
  };
}

export default function CredentialDetails() {
  const [credentialData, setCredentialData] = useState<CredentialData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [copied, setCopied] = useState<string | null>(null);

  // Mock credential data
  useEffect(() => {
    const mockData: CredentialData = {
      name: "BTECH",
      description:
        "Official academic credential awarded by Example University for the successful completion of the Bachelor of Science in Computer Science program.",
      image: "/placeholder.svg?height=400&width=400&text=University+Logo",
      external_url:
        "ipfs://QmYourCredentialDetailsHash/bs_cs_program_details.pdf",
      attributes: [
        { trait_type: "Credential Type", value: "Bachelor's Degree" },
        { trait_type: "Issuing Institution", value: "Example University" },
        {
          trait_type: "Issuer Wallet",
          value: "0xUniversityOfficialWalletAddress12345",
        },
        { trait_type: "Recipient Name", value: "John Doe" },
        {
          trait_type: "Recipient Wallet",
          value: "0xStudentWalletAddressABCDEF",
        },
        { trait_type: "Issue Date", value: "2024-05-15" },
        { trait_type: "Graduation Date", value: "2024-05-15" },
        { trait_type: "Major", value: "Computer Science" },
        { trait_type: "GPA", value: "3.85" },
        { trait_type: "Credential ID", value: "EXU-CS-BS-12345-2024" },
        { trait_type: "Status", value: "Active" },
        {
          trait_type: "Verification URL",
          value:
            "https://vericred.com/verify?credentialId=EXU-CS-BS-12345-2024",
        },
        {
          trait_type: "Accreditation Body",
          value: "Accreditation Council for Education (ACE)",
        },
        {
          trait_type: "Program Details",
          value: "ipfs://QmProgramDetailsHash/bs_cs_curriculum.json",
        },
      ],
      animation_url: null,
      youtube_url: null,
      background_color: "FFFFFF",
      custom_fields: {
        deanSignatureHash: "QmDeanSignatureHashForThisCredential",
        facultyAdvisor: "Dr. Alan Turing",
      },
    };

    // Simulate API loading
    setTimeout(() => {
      setCredentialData(mockData);
      setLoading(false);
    }, 1500);
  }, []);

  const getAttributeValue = (traitType: string) => {
    return (
      credentialData?.attributes.find((attr) => attr.trait_type === traitType)
        ?.value || "N/A"
    );
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAttributeIcon = (traitType: string) => {
    switch (traitType) {
      case "Credential Type":
        return <Award className="h-4 w-4" />;
      case "Issuing Institution":
        return <Building2 className="h-4 w-4" />;
      case "Recipient Name":
        return <User className="h-4 w-4" />;
      case "Issue Date":
      case "Graduation Date":
        return <Calendar className="h-4 w-4" />;
      case "Major":
        return <BookOpen className="h-4 w-4" />;
      case "GPA":
        return <Star className="h-4 w-4" />;
      case "Status":
        return <CheckCircle className="h-4 w-4" />;
      case "Issuer Wallet":
      case "Recipient Wallet":
        return <Wallet className="h-4 w-4" />;
      case "Credential ID":
        return <Hash className="h-4 w-4" />;
      case "Verification URL":
        return <Shield className="h-4 w-4" />;
      case "Accreditation Body":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Removed local header (global navbar is used) */}

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
              <motion.h2
                className="text-2xl font-semibold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Loading Credential
              </motion.h2>
              <motion.p
                className="text-gray-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Fetching credential details from blockchain...
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!credentialData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Credential Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-400 mb-4">
              The requested credential could not be loaded.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-white text-black hover:bg-gray-100"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Removed local header (global navbar is used) */}
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer">VeriCred</span>
            <ChevronRight className="h-4 w-4" />
            <span className="hover:text-white cursor-pointer">
              {getAttributeValue("Issuing Institution")}
            </span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{credentialData.name}</span>
          </div>
        </motion.div>

        {/* Main Content - OpenSea Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Image */}
            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900">
                  <motion.img
                    src={credentialData.image || "/placeholder.svg"}
                    alt="Credential"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 backdrop-blur-sm border-gray-700 text-white hover:bg-black/70"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 backdrop-blur-sm border-gray-700 text-white hover:bg-black/70"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collection Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/placeholder.svg?height=40&width=40&text=Uni"
                      alt="University"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-white">
                        {getAttributeValue("Issuing Institution")}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Verified Institution
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-green-900/30 text-green-300 border-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {credentialData.name}
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {credentialData.description}
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">1.2K views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">89 favorites</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Trending</span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Owned by</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="font-medium text-white">
                        {getAttributeValue("Recipient Name")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Issued</p>
                    <p className="font-medium text-white">
                      {getAttributeValue("Issue Date")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3"
                  onClick={() =>
                    window.open(getAttributeValue("Verification URL"), "_blank")
                  }
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Credential
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent font-semibold py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </motion.div>
            </div>

            {/* Tabs Section */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-800">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  Properties
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {credentialData.description}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contract Address</span>
                      <span className="text-white font-mono text-sm flex items-center gap-1">
                        {formatAddress(getAttributeValue("Issuer Wallet"))}
                        {getAttributeValue("Issuer Wallet") && (
                          <button
                            onClick={() =>
                              copy(getAttributeValue("Issuer Wallet"))
                            }
                            className="p-1 rounded-md hover:bg-white/10"
                            title="Copy issuer wallet"
                          >
                            {copied === getAttributeValue("Issuer Wallet") ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-gray-300" />
                            )}
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token ID</span>
                      <span className="text-white font-mono text-sm">
                        {getAttributeValue("Credential ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token Standard</span>
                      <span className="text-white">ERC-721</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blockchain</span>
                      <span className="text-white">Ethereum</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {credentialData.attributes.map((attribute, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                        <CardContent className="p-3 text-center">
                          <div className="flex items-center justify-center mb-2">
                            {getAttributeIcon(attribute.trait_type)}
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            {attribute.trait_type}
                          </p>
                          <p className="font-medium text-white text-sm truncate flex items-center gap-1">
                            {attribute.trait_type.includes("Wallet")
                              ? formatAddress(attribute.value)
                              : attribute.value}
                            {attribute.trait_type.includes("Wallet") && (
                              <button
                                onClick={() => copy(attribute.value)}
                                className="p-1 rounded-md hover:bg-white/10"
                                title="Copy address"
                              >
                                {copied === attribute.value ? (
                                  <Check className="h-3.5 w-3.5 text-green-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-gray-300" />
                                )}
                              </button>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.floor(Math.random() * 20 + 5)}% have this
                            trait
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {[
                        {
                          action: "Minted",
                          user: "Example University",
                          time: "2 days ago",
                          icon: Award,
                        },
                        {
                          action: "Verified",
                          user: "VeriCred System",
                          time: "2 days ago",
                          icon: Shield,
                        },
                        {
                          action: "Viewed",
                          user: "Anonymous",
                          time: "1 hour ago",
                          icon: Eye,
                        },
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <activity.icon className="h-4 w-4 text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {activity.action} by {activity.user}
                            </p>
                            <p className="text-sm text-gray-400">
                              {activity.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
