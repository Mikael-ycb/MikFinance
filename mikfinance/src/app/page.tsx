import { Button } from "@/components/ui/button";
import { WalletMinimalIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MikFinance",
  description: "Your persoanl finance app with AI",
};

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <WalletMinimalIcon className="text-emerald-700 size-20" />
      <h1 className="text-emerald-700 text-4xl font-bold">
        Welcome to MikFinance
      </h1>
      <p className="mt-2 text-lg">Your persoanl finance app with AI</p>
      <Link href="/dashboard">
        <Button className="mt-2" size="lg">
          Get Started
        </Button>
      </Link>
    </main>
  );
}
