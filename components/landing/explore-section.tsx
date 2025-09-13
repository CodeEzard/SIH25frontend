"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  Rocket,
  Sparkles,
  Wallet,
  Users,
  FileCheck,
  Share2,
  Eye,
} from "lucide-react";
import AddressSearch from "@/components/home/address-search";

export default function ExploreSection() {
  return (
    <section
      id="explore"
      className="relative py-16 md:py-24 border-t border-gray-800/80"
    >
      {/* Background accent */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-10 h-56 w-56 rounded-full bg-purple-700/10 blur-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-800/60 bg-gray-900/40 px-3 py-1 text-xs text-gray-300 mb-4">
            <Rocket className="h-4 w-4 text-purple-400" />
            Explore
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Discover the Platform
          </h2>
          <p className="text-gray-400 mt-4">
            Browse the tech, components, and real-world applications of
            VeriCred. Below you’ll find an overview and interactive tabs to
            learn more about what you can build.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: How it works timeline */}
          <Card className="bg-gray-900/70 border-gray-800 hover:border-gray-700 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-purple-400" />
                How VeriCred Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ol className="space-y-5">
                {[
                  {
                    title: "Connect Wallet",
                    desc: "Use MetaMask to connect and authenticate.",
                    icon: Wallet,
                  },
                  {
                    title: "Choose Role",
                    desc: "Select University (issuer), Student (holder), or Verifier.",
                    icon: Users,
                  },
                  {
                    title: "Issue / Receive Credential",
                    desc: "Universities mint ERC-721 credentials; students receive them.",
                    icon: FileCheck,
                  },
                  {
                    title: "Share & Verify",
                    desc: "Share your credential link; verifiers validate instantly on-chain.",
                    icon: Share2,
                  },
                  {
                    title: "Public Ledger & Revocation",
                    desc: "Activity appears on the public ledger; issuers can revoke if needed.",
                    icon: Eye,
                  },
                ].map((s, i, arr) => (
                  <li key={i} className="relative pl-10">
                    {/* number badge */}
                    <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/15 text-purple-300 text-xs font-medium">
                      {i + 1}
                    </span>
                    {/* connector line */}
                    {i < arr.length - 1 && (
                      <span
                        className="absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px bg-gray-800"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex items-center gap-2 text-white">
                      <s.icon className="h-4 w-4 text-purple-400" />
                      <span className="font-medium">{s.title}</span>
                    </div>
                    <p className="text-gray-400 mt-1">{s.desc}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Right: Tabs + Quick Lookup stacked */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-gray-900 border border-gray-800">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="code"
                      className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                    >
                      Example Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="overview"
                    className="mt-4 text-gray-300 space-y-3"
                  >
                    <p>
                      VeriCred leverages ERC-721 NFTs on Ethereum — Sepolia
                      testnet for now; mainnet later — to provide secure,
                      transparent, and instantly verifiable digital credentials.
                      Individuals keep ownership and can share proofs easily;
                      institutions benefit from automation and reduced overhead.
                    </p>
                    <ul className="list-disc ml-6 text-gray-400">
                      <li>Real-time on-chain verification</li>
                      <li>ERC-721-based credentials</li>
                      <li>Issuer and revocation registries</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="code" className="mt-4">
                    <div className="rounded-md border border-gray-800 bg-black p-4 text-xs text-gray-300 overflow-x-auto">
                      <pre className="whitespace-pre">
                        {`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract vericredNFT is ERC721URIStorage, Ownable {
    address public owner;
    uint256 public _tokenIds;
    mapping (address => bool) public verifiedOrgs;
    address[] public Orgs;

    // Show only 1–2 functions for brevity
    constructor() ERC721("VeriCred", "VCRED") {}

    function setVerifiedOrg(address org, bool status) external onlyOwner {
        verifiedOrgs[org] = status;
    }
}`}
                      </pre>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5" />
                      This snippet shows a minimal subset (constructor + one
                      function) from the contract.
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Quick Lookup: Search by Address */}
            <div className="mt-6">
              <AddressSearch />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
