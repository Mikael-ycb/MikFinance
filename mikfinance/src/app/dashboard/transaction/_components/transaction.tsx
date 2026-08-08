import TransactionTable from "./transaction-table";

export default function Transaction() {
  return (
    <div className="grid grid-cols-1 md:grid-cols=[2fr_1fr] gap-8">
      <TransactionTable />
    </div>
  );
}
