import React, { useState, useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { useIncome } from "@/context/IncomeContext";
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
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, isSameMonth } from "date-fns";
import { AlertCircle, TrendingDown, History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "@/utils/icons";
import MetricGrid from "@/components/dashboard/MetricGrid";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import QuickActions from "@/components/dashboard/QuickActions";
import BudgetSummary from "@/components/dashboard/BudgetSummary";
import GoalProgress from "@/components/dashboard/GoalProgress";

const Dashboard: React.FC = () => {
  const { expenses } = useExpenses();
  const { income } = useIncome();
  const { budgets } = useBudgets();
  const [timePeriod, setTimePeriod] = useState<"month" | "3months" | "6months" | "year" | "all">("month");

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (timePeriod === "month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (timePeriod === "3months") {
      startDate = startOfMonth(subMonths(now, 2));
      endDate = endOfMonth(now);
    } else if (timePeriod === "6months") {
      startDate = startOfMonth(subMonths(now, 5));
      endDate = endOfMonth(now);
    } else if (timePeriod === "year") {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    }

    const filterFn = (item: { date: Date }) => 
      !startDate || (item.date >= startDate && item.date <= endDate!);

    return {
      expenses: expenses.filter(filterFn),
      income: income.filter(filterFn)
    };
  }, [expenses, income, timePeriod]);

  const stats = useMemo(() => {
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = filteredData.income.reduce((sum, i) => sum + i.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

    // All-time Net Worth
    const allTimeExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const allTimeIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const netWorth = allTimeIncome - allTimeExpenses;

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const thisMonthExp = expenses.filter(e => isSameMonth(e.date, now)).reduce((sum, e) => sum + e.amount, 0);
    const lastMonthExp = expenses.filter(e => isSameMonth(e.date, lastMonth)).reduce((sum, e) => sum + e.amount, 0);
    const thisMonthInc = income.filter(i => isSameMonth(i.date, now)).reduce((sum, i) => sum + i.amount, 0);
    const lastMonthInc = income.filter(i => isSameMonth(i.date, lastMonth)).reduce((sum, i) => sum + i.amount, 0);

    return {
      totalExpenses,
      totalIncome,
      netBalance,
      savingsRate,
      netWorth,
      comparison: {
        expenses: { diff: thisMonthExp - lastMonthExp, percent: lastMonthExp ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0 },
        income: { diff: thisMonthInc - lastMonthInc, percent: lastMonthInc ? ((thisMonthInc - lastMonthInc) / lastMonthInc) * 100 : 0 }
      }
    };
  }, [filteredData, expenses, income]);

  const budgetAlerts = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return budgets.map(budget => {
      const spent = expenses
        .filter(e => e.category === budget.category && e.date >= monthStart && e.date <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0);
      if (spent > budget.amount) return { category: budget.category, overBy: spent - budget.amount };
      return null;
    }).filter(Boolean);
  }, [budgets, expenses]);

  const budgetSummaryData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return budgets.map(budget => {
      const spent = expenses
        .filter(e => e.category === budget.category && e.date >= monthStart && e.date <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...budget, spent, percent: (spent / budget.amount) * 100 };
    }).sort((a, b) => b.percent - a.percent).slice(0, 3);
  }, [budgets, expenses]);

  const topCategories = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredData.expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories).sort(([, a], [, b]) => b - a).slice(0, 5);
  }, [filteredData.expenses]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...income.map(i => ({ ...i, type: 'income' as const }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    return all.slice(0, 6);
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <WelcomeHeader />
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
        </div>

        <MetricGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FinancialCharts expenses={filteredData.expenses} income={filteredData.income} timePeriod={timePeriod as any} />
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" asChild>
                  <Link to="/view-expenses">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions recorded yet.</p>
                ) : (
                  <div className="space-y-1">
                    {recentTransactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-full transition-colors ${
                            t.type === 'expense' 
                              ? 'bg-red-50 text-red-600 group-hover:bg-red-100' 
                              : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                          }`}>
                            {getCategoryIcon('category' in t ? t.category : t.source)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{'category' in t ? t.category : t.source}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {format(t.date, "MMM dd")} • {t.description || "No description"}
                            </span>
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <QuickActions />
            <GoalProgress />
            <BudgetSummary budgets={budgetSummaryData} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Top Spending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No expenses recorded for this period.</p>
                ) : (
                  topCategories.map(([category, amount]) => (
                    <div key={category} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="opacity-70">{getCategoryIcon(category)}</span>
                          <span className="font-medium">{category}</span>
                        </div>
                        <span className="font-semibold">${amount.toFixed(0)}</span>
                      </div>
                      <Progress value={(amount / stats.totalExpenses) * 100} className="h-1" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;