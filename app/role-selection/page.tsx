"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  User,
  Building2,
  ArrowRight,
  Shield,
  Award,
  Users,
  Copy,
  Check,
} from "lucide-react";
import Logo from "@/components/ui/logo";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check wallet connection
    const checkWalletConnection = () => {
      try {
        const storedWallet = localStorage.getItem("vericred_wallet");
        if (storedWallet) {
          const walletData = JSON.parse(storedWallet);
          setIsConnected(true);
          setWalletAddress(walletData.address);
        } else {
          // Redirect back to home if not connected
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
        window.location.href = "/";
      }
    };

    checkWalletConnection();
  }, []);

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);

    // Add role to stored wallet data
    try {
      const storedWallet = localStorage.getItem("vericred_wallet");
      if (storedWallet) {
        const walletData = JSON.parse(storedWallet);
        walletData.role = role;
        localStorage.setItem("vericred_wallet", JSON.stringify(walletData));
      }
    } catch (error) {
      console.error("Error updating wallet data:", error);
    }

    // Redirect based on role after animation
    setTimeout(() => {
      if (role === "individual") {
        window.location.href = "/dashboard";
      } else if (role === "university") {
        window.location.href = "/university";
      }
    }, 1500);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying wallet connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute w-32 h-32 border border-gray-800 rounded-full"
          style={{ left: "10%", top: "20%" }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: 360,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-24 h-24 border border-gray-700"
          style={{ right: "15%", top: "15%" }}
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-40 h-40 border border-gray-800 rounded-full"
          style={{ left: "70%", bottom: "20%" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute w-16 h-16 border border-gray-700 transform rotate-45"
          style={{ left: "20%", bottom: "30%" }}
          animate={{
            rotate: [45, 405],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Pulsing circles */}
        <motion.div
          className="absolute w-96 h-96 border border-gray-800 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            marginLeft: "-192px",
            marginTop: "-192px",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-64 h-64 border border-gray-700 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            marginLeft: "-128px",
            marginTop: "-128px",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Moving particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="p-6 sm:p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <motion.div
              className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Wallet className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300 font-mono">
                {formatAddress(walletAddress)}
              </span>
              <button
                onClick={copyAddr}
                className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-0.5 text-[11px] text-gray-300 hover:bg-gray-800 hover:text-white transition"
                title="Copy address"
                aria-label="Copy wallet address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8">
          <div className="max-w-4xl w-full">
            {/* Title Section */}
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                Choose Your
                <br />
                <span className="text-gray-400">Identity</span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Select how you want to use VeriCred to get started with your
                decentralized credential journey
              </motion.p>
            </motion.div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Individual Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card
                  className={`bg-gray-900 border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedRole === "individual"
                      ? "border-white shadow-2xl shadow-white/20"
                      : "border-gray-800 hover:border-gray-600"
                  }`}
                  onClick={() => handleRoleSelection("individual")}
                >
                  {/* Card Background Animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardContent className="p-8 sm:p-10 relative z-10">
                    <motion.div
                      className="text-center space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      <motion.div
                        className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <User className="h-10 w-10 text-black" />
                      </motion.div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                          Individual
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                          Access and manage your personal credentials, request
                          NFT certificates from institutions, and build your
                          verified digital portfolio.
                        </p>
                      </div>

                      <div className="space-y-3 text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Shield className="h-4 w-4 text-green-400" />
                          <span>Secure credential storage</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4 text-blue-400" />
                          <span>Request NFT certificates</span>
                        </div>
                      </div>

                      <motion.div
                        className="pt-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 text-lg"
                          disabled={selectedRole !== null}
                        >
                          {selectedRole === "individual" ? (
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "linear",
                                }}
                              >
                                <ArrowRight className="h-5 w-5" />
                              </motion.div>
                              Redirecting...
                            </motion.div>
                          ) : (
                            <>
                              Continue as Individual
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* University Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card
                  className={`bg-gray-900 border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedRole === "university"
                      ? "border-white shadow-2xl shadow-white/20"
                      : "border-gray-800 hover:border-gray-600"
                  }`}
                  onClick={() => handleRoleSelection("university")}
                >
                  {/* Card Background Animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardContent className="p-8 sm:p-10 relative z-10">
                    <motion.div
                      className="text-center space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <motion.div
                        className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Building2 className="h-10 w-10 text-black" />
                      </motion.div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                          University
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                          Manage your institution's presence, issue verified
                          credentials to students, and oversee the NFT minting
                          process.
                        </p>
                      </div>

                      <div className="space-y-3 text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4 text-purple-400" />
                          <span>Student management</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4 text-yellow-400" />
                          <span>Issue NFT credentials</span>
                        </div>
                      </div>

                      <motion.div
                        className="pt-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 text-lg"
                          disabled={selectedRole !== null}
                        >
                          {selectedRole === "university" ? (
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "linear",
                                }}
                              >
                                <ArrowRight className="h-5 w-5" />
                              </motion.div>
                              Redirecting...
                            </motion.div>
                          ) : (
                            <>
                              Continue as University
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Bottom Info */}
            <motion.div
              className="text-center mt-12 sm:mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <p className="text-sm text-gray-500">
                You can change your role later in your account settings
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Selection Overlay Animation */}
      {selectedRole && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <h3 className="text-xl font-semibold text-white mb-2">
              Setting up your {selectedRole} account...
            </h3>
            <p className="text-gray-400">Please wait while we redirect you</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
