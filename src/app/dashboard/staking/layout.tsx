import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staking - O'Watch.ID",
  description: "Stake your OWT tokens and earn rewards",
};

export default function StakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
