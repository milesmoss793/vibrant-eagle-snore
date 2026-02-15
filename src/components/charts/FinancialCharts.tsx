import React from "react";
import {
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Expense } from "@/context/ExpenseContext";
import { Income } from "@/context/IncomeContext";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isBefore
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialChartsProps {
  expenses: Expense[];
  income: Income[];
  timePeriod: "month" | "3months" | "6months" | "year" | "all";
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

  // Determine granularity and date range
  const isDaily = timePeriod === "month";
  const now = new Date();
  let startDateForInterval = startOfMonth(now);
  let endDateForInterval = endOfMonth(now);

  if (timePeriod === "3months") {
    startDateForInterval = startOfMonth(subMonths(now, 2));
  } else if (timePeriod === "6months") {
    startDateForInterval = startOfMonth(subMonths(now, 5));
  } else if (timePeriod === "year") {
    startDateForInterval = startOfYear(now);
  } else if (timePeriod === "all" && (expenses.length > 0 || income.length > 0)) {
    const allDates = [...expenses.map(e => e.date), ...income.map(i => i.date)];
    if (allDates.length > 0) {
      startDateForInterval = startOfMonth(new Date(Math.min(...allDates.map(d => d.getTime()))));
      endDateForInterval = endOfMonth(new Date(Math.max(...allDates.map(d => d.getTime()))));
    }
  }

  // Calculate starting balance (carry-over from before the start date)
  const initialIncome = income
    .filter(i => isBefore(i.date, startDateForInterval))
    .reduce((sum, i) => sum + i.amount, 0);
  const initialExpenses = expenses
    .filter(e => isBefore(e.date, startDateForInterval))
    .reduce((sum, e) => sum + e.amount, 0);
  
  let runningBalance = initialIncome - initialExpenses;
  let runningExpenses = 0;
  let runningIncome = 0;

  const intervals = isDaily 
    ? eachDayOfInterval({ start: startDateForInterval, end: endDateForInterval })
    : eachMonthOfInterval({ start: startDateForInterval, end: endDateForInterval });

  const trendData = intervals.map(date => {
    const label = isDaily ? format(date, "MMM dd") : format(date, "MMM yyyy");
    
    const periodExpenses = expenses.filter(e => 
      isDaily ? isSameDay(e.date, date) : isSameMonth(e.date, date)
    ).reduce((sum, e) => sum + e.amount, 0);

    const periodIncome = income.filter(i => 
      isDaily ? isSameDay(i.date, date) : isSameMonth(i.date, date)
    ).reduce((sum, i) => sum + i.amount, 0);

    runningBalance += (periodIncome - periodExpenses);
    
    if (isDaily) {
      // Cumulative for the month
      runningExpenses += periodExpenses;
      runningIncome += periodIncome;
    } else {
      // Monthly totals (resets every month)
      runningExpenses = periodExpenses;
      runningIncome = periodIncome;
    }

    return {
      name: label,
      expenses: runningExpenses,
      income: runningIncome,
      netBalance: runningBalance
    };
  });

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

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{isDaily ? "Daily" : "Monthly"} Financial Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="expenses" stroke="#FF8042" name={isDaily ? "Cumulative Expenses" : "Monthly Expenses"} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="income" stroke="#00C49F" name={isDaily ? "Cumulative Income" : "Monthly Income"} activeDot={{ r: 8 }} />
              <Line type="stepAfter" dataKey="netBalance" stroke="#0088FE" name="Net Balance (Total)" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;