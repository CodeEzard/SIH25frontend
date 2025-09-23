"use client";

// import { PrivyProvider } from "@privy-io/react-auth";
// import React from "react";

export default function PrivyAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily disabled
  return <>{children}</>;
  // return (
  //   <PrivyProvider
  //     appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
  //     config={{
  //       loginMethods: ["email", "google", "wallet"],
  //       embeddedWallets: {
  //         createOnLogin: "users-without-wallets",
  //       },
  //     }}
  //   >
  //     {children}
  //   </PrivyProvider>
  // );
}
