import React, { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { useIncome } from "@/context/IncomeContext"; // New import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExpenseCharts from "@/components/charts/ExpenseCharts";

const ExpenseSummary: React.FC = () => {
  const { expenses } = useExpenses();
  const { income } = useIncome(); // Use income context
  const [timePeriod, setTimePeriod] = useState<"month" | "3months" | "year" | "all">("month");

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-6xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Financial Summary</CardTitle>
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
            <ExpenseCharts expenses={expenses} timePeriod={timePeriod} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseSummary;