import React, { useState, useMemo } from "react";
import { useExpenses, Expense } from "@/context/ExpenseContext";
import { useIncome, Income } from "@/context/IncomeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FinancialCharts from "@/components/charts/FinancialCharts";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Dashboard: React.FC = () => {
  const { expenses } = useExpenses();
  const { income } = useIncome();
  const [timePeriod, setTimePeriod] = useState<"month" | "3months" | "year" | "all">("month");

  // Helper function to filter data based on time period
  const filterDataByTimePeriod = <T extends { date: Date }>(data: T[], period: "month" | "3months" | "year" | "all"): T[] => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (period === "month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === "3months") {
      startDate = startOfMonth(subMonths(now, 2));
      endDate = endOfMonth(now);
    } else if (period === "year") {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    } else {
      return data; // "all" or default, no date filtering
    }

    return data.filter(
      (item) =>
        item.date >= startDate! && item.date <= endDate!
    );
  };

  const filteredExpenses = filterDataByTimePeriod(expenses, timePeriod);
  const filteredIncome = filterDataByTimePeriod(income, timePeriod);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = filteredIncome.reduce((sum, entry) => sum + entry.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Combine and sort recent transactions
  const recentTransactions = useMemo(() => {
    const allTransactions = [
      ...filteredExpenses.map(exp => ({ ...exp, type: 'expense', categoryOrSource: exp.category })),
      ...filteredIncome.map(inc => ({ ...inc, type: 'income', categoryOrSource: inc.source }))
    ];

    return allTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
      .slice(0, 5); // Get top 5 recent transactions
  }, [filteredExpenses, filteredIncome]);

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-6xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Financial Dashboard</CardTitle>
            <Select value={timePeriod} onValueChange={(value: "month" | "3months" | "year" | "all") => setTimePeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card className="p-4">
                <CardTitle className="text-lg font-semibold">Total Income</CardTitle>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-lg font-semibold">Total Expenses</CardTitle>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-lg font-semibold">Net Balance</CardTitle>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${netBalance.toFixed(2)}
                </p>
              </Card>
            </div>
            <FinancialCharts expenses={filteredExpenses} income={filteredIncome} timePeriod={timePeriod} />

            {/* New Recent Transactions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent transactions for the selected period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category/Source</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{format(transaction.date, "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === 'expense' ? 'destructive' : 'default'}>
                                {transaction.type === 'expense' ? 'Expense' : 'Income'}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.categoryOrSource}</TableCell>
                            <TableCell className={`text-right font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                              {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>{transaction.description || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;