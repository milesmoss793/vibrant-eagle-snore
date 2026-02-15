import React, { useState } from "react";
import { useCategories } from "@/context/CategoryContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
      toast({ title: "Category Added", description: `Added "${newExpenseCat}" to expenses.` });
    }
  };

  const handleAddIncomeSrc = () => {
    if (newIncomeSrc.trim()) {
      addIncomeSource(newIncomeSrc.trim());
      setNewIncomeSrc("");
      toast({ title: "Source Added", description: `Added "${newIncomeSrc}" to income.` });
    }
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
        </div>
      </div>
    </div>
  );
};

export default Settings;