import React from "react";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetSummaryProps {
  budgets: any[];
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgets }) => {
  if (budgets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Budget Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((b) => (
          <div key={b.category} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{b.category}</span>
              <span>${b.spent.toFixed(0)} / ${b.amount.toFixed(0)}</span>
            </div>
            <Progress value={b.percent} className={`h-1.5 ${b.percent > 100 ? 'bg-destructive/20' : ''}`} />
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link to="/budgets">View All Budgets</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;