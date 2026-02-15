import React, { useState, useMemo } from "react";
import { useExpenses, Expense } from "@/context/ExpenseContext";
import { useIncome, Income } from "@/context/IncomeContext";
import { useBudgets } from "@/context/BudgetContext";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Dashboard: React.FC = () => {
  const { expenses } = useExpenses();
  const { income } = useIncome();
  const { budgets } = useBudgets();
  const [timePeriod, setTimePeriod] = useState<"month" | "3months" | "6months" | "year" | "all">("month");

  const filterDataByTimePeriod = <T extends { date: Date }>(data: T[], period: string): T[] => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (period === "month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === "3months") {
      startDate = startOfMonth(subMonths(now, 2));
      endDate = endOfMonth(now);
    } else if (period === "6months") {
      startDate = startOfMonth(subMonths(now, 5));
      endDate = endOfMonth(now);
    } else if (period === "year") {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    } else {
      return data;
    }

    return data.filter((item) => item.date >= startDate! && item.date <= endDate!);
  };

  const filteredExpenses = filterDataByTimePeriod(expenses, timePeriod);
  const filteredIncome = filterDataByTimePeriod(income, timePeriod);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = filteredIncome.reduce((sum, entry) => sum + entry.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Budget Alerts (Current Month Only)
  const budgetAlerts = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return budgets.map(budget => {
      const spent = expenses
        .filter(e => e.category === budget.category && e.date >= monthStart && e.date <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0);
      
      if (spent > budget.amount) {
        return { category: budget.category, overBy: spent - budget.amount };
      }
      return null;
    }).filter(Boolean);
  }, [budgets, expenses]);

  // Recent Transactions
  const recentTransactions = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...income.map(i => ({ ...i, type: 'income' as const }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    return all.slice(0, 5);
  }, [expenses, income]);

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-6xl space-y-6">
        {budgetAlerts.length > 0 && (
          <div className="space-y-2">
            {budgetAlerts.map((alert: any) => (
              <Alert key={alert.category} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Budget Exceeded!</AlertTitle>
                <AlertDescription>
                  You've spent ${alert.overBy.toFixed(2)} more than your budget for <strong>{alert.category}</strong> this month.
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Financial Overview</CardTitle>
            <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card className="p-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${netBalance.toFixed(2)}
                </p>
              </Card>
            </div>

            <FinancialCharts expenses={filteredExpenses} income={filteredIncome} timePeriod={timePeriod as any} />

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No transactions recorded yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category/Source</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{format(t.date, "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={t.type === 'expense' ? 'destructive' : 'default'}>
                              {t.type === 'expense' ? 'Expense' : 'Income'}
                            </Badge>
                          </TableCell>
                          <TableCell>{'category' in t ? t.category : t.source}</TableCell>
                          <TableCell className={`text-right font-medium ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                            {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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