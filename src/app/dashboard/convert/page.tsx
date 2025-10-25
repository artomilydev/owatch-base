"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import {
  ArrowRightLeft,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface ConversionRate {
  pointsRequired: number;
  owtAmount: number;
  bonusPercentage?: number;
}

const conversionRates: ConversionRate[] = [
  { pointsRequired: 100, owtAmount: 1 },
  { pointsRequired: 500, owtAmount: 5, bonusPercentage: 5 },
  { pointsRequired: 1000, owtAmount: 10, bonusPercentage: 10 },
  { pointsRequired: 5000, owtAmount: 50, bonusPercentage: 15 },
  { pointsRequired: 10000, owtAmount: 100, bonusPercentage: 20 },
];

export default function ConvertPage() {
  const { address, isConnected } = useAccount();
  const [points, setPoints] = useState<number>(0);
  const [selectedConversion, setSelectedConversion] =
    useState<ConversionRate | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionHistory, setConversionHistory] = useState<any[]>([]);

  // Load points from localStorage
  useEffect(() => {
    if (isConnected && address) {
      const savedPoints = parseInt(
        localStorage.getItem(`owatch_points_${address}`) || "0"
      );
      setPoints(savedPoints);

      // Load conversion history
      const history = JSON.parse(
        localStorage.getItem(`owatch_conversion_history_${address}`) || "[]"
      );
      setConversionHistory(history);
    }
  }, [isConnected, address]);

  const handleConvert = async (conversion: ConversionRate) => {
    if (!isConnected || !address || points < conversion.pointsRequired) {
      return;
    }

    setIsConverting(true);
    setSelectedConversion(conversion);

    try {
      // Simulate conversion process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate actual OWT amount with bonus
      let actualOwt = conversion.owtAmount;
      if (conversion.bonusPercentage) {
        actualOwt =
          conversion.owtAmount +
          (conversion.owtAmount * conversion.bonusPercentage) / 100;
      }

      // Update points
      const newPoints = points - conversion.pointsRequired;
      setPoints(newPoints);
      localStorage.setItem(`owatch_points_${address}`, newPoints.toString());

      // Update OWT balance (assuming we store OWT separately from points now)
      const currentOwt = parseFloat(
        localStorage.getItem(`owatch_owt_${address}`) || "0"
      );
      const newOwt = currentOwt + actualOwt;
      localStorage.setItem(`owatch_owt_${address}`, newOwt.toString());

      // Add to conversion history
      const newConversion = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        pointsUsed: conversion.pointsRequired,
        owtReceived: actualOwt,
        bonusPercentage: conversion.bonusPercentage || 0,
      };

      const updatedHistory = [newConversion, ...conversionHistory].slice(0, 10); // Keep last 10
      setConversionHistory(updatedHistory);
      localStorage.setItem(
        `owatch_conversion_history_${address}`,
        JSON.stringify(updatedHistory)
      );

      // Show success message
      alert(
        `Successfully converted ${conversion.pointsRequired} points to ${actualOwt} OWT tokens!`
      );
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
      setSelectedConversion(null);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>
              Please connect your wallet to convert points to OWT tokens
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900">
          Convert Points to OWT
        </h1>
        <p className="text-lg dark:text-gray-300 text-gray-600">
          Exchange your earned points for OWT tokens with bonus rates for larger
          conversions
        </p>
      </div>

      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-purple-500" />
            <span>Your Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
              <div className="text-2xl font-bold dark:text-white text-gray-900">
                {points.toLocaleString()}
              </div>
              <div className="text-sm dark:text-gray-400 text-gray-500">
                Points Available
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold dark:text-white text-gray-900">
                {parseFloat(
                  localStorage.getItem(`owatch_owt_${address}`) || "0"
                ).toFixed(2)}
              </div>
              <div className="text-sm dark:text-gray-400 text-gray-500">
                OWT Tokens
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            <span>Conversion Rates</span>
          </CardTitle>
          <CardDescription>
            Choose the conversion amount that works best for you. Larger
            conversions offer bonus rates!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversionRates.map((rate, index) => (
              <div
                key={index}
                className={`relative p-4 border rounded-lg transition-all hover:shadow-lg ${
                  rate.bonusPercentage
                    ? "border-purple-500 bg-purple-500/5"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {rate.bonusPercentage && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    +{rate.bonusPercentage}% Bonus
                  </div>
                )}

                <div className="text-center space-y-3">
                  <div>
                    <div className="text-lg font-semibold dark:text-white text-gray-900">
                      {rate.pointsRequired.toLocaleString()} Points
                    </div>
                    <ArrowRightLeft className="w-4 h-4 mx-auto my-2 text-gray-500" />
                    <div className="text-lg font-semibold text-green-500">
                      {rate.bonusPercentage
                        ? (
                            rate.owtAmount +
                            (rate.owtAmount * rate.bonusPercentage) / 100
                          ).toFixed(1)
                        : rate.owtAmount}{" "}
                      OWT
                    </div>
                  </div>

                  <Button
                    onClick={() => handleConvert(rate)}
                    disabled={points < rate.pointsRequired || isConverting}
                    className={`w-full ${
                      points < rate.pointsRequired
                        ? "opacity-50 cursor-not-allowed"
                        : rate.bonusPercentage
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isConverting && selectedConversion === rate ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Converting...
                      </>
                    ) : points < rate.pointsRequired ? (
                      "Insufficient Points"
                    ) : (
                      "Convert Now"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-500" />
            <span>How It Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold dark:text-white text-gray-900 mb-1">
                Earn Points
              </div>
              <div className="dark:text-gray-400 text-gray-600">
                Watch videos to earn points instead of direct tokens
              </div>
            </div>
            <div className="text-center">
              <ArrowRightLeft className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold dark:text-white text-gray-900 mb-1">
                Convert to OWT
              </div>
              <div className="dark:text-gray-400 text-gray-600">
                Exchange your points for OWT tokens at any time
              </div>
            </div>
            <div className="text-center">
              <Coins className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold dark:text-white text-gray-900 mb-1">
                Bonus Rewards
              </div>
              <div className="dark:text-gray-400 text-gray-600">
                Get bonus OWT tokens for larger conversions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion History */}
      {conversionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Recent Conversions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionHistory.map((conversion) => (
                <div
                  key={conversion.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-semibold dark:text-white text-gray-900">
                        {conversion.pointsUsed.toLocaleString()} Points →{" "}
                        {conversion.owtReceived} OWT
                      </div>
                      <div className="text-sm dark:text-gray-400 text-gray-500">
                        {formatDate(conversion.timestamp)}
                        {conversion.bonusPercentage > 0 && (
                          <span className="ml-2 text-purple-500">
                            (+{conversion.bonusPercentage}% bonus)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
