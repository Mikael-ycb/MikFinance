import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fragment } from "react/jsx-runtime";

export default function TransactionTable() {
  return (
    <Fragment>
      <Card className="w-full gap-2">
        <CardHeader className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <CardTitle>Recent Transaction</CardTitle>
            <CardDescription>Your latest financial activitys</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Fragment>
  );
}
