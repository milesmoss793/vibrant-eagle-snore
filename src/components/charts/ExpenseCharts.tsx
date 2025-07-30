import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Expense } from "@/context/ExpenseContext";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseChartsProps {
  expenses: Expense[];
  timePeriod: "month" | "3months" | "year" | "all";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c", "#f7b731"];

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses, timePeriod }) => {
  const filterExpensesByTimePeriod = (allExpenses: Expense[]) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (timePeriod === "month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (timePeriod === "3months") {
      startDate = startOfMonth(subMonths(now, 2)); // Current month + 2 previous months
      endDate = endOfMonth(now);
    } else if (timePeriod === "year") {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    } else {
      // "all" or default, no date filtering
      return allExpenses;
    }

    return allExpenses.filter(
      (expense) =>
        expense.date >= startDate! && expense.date <= endDate!
    );
  };

  const filteredExpenses = filterExpensesByTimePeriod(expenses);

  // Data for Category Distribution (Pie Chart)
  const categoryData = filteredExpenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Data for Monthly Category Trends (Line Chart)
  const monthlyTrendsMap = new Map<string, { [key: string]: number }>();
  filteredExpenses.forEach(expense => {
    const monthYear = format(expense.date, "MMM yyyy");
    if (!monthlyTrendsMap.has(monthYear)) {
      monthlyTrendsMap.set(monthYear, { month: monthYear });
    }
    const monthData = monthlyTrendsMap.get(monthYear)!;
    monthData[expense.category] = (monthData[expense.category] || 0) + expense.amount;
  });
  const monthlyTrendsData = Array.from(monthlyTrendsMap.values()).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  const allCategories = Array.from(new Set(filteredExpenses.map(e => e.category)));

  if (filteredExpenses.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No expenses recorded for the selected period.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trends by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyTrendsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              {allCategories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCharts;