import React, { useState } from "react";
import { useCategories } from "@/context/CategoryContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Download, Upload, Database } from "lucide-react";
import { toast } from "sonner";

const Settings: React.FC = () => {
  const { 
    expenseCategories, 
    incomeSources, 
    addExpenseCategory, 
    removeExpenseCategory, 
    addIncomeSource, 
    removeIncomeSource 
  } = useCategories();

  const [newExpenseCat, setNewExpenseCat] = useState("");
  const [newIncomeSrc, setNewIncomeSrc] = useState("");

  const handleAddExpenseCat = () => {
    if (newExpenseCat.trim()) {
      addExpenseCategory(newExpenseCat.trim());
      setNewExpenseCat("");
      toast.success(`Added "${newExpenseCat}" to expenses.`);
    }
  };

  const handleAddIncomeSrc = () => {
    if (newIncomeSrc.trim()) {
      addIncomeSource(newIncomeSrc.trim());
      setNewIncomeSrc("");
      toast.success(`Added "${newIncomeSrc}" to income.`);
    }
  };

  const handleExportData = () => {
    const data = {
      expenses: localStorage.getItem('expenseTrackerExpenses'),
      income: localStorage.getItem('expenseTrackerIncome'),
      categories: localStorage.getItem('expenseTracker_expenseCategories'),
      sources: localStorage.getItem('expenseTracker_incomeSources'),
      budgets: localStorage.getItem('expenseTracker_budgets'),
      recurring: localStorage.getItem('expenseTracker_recurringTransactions'),
      goals: localStorage.getItem('expenseTracker_goals'),
      userName: localStorage.getItem('expenseTrackerUserName'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.expenses) localStorage.setItem('expenseTrackerExpenses', data.expenses);
        if (data.income) localStorage.setItem('expenseTrackerIncome', data.income);
        if (data.categories) localStorage.setItem('expenseTracker_expenseCategories', data.categories);
        if (data.sources) localStorage.setItem('expenseTracker_incomeSources', data.sources);
        if (data.budgets) localStorage.setItem('expenseTracker_budgets', data.budgets);
        if (data.recurring) localStorage.setItem('expenseTracker_recurringTransactions', data.recurring);
        if (data.goals) localStorage.setItem('expenseTracker_goals', data.goals);
        if (data.userName) localStorage.setItem('expenseTrackerUserName', data.userName);
        
        toast.success("Data imported successfully! Refreshing page...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error("Failed to import data. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Manage categories for your spending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="New category..." 
                  value={newExpenseCat} 
                  onChange={(e) => setNewExpenseCat(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddExpenseCat()}
                />
                <Button size="icon" onClick={handleAddExpenseCat}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                    {cat}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0 hover:bg-transparent" 
                      onClick={() => removeExpenseCategory(cat)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Income Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>Manage sources for your earnings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="New source..." 
                  value={newIncomeSrc} 
                  onChange={(e) => setNewIncomeSrc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIncomeSrc()}
                />
                <Button size="icon" onClick={handleAddIncomeSrc}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {incomeSources.map((src) => (
                  <Badge key={src} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                    {src}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0 hover:bg-transparent" 
                      onClick={() => removeIncomeSource(src)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Backup your data or restore from a previous backup.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data (JSON)
              </Button>
              <div className="flex-1 relative">
                <Input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  id="import-file" 
                  onChange={handleImportData}
                />
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data (JSON)
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;