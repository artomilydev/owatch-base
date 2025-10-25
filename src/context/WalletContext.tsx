"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  balance: string;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

// Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const connector = connectors[0]; // Use first available connector
    if (connector) {
      connect({ connector });
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    balance: balance?.formatted || "0",
    isConnecting,
    error: error?.message || null,
    connect: handleConnect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
