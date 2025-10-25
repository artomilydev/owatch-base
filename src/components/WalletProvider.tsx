"use client";

import { FC, ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
