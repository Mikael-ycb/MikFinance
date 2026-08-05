import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MikFinance - DashBoard",
  description: "Your personal financial dashboard",
};

export default function DashboardPage() {
  return (
    <div className=" space-y-4">
      <section id="header"></section>
      <section id="content"></section>
    </div>
  );
}
