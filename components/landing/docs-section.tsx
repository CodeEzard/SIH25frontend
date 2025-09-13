"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Compass,
  Shield,
  KeyRound,
  Sparkles,
  Layers,
  Blocks,
  Code,
  Database,
  Cloud,
  Wallet,
  ArrowRight,
} from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DocsSection() {
  return (
    <section
      id="docs"
      className="relative py-16 md:py-24 border-t border-gray-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-800/60 bg-gray-900/40 px-3 py-1 text-xs text-gray-300 mb-4">
            <BookOpen className="h-4 w-4 text-purple-400" />
            Documentation
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            VeriCred: Decentralized Digital Credentials
          </h2>
          <p className="text-gray-400 mt-4">
            VeriCred is a cutting-edge platform revolutionizing academic and
            professional credentialing. It leverages blockchain technology
            (ERC-721 NFTs on Ethereum — Sepolia testnet now; mainnet later) for
            secure, transparent, and instantly verifiable digital records of
            achievements, empowering individuals and streamlining processes for
            institutions and verifiers.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
        >
          {[
            {
              icon: Shield,
              title: "Forgery-Proof Credentials",
              desc: "NFTs signed by verified issuers.",
            },
            {
              icon: Compass,
              title: "Instant & Global Verification",
              desc: "Real-time validation via blockchain.",
            },
            {
              icon: Wallet,
              title: "Individual Ownership",
              desc: "Credentials managed in personal digital wallets.",
            },
            {
              icon: Layers,
              title: "Reduced Admin Burden",
              desc: "Streamlined issuance for institutions.",
            },
            {
              icon: Sparkles,
              title: "Enhanced Portability",
              desc: "Easy sharing of digital achievements.",
            },
            {
              icon: KeyRound,
              title: "Secure by Design",
              desc: "Cryptographically verifiable records.",
            },
          ].map((f, i) => (
            <motion.div key={i} variants={item}>
              <Card className="bg-gray-900/70 border-gray-800 hover:border-gray-700 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <f.icon className="h-4 w-4 text-purple-400" />
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14"
        >
          <h3 className="text-2xl font-semibold text-white mb-4">
            Technology Stack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Blockchain",
                icon: Blocks,
                items: ["Ethereum (Sepolia now; mainnet later)"],
              },
              {
                title: "Smart Contracts",
                icon: Code,
                items: [
                  "Solidity",
                  "ERC-721",
                  "IssuerRegistry",
                  "RevocationRegistry",
                ],
              },
              {
                title: "Backend",
                icon: Database,
                items: ["Golang", "PostgreSQL", "IPFS / Pinata"],
              },
              {
                title: "Frontend",
                icon: BookOpen,
                items: ["React / Next.js", "Tailwind CSS", "shadcn/ui"],
              },
              {
                title: "Storage",
                icon: Cloud,
                items: ["IPFS / Pinata", "Postgresql"],
              },
              {
                title: "Wallets",
                icon: Wallet,
                items: ["MetaMask", "WalletConnect"],
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="bg-gray-900/70 border-gray-800 hover:border-gray-700 transition-colors h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <s.icon className="h-4 w-4 text-purple-400" />
                      {s.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-400">
                    <ul className="space-y-1">
                      {s.items.map((it, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400/70" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
    </section>
  );
}
