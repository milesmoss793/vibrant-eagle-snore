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
import { Plus, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Budgets: React.FC = () => {
  const { budgets, setBudget, removeBudget } = useBudgets();
  const { expenseCategories } = useCategories();
  const { expenses } = useExpenses();
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  
  // New budget state
  const [selectedNewCategory, setSelectedNewCategory] = useState<string>("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const getSpentForCategory = (category: string) => {
    return expenses
      .filter(e => e.category === category && e.date >= monthStart && e.date <= monthEnd)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSaveEdit = (category: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      setBudget(category, val);
      setEditCategory(null);
      setEditAmount("");
      toast({ title: "Budget Updated", description: `Budget for ${category} set to $${val.toFixed(2)}` });
    }
  };

  const handleAddBudget = () => {
    const val = parseFloat(newBudgetAmount);
    if (selectedNewCategory && !isNaN(val) && val >= 0) {
      setBudget(selectedNewCategory, val);
      setSelectedNewCategory("");
      setNewBudgetAmount("");
      toast({ 
        title: "Budget Added", 
        description: `Monthly limit for ${selectedNewCategory} set to $${val.toFixed(2)}` 
      });
    } else if (isNaN(val) || val < 0) {
      toast({ 
        title: "Invalid Amount", 
        description: "Please enter a valid positive number for the budget limit.",
        variant: "destructive"
      });
    }
  };

  const availableCategories = expenseCategories.filter(
    (cat) => !budgets.some((b) => b.category === cat)
  );

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Monthly Budgets</h1>
          <p className="text-muted-foreground">Set spending limits for specific categories.</p>
        </div>
        
        {availableCategories.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto bg-muted/30 p-3 rounded-lg border border-dashed">
            <Select value={selectedNewCategory} onValueChange={setSelectedNewCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-[120px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input 
                type="number" 
                placeholder="Limit" 
                className="pl-6"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleAddBudget} disabled={!selectedNewCategory || !newBudgetAmount} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        )}
      </div>

      {budgets.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <LayoutGrid className="h-12 w-12 text-muted-foreground opacity-20" />
            <div className="space-y-1">
              <p className="text-lg font-medium">No budgets set</p>
              <p className="text-sm text-muted-foreground">Select a category and set a limit above to start tracking.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const category = budget.category;
            const spent = getSpentForCategory(category);
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOver = spent > budget.amount;

            return (
              <Card key={category} className={isOver ? "border-destructive shadow-sm" : "shadow-sm"}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{category}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      ${budget.amount.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {editCategory === category ? (
                    <div className="flex gap-2 pt-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(category)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditCategory(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => {
                        setEditCategory(category);
                        setEditAmount(budget.amount.toString());
                      }}>
                        Edit Limit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeBudget(category)}>Remove</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budgets;