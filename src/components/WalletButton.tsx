"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const [owatchBalance, setOwatchBalance] = useState<number>(0);

  // Load OWATCH balance from localStorage or backend
  useEffect(() => {
    if (isConnected && address) {
      // For now, load from localStorage
      // Later we can fetch from backend using wallet address
      const savedBalance = parseInt(
        localStorage.getItem("owatch_balance") || "0"
      );
      setOwatchBalance(savedBalance);
    }
  }, [isConnected, address]);

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
                    type="button"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-4">
                  {/* Balance Display */}
                  <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm">
                      {owatchBalance} OWATCH
                    </span>
                  </div>

                  {/* Wallet Info */}
                  <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white text-sm">
                      {account?.address
                        ? formatWalletAddress(account.address)
                        : "Connected"}
                    </span>
                  </div>

                  {/* Account Modal Button */}
                  <button
                    onClick={openAccountModal}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    type="button"
                  >
                    Account
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
