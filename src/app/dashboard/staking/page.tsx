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
  TrendingUp,
  Lock,
  Unlock,
  Clock,
  Coins,
  Info,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Zap,
} from "lucide-react";

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  minStake: number;
  maxStake: number;
  lockPeriodDays: number;
  description: string;
  riskLevel: "low" | "medium" | "high";
}

interface UserStake {
  poolId: string;
  amount: number;
  stakedAt: number;
  unlockAt: number;
  rewards: number;
}

const stakingPools: StakingPool[] = [
  {
    id: "pool-1",
    name: "Secure Staking",
    apy: 12,
    minStake: 10,
    maxStake: 10000,
    lockPeriodDays: 30,
    description: "Lock your tokens for 30 days and earn stable rewards",
    riskLevel: "low",
  },
  {
    id: "pool-2",
    name: "Premium Staking",
    apy: 18,
    minStake: 50,
    maxStake: 50000,
    lockPeriodDays: 90,
    description: "Higher rewards with 90-day lock period",
    riskLevel: "low",
  },
  {
    id: "pool-3",
    name: "Elite Staking",
    apy: 25,
    minStake: 100,
    maxStake: 100000,
    lockPeriodDays: 180,
    description: "Premium rewards for long-term stakers",
    riskLevel: "medium",
  },
  {
    id: "pool-4",
    name: "Flexible Staking",
    apy: 8,
    minStake: 1,
    maxStake: 5000,
    lockPeriodDays: 0,
    description: "Withdraw anytime with flexible rewards",
    riskLevel: "low",
  },
];

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const [owtBalance, setOwtBalance] = useState<number>(0);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    if (isMounted && address) {
      // Load OWT balance
      const savedBalance = parseFloat(
        localStorage.getItem(`owatch_owt_balance_${address}`) || "0"
      );
      setOwtBalance(savedBalance);

      // Load user stakes
      const savedStakes = JSON.parse(
        localStorage.getItem(`owatch_stakes_${address}`) || "[]"
      );
      setUserStakes(savedStakes);

      // Calculate totals
      calculateTotals(savedStakes);
    }
  }, [isMounted, address]);

  const calculateTotals = (stakes: UserStake[]) => {
    const staked = stakes.reduce((acc, stake) => acc + stake.amount, 0);
    const rewards = stakes.reduce((acc, stake) => acc + stake.rewards, 0);
    setTotalStaked(staked);
    setTotalRewards(rewards);
  };

  const calculateRewards = (amount: number, pool: StakingPool): number => {
    if (pool.lockPeriodDays === 0) {
      // Flexible staking: daily rewards
      return (amount * pool.apy) / 365 / 100;
    } else {
      // Fixed staking: lock period rewards
      return (amount * pool.apy * pool.lockPeriodDays) / 365 / 100;
    }
  };

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount || !address) return;

    const amount = parseFloat(stakeAmount);

    if (amount < selectedPool.minStake) {
      alert(`Minimum stake is ${selectedPool.minStake} OWT`);
      return;
    }

    if (amount > selectedPool.maxStake) {
      alert(`Maximum stake is ${selectedPool.maxStake} OWT`);
      return;
    }

    if (amount > owtBalance) {
      alert("Insufficient balance");
      return;
    }

    setIsStaking(true);

    try {
      // Simulate staking transaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const rewards = calculateRewards(amount, selectedPool);
      const unlockAt =
        Date.now() + selectedPool.lockPeriodDays * 24 * 60 * 60 * 1000;

      const newStake: UserStake = {
        poolId: selectedPool.id,
        amount,
        stakedAt: Date.now(),
        unlockAt,
        rewards,
      };

      const updatedStakes = [...userStakes, newStake];
      setUserStakes(updatedStakes);

      // Update balance
      const newBalance = owtBalance - amount;
      setOwtBalance(newBalance);

      // Save to localStorage
      localStorage.setItem(
        `owatch_stakes_${address}`,
        JSON.stringify(updatedStakes)
      );
      localStorage.setItem(
        `owatch_owt_balance_${address}`,
        newBalance.toString()
      );

      calculateTotals(updatedStakes);

      // Reset form
      setStakeAmount("");
      setSelectedPool(null);
      setShowStakeModal(false);

      alert("Staking successful!");
    } catch (error) {
      console.error("Staking error:", error);
      alert("Staking failed. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = (stake: UserStake) => {
    const now = Date.now();
    if (now < stake.unlockAt) {
      alert("Cannot unstake yet. Tokens are still locked.");
      return;
    }

    try {
      const updatedStakes = userStakes.filter(
        (s) => s.poolId !== stake.poolId || s.stakedAt !== stake.stakedAt
      );
      setUserStakes(updatedStakes);

      // Return stake + rewards
      const newBalance = owtBalance + stake.amount + stake.rewards;
      setOwtBalance(newBalance);

      // Save to localStorage
      localStorage.setItem(
        `owatch_stakes_${address}`,
        JSON.stringify(updatedStakes)
      );
      localStorage.setItem(
        `owatch_owt_balance_${address}`,
        newBalance.toString()
      );

      calculateTotals(updatedStakes);
      alert("Unstaking successful!");
    } catch (error) {
      console.error("Unstaking error:", error);
      alert("Unstaking failed. Please try again.");
    }
  };

  const getTimeRemaining = (unlockAt: number): string => {
    const now = Date.now();
    const diff = unlockAt - now;

    if (diff <= 0) return "Unlocked";

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRiskColor = (riskLevel: "low" | "medium" | "high"): string => {
    switch (riskLevel) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Don't render until client is mounted and wallet is available
  if (!isMounted || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-purple-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Staking</CardTitle>
            <CardDescription>
              {!isMounted
                ? "Loading..."
                : "Connect your wallet to start staking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <p className="text-gray-400 mb-4">
              {!isMounted
                ? "Please wait..."
                : "Please connect your wallet to access staking features."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Lock className="h-10 w-10 text-purple-400" />
            Staking
          </h1>
          <p className="text-gray-400">
            Lock your OWT tokens and earn passive rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                OWT Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {owtBalance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available for staking
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Total Staked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {totalStaked.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all pools</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Rewards Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {totalRewards.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total rewards</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Pools */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">
              Staking Pools
            </h2>
            <div className="space-y-4">
              {stakingPools.map((pool) => (
                <Card
                  key={pool.id}
                  className="border-purple-500/30 bg-slate-900/50 hover:border-purple-500/60 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedPool(pool);
                    setShowStakeModal(true);
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          {pool.name}
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${getRiskColor(
                              pool.riskLevel
                            )}`}
                          >
                            {pool.riskLevel}
                          </span>
                        </CardTitle>
                        <CardDescription>{pool.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">
                          {pool.apy}%
                        </div>
                        <p className="text-xs text-gray-500">APY</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Min Stake</p>
                        <p className="text-sm font-semibold text-white">
                          {pool.minStake} OWT
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Max Stake</p>
                        <p className="text-sm font-semibold text-white">
                          {pool.maxStake} OWT
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Lock Period
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {pool.lockPeriodDays === 0
                            ? "Flexible"
                            : `${pool.lockPeriodDays}d`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPool(pool);
                            setShowStakeModal(true);
                          }}
                        >
                          Stake Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Your Stakes */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your Stakes</h2>
            <Card className="border-purple-500/30 bg-slate-900/50">
              <CardContent className="pt-6">
                {userStakes.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                    <p className="text-gray-400 mb-4">No active stakes yet</p>
                    <p className="text-sm text-gray-500">
                      Start staking to earn rewards
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userStakes.map((stake, index) => {
                      const pool = stakingPools.find(
                        (p) => p.id === stake.poolId
                      );
                      const isUnlocked = Date.now() >= stake.unlockAt;

                      return (
                        <div
                          key={index}
                          className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {pool?.name}
                              </p>
                              <p className="text-lg font-bold text-purple-400">
                                {stake.amount.toFixed(2)} OWT
                              </p>
                            </div>
                            {isUnlocked ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>

                          <div className="space-y-2 mb-3 text-xs text-gray-400">
                            <div className="flex justify-between">
                              <span>Rewards</span>
                              <span className="text-green-400 font-semibold">
                                +{stake.rewards.toFixed(2)} OWT
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unlock in</span>
                              <span>{getTimeRemaining(stake.unlockAt)}</span>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm"
                            disabled={!isUnlocked}
                            onClick={() => handleUnstake(stake)}
                          >
                            {isUnlocked ? (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Unstake
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Locked
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stake Modal */}
        {showStakeModal && selectedPool && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-2xl">{selectedPool.name}</CardTitle>
                <CardDescription>{selectedPool.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">APY</div>
                  <div className="text-3xl font-bold text-green-400">
                    {selectedPool.apy}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Amount (OWT)
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Balance: {owtBalance.toFixed(2)} OWT
                  </div>
                </div>

                {stakeAmount && (
                  <div className="bg-slate-900/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Lock Period:</span>
                      <span className="text-white font-semibold">
                        {selectedPool.lockPeriodDays === 0
                          ? "Flexible"
                          : `${selectedPool.lockPeriodDays} days`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Est. Rewards:</span>
                      <span className="text-green-400 font-semibold">
                        +
                        {calculateRewards(
                          parseFloat(stakeAmount),
                          selectedPool
                        ).toFixed(2)}{" "}
                        OWT
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total After Lock:</span>
                      <span className="text-white font-semibold">
                        {(
                          parseFloat(stakeAmount) +
                          calculateRewards(
                            parseFloat(stakeAmount),
                            selectedPool
                          )
                        ).toFixed(2)}{" "}
                        OWT
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowStakeModal(false);
                      setStakeAmount("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleStake}
                    disabled={!stakeAmount || isStaking}
                  >
                    {isStaking ? "Staking..." : "Confirm Stake"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
