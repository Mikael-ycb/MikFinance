import { Metadata } from "next";
import { BalanceCards } from "./_components/balance-cards";
import DashboardContent from "./_components/dashboard-content";

export const metadata: Metadata = {
  title: "MikFinance - DashBoard",
  description: "Your personal financial dashboard",
};

export default function DashboardPage() {
  return (
    <div className="p-2 space-y-4">
      <section id="header">
        <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
        <p>
          Get Insights into your spanding, track your expenses, and manage your
          money
        </p>
      </section>
      <DashboardContent />
    </div>
  );
}
