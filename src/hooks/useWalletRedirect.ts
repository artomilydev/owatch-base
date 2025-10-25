"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "wagmi";

export function useWalletRedirect() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If connected and on landing page, redirect to dashboard
    if (isConnected && pathname === "/") {
      router.push("/dashboard/videos");
    }

    // If disconnected and on dashboard, redirect to landing
    if (!isConnected && pathname.startsWith("/dashboard")) {
      router.push("/");
    }
  }, [isConnected, pathname, router]);

  return { isConnected };
}
