import React, { useState } from "react";
import { useBudgets } from "@/context/BudgetContext";
import { useCategories } from "@/context/CategoryContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useExpenses } from "@/context/ExpenseContext";
import { startOfMonth, endOfMonth } from "date-fns";
import { toast } from "@/components/ui/use-toast";

const Budgets: React.FC = () => {
  const { budgets, setBudget, removeBudget } = useBudgets();
  const { expenseCategories } = useCategories();
  const { expenses } = useExpenses();
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const getSpentForCategory = (category: string) => {
    return expenses
      .filter(e => e.category === category && e.date >= monthStart && e.date <= monthEnd)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSave = (category: string) => {
    const val = parseFloat(amount);
    if (!isNaN(val) && val >= 0) {
      setBudget(category, val);
      setEditCategory(null);
      setAmount("");
      toast({ title: "Budget Updated", description: `Budget for ${category} set to $${val.toFixed(2)}` });
    }
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Monthly Budgets</h1>
        <p className="text-muted-foreground">Set spending limits for your categories and track your progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenseCategories.map((category) => {
          const budget = budgets.find((b) => b.category === category);
          const spent = getSpentForCategory(category);
          const percentage = budget ? Math.min((spent / budget.amount) * 100, 100) : 0;
          const isOver = budget && spent > budget.amount;

          return (
            <Card key={category} className={isOver ? "border-destructive" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{category}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {budget ? `$${budget.amount.toFixed(2)}` : "No budget set"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budget ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${spent.toFixed(2)}</span>
                      <span className={isOver ? "text-destructive font-bold" : ""}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={percentage} className={isOver ? "bg-destructive/20" : ""} />
                    {isOver && <p className="text-xs text-destructive font-medium">Over budget by ${(spent - budget.amount).toFixed(2)}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Set a limit to start tracking.</p>
                )}

                {editCategory === category ? (
                  <div className="flex gap-2 pt-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleSave(category)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditCategory(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      setEditCategory(category);
                      setAmount(budget ? budget.amount.toString() : "");
                    }}>
                      {budget ? "Edit Budget" : "Set Budget"}
                    </Button>
                    {budget && (
                      <Button variant="ghost" size="sm" onClick={() => removeBudget(category)}>Remove</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;