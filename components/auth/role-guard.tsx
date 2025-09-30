"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredToken, isJwtValid } from "./jwt";

// RoleGuard enforces access by account_type from /api/v1/auth/me.
// - required: "student" | "university"
// - If no valid token, redirect to "/"
// - If token valid but wrong role, redirect to their correct area
// - If unknown, redirect to /role-selection
export default function RoleGuard({
  children,
  required,
}: {
  children: React.ReactNode;
  required: "student" | "university";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = getStoredToken();
      if (!isJwtValid(token)) {
        if (pathname !== "/") router.replace("/");
        setChecking(false);
        return;
      }

      let at: "student" | "university" | "unknown" = "unknown";
      try {
        const res = await fetch("http://localhost:8080/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const me = await res.json();
          at = me?.account_type || "unknown";
          // cache lightweight user
          try {
            localStorage.setItem(
              "vericred_user",
              JSON.stringify({
                account_type: at,
                address: me?.address,
                has_user_profile: me?.has_user_profile,
                has_university_profile: me?.has_university_profile,
              })
            );
          } catch {}
        }
      } catch {}

      if (at === "unknown") {
        if (pathname !== "/role-selection") router.replace("/role-selection");
        setChecking(false);
        return;
      }

      if (required === "student" && at !== "student") {
        router.replace(at === "university" ? "/university" : "/role-selection");
        setChecking(false);
        return;
      }
      if (required === "university" && at !== "university") {
        router.replace(at === "student" ? "/dashboard" : "/role-selection");
        setChecking(false);
        return;
      }

      setChecking(false);
    };
    run();
  }, [router, pathname, required]);

  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Checking access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
