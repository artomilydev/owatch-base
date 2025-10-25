import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Points - O'Watch.ID",
  description: "Convert your points to OWT tokens",
};

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
