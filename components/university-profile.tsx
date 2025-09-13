"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Globe,
  Wallet,
  Edit,
  Building2,
  Users,
  Award,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface University {
  id: string;
  name: string;
  description: string;
  website: string;
  walletAddress: string;
  verified: boolean;
  adminName: string;
  adminRole: string;
}

interface UniversityProfileProps {
  university: University;
}

export default function UniversityProfile({
  university,
}: UniversityProfileProps) {
  const [copied, setCopied] = useState(false);
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(university.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
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

  const cardHoverVariants = {
    hover: {
      y: -4,
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="bg-gradient-to-br from-gray-900/90 via-black/80 to-purple-900/20 border border-gray-800/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Removed banner header and edit button */}

        {/* Profile Content */}
        <CardContent className="relative pb-6 px-6 pt-6">
          <motion.div className="flex flex-col gap-6" variants={itemVariants}>
            {/* University Header */}
            <motion.div
              className="text-center sm:text-left"
              variants={itemVariants}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                {/* University Icon removed for a cleaner look */}
                {/* <motion.div
                  className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Building2 className="h-10 w-10 text-white" />
                </motion.div> */}

                <div className="flex-1 text-center sm:text-left">
                  <motion.h1
                    className="text-3xl font-bold text-white mb-2"
                    variants={itemVariants}
                  >
                    {university.name}
                  </motion.h1>

                  <motion.div
                    className="flex items-center justify-center sm:justify-start gap-3 mb-3"
                    variants={itemVariants}
                  >
                    {university.verified && (
                      <Badge className="bg-green-900/40 text-green-300 border-green-700/60 backdrop-blur-sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Institution
                      </Badge>
                    )}
                    <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/60 backdrop-blur-sm">
                      <Users className="h-3 w-3 mr-1" />
                      Active Issuer
                    </Badge>
                  </motion.div>
                </div>
              </div>

              <motion.p
                className="text-gray-300 leading-relaxed text-center sm:text-left max-w-3xl"
                variants={itemVariants}
              >
                {university.description}
              </motion.p>
            </motion.div>

            {/* University Details Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={itemVariants}
            >
              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/60 hover:border-purple-600/60 transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Website
                    </p>
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors duration-200"
                    >
                      {university.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/60 hover:border-purple-600/60 transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Wallet Address
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-300 text-sm font-mono font-medium truncate">
                        {formatAddress(university.walletAddress)}
                      </p>
                      <button
                        onClick={copyAddr}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-[11px] text-gray-300 hover:bg-gray-800 hover:text-white transition"
                        title="Copy address"
                        aria-label="Copy wallet address"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden md:inline">
                          {copied ? "Copied" : "Copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/60 hover:border-purple-600/60 transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Admin
                    </p>
                    <p className="text-gray-300 text-sm font-medium">
                      {university.adminName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {university.adminRole}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
