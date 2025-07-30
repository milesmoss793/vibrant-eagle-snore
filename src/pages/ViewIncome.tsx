import React from "react";
import { useIncome } from "@/context/IncomeContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ViewIncome: React.FC = () => {
  const { income } = useIncome();

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center">All Income</CardTitle>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <p className="text-center text-muted-foreground">No income recorded yet. Add some!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {income.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(entry.date, "PPP")}</TableCell>
                      <TableCell>{entry.source}</TableCell>
                      <TableCell className="text-right">${entry.amount.toFixed(2)}</TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewIncome;