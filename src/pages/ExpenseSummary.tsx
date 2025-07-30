import React, { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
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
  const [timePeriod, setTimePeriod] = useState<"month" | "3months" | "year" | "all">("month");

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-6xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Expense Summary</CardTitle>
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
          <CardContent>
            <ExpenseCharts expenses={expenses} timePeriod={timePeriod} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseSummary;