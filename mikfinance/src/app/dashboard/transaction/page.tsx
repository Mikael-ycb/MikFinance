import { Metadata } from "next";
import Transaction from "./_components/transaction";

export const metadata: Metadata = {
  title: "MikFinance - Transaction",
  description: "View and manage your finance transactions",
};

export default function TransactionPage() {
  return (
    <div className="p-2 space-y-4">
      <section id="header">
        <h1 className="text-4xl font-bold text-primary">Transaction</h1>
        <p>View and manage your Finance transactions.</p>
      </section>
      <section id="content">
        <Transaction />
      </section>
    </div>
  );
}
