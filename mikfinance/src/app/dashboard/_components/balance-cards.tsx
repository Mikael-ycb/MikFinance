"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBalanceSummary } from "@/features/action";
import { useQuery } from "@tanstack/react-query";
import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

export function BalanceCards() {
  const { data, error } = useQuery({
    queryKey: ["balance"],
    queryFn: () => getBalanceSummary(),
  });

  if (error) {
    return (
      <div className="w-full p-4 border border-destructive/50 text-destructive rounded-lg bg-destructive/10 text-sm">
        Failed to get balance
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <WalletIcon className="size-4 text-primary" />
            Saving
          </CardTitle>
          <CardDescription className="text-2xl font-semibold">
            {data?.savings}
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-sm">Saving For All Time</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <TrendingUpIcon className="size-4 text-primary" />
            Income
          </CardTitle>
          <CardDescription className="text-2xl font-semibold">
            {data?.totalIncome}
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-sm">Total Income For All Time</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <TrendingDownIcon className="size-4 text-primary" />
            Expenses
          </CardTitle>
          <CardDescription className="text-2xl font-semibold">
            {data?.totalExpense}
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-sm">Total Expense For All Time</CardFooter>
      </Card>
    </div>
  );
}
