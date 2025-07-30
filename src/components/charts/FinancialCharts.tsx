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
import { Income } from "@/context/IncomeContext"; // Import Income type
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialChartsProps {
  expenses: Expense[];
  income: Income[]; // Add income prop
  timePeriod: "month" | "3months" | "year" | "all";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c", "#f7b731"];

const FinancialCharts: React.FC<FinancialChartsProps> = ({ expenses, income, timePeriod }) => {
  // Data for Category Distribution (Pie Chart) - Expenses
  const expenseCategoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Data for Source Distribution (Pie Chart) - Income
  const incomeSourceData = income.reduce((acc, entry) => {
    const existing = acc.find((item) => item.name === entry.source);
    if (existing) {
      existing.value += entry.amount;
    } else {
      acc.push({ name: entry.source, value: entry.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Data for Monthly Trends (Line Chart) - Expenses & Income & Net Balance
  const monthlyDataMap = new Map<string, { month: string; expenses: number; income: number; netBalance: number }>();

  // Populate with all months in the interval for consistent data points
  const now = new Date();
  let startDateForInterval = startOfMonth(now);
  let endDateForInterval = endOfMonth(now);

  if (timePeriod === "3months") {
    startDateForInterval = startOfMonth(subMonths(now, 2));
  } else if (timePeriod === "year") {
    startDateForInterval = startOfYear(now);
  } else if (timePeriod === "all" && (expenses.length > 0 || income.length > 0)) {
    const allDates = [...expenses.map(e => e.date), ...income.map(i => i.date)];
    if (allDates.length > 0) {
      startDateForInterval = startOfMonth(new Date(Math.min(...allDates.map(d => d.getTime()))));
      endDateForInterval = endOfMonth(new Date(Math.max(...allDates.map(d => d.getTime()))));
    }
  }

  if (timePeriod !== "all" || (expenses.length > 0 || income.length > 0)) {
    const months = eachMonthOfInterval({ start: startDateForInterval, end: endDateForInterval });
    months.forEach(month => {
      const monthYear = format(month, "MMM yyyy");
      monthlyDataMap.set(monthYear, { month: monthYear, expenses: 0, income: 0, netBalance: 0 });
    });
  }

  expenses.forEach(expense => {
    const monthYear = format(expense.date, "MMM yyyy");
    const data = monthlyDataMap.get(monthYear);
    if (data) {
      data.expenses += expense.amount;
      data.netBalance -= expense.amount;
    }
  });

  income.forEach(entry => {
    const monthYear = format(entry.date, "MMM yyyy");
    const data = monthlyDataMap.get(monthYear);
    if (data) {
      data.income += entry.amount;
      data.netBalance += entry.amount;
    }
  });

  const monthlyFinancialData = Array.from(monthlyDataMap.values()).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  const allExpenseCategories = Array.from(new Set(expenses.map(e => e.category)));
  const allIncomeSources = Array.from(new Set(income.map(i => i.source)));

  const hasData = expenses.length > 0 || income.length > 0;

  if (!hasData) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No financial data recorded for the selected period.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`exp-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {income.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {incomeSourceData.map((entry, index) => (
                    <Cell key={`inc-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {(expenses.length > 0 || income.length > 0) && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Financial Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyFinancialData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="expenses" stroke="#FF8042" name="Expenses" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="income" stroke="#00C49F" name="Income" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="netBalance" stroke="#0088FE" name="Net Balance" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialCharts;