"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
// import { usePrivy } from "@privy-io/react-auth";
import { saveWalletSession } from "@/components/auth/jwt";

interface UserProfile {
  walletAddress: string;
  role: string;
  name?: string;
}

interface WalletStatusProps {
  userProfile: UserProfile | null;
  onDisconnect: () => void;
  // New: optionally hide the role badge (e.g., to remove 'Individual')
  showRoleBadge?: boolean;
}

export default function WalletStatus({
  userProfile,
  onDisconnect,
  showRoleBadge = true,
}: WalletStatusProps) {
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrivyLoading, setIsPrivyLoading] = useState(false);
  const router = useRouter();
  // const { login: privyLogin, user, getAccessToken, authenticated, ready } = usePrivy();
  // const privyProcessing = useRef(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!userProfile?.walletAddress) return;
    try {
      await navigator.clipboard.writeText(userProfile.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // ignore
    }
  };

  const handleMetaMaskConnect = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const hasEthereum = typeof (window as any).ethereum !== "undefined";
      if (!hasEthereum) {
        alert(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      // Avoid duplicate requests
      const accounts = (await provider.send("eth_accounts", [])) as string[];
      if (!accounts || accounts.length === 0) {
        await provider.send("eth_requestAccounts", []);
      }
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const nonceRes = await fetch("http://localhost:8080/getnonce", {
        method: "POST",
        body: JSON.stringify({ metamask_address: address }),
        headers: { "Content-Type": "application/json" },
      });
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();
      const signature = await signer.signMessage(nonce);
      const loginRes = await fetch("http://localhost:8080/auth/metamasklogin", {
        method: "POST",
        body: JSON.stringify({ metamask_address: address, signature }),
        headers: { "Content-Type": "application/json" },
      });
      if (!loginRes.ok) throw new Error("Login failed");
      const token = await loginRes.text();
      const network = await provider.getNetwork();
      saveWalletSession({
        address,
        chainId: `0x${network.chainId.toString(16)}`,
        isConnected: true,
        timestamp: Date.now(),
        token,
      });
      router.replace("/home");
    } catch (error: any) {
      const code = error?.code;
      if (code === 4001 || code === "ACTION_REJECTED") {
        alert("MetaMask connection was rejected by user.");
      } else if (code === -32002) {
        alert(
          "MetaMask connection request is already pending. Please check MetaMask."
        );
      } else {
        alert(
          `Failed to connect MetaMask: ${error?.message ?? "Unknown error"}`
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrivyLogin = async () => {
    // Temporarily disabled
    alert("Login is temporarily disabled.");
    // try {
    //   if (typeof privyLogin !== "function") {
    //     alert(
    //       "Login is unavailable. Missing or invalid NEXT_PUBLIC_PRIVY_APP_ID."
    //     );
    //     return;
    //   }
    //   setIsPrivyLoading(true);
    //   await privyLogin();
    // } catch (e: any) {
    //   console.error("Privy login error", e);
    //   alert(e?.message || "Login failed");
    // } finally {
    //   setIsPrivyLoading(false);
    // }
  };

  // Process Privy session once authenticated (handles OAuth/magic link flows)
  // useEffect(() => {
  //   const run = async () => {
  //     if (!ready || !authenticated || privyProcessing.current) return;
  //     privyProcessing.current = true;
  //     try {
  //       const token = (await getAccessToken?.()) as string | undefined;
  //       const embeddedAddr = (user as any)?.embeddedWallet?.address;
  //       if (token && embeddedAddr) {
  //         const resp = await fetch(
  //           "http://localhost:8080/api/v1/auth/privy-login",
  //           {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               privy_token: token,
  //               wallet_address: embeddedAddr,
  //             }),
  //           }
  //         );
  //         if (!resp.ok) throw new Error("Privy login failed");
  //         const { jwt } = await resp.json();
  //         saveWalletSession({ address: embeddedAddr, isConnected: true, token: jwt });
  //         router.replace("/home");
  //       }
  //     } catch (err) {
  //       console.error("Privy post-auth processing failed", err);
  //     } finally {
  //       privyProcessing.current = false;
  //     }
  //   };
  //   run();
  // }, [ready, authenticated, getAccessToken, router, user]);

  // Show loading state if userProfile is null
  if (!userProfile) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePrivyLogin}
          disabled={isPrivyLoading}
          className="bg-white text-black hover:bg-gray-100 shadow-sm"
          size="sm"
        >
          {isPrivyLoading ? "Opening..." : "Login / Sign Up"}
        </Button>
        <Button
          onClick={handleMetaMaskConnect}
          disabled={isConnecting}
          variant="outline"
          className="border-gray-700 text-gray-200 hover:bg-white/5"
          size="sm"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "MetaMask"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
        <Wallet className="h-4 w-4 text-green-400" />
        <span className="text-sm text-gray-300 whitespace-nowrap">
          {" "}
          <span className="font-mono text-white">
            {formatAddress(userProfile.walletAddress)}
          </span>
        </span>
        <button
          onClick={copyAddress}
          className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition"
          title="Copy address"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="hidden xl:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
        {showRoleBadge && (
          <Badge
            variant="secondary"
            className="text-xs bg-gray-800 text-gray-300 border-gray-700"
          >
            {userProfile.role}
          </Badge>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onDisconnect}
        className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Disconnect</span>
      </Button>
    </div>
  );
}
