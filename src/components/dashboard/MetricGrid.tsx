import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  PieChart, 
  Maximize2, 
  Minimize2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricGridProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    savingsRate: number;
    comparison: {
      income: { diff: number; percent: number };
      expenses: { diff: number; percent: number };
    };
  };
}

const MetricGrid: React.FC<MetricGridProps> = ({ stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const metrics = [
    {
      title: "Total Income",
      value: stats.totalIncome,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      comparison: stats.comparison.income,
      type: "income"
    },
    {
      title: "Total Expenses",
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      comparison: stats.comparison.expenses,
      type: "expense"
    },
    {
      title: "Net Balance",
      value: stats.netBalance,
      icon: ArrowRightLeft,
      color: stats.netBalance >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: "bg-blue-100",
      type: "balance"
    },
    {
      title: "Savings Rate",
      value: stats.savingsRate,
      icon: PieChart,
      color: "text-primary",
      bgColor: "bg-primary/10",
      type: "savings"
    }
  ];

  return (
    <div className="relative group">
      <div 
        className={cn(
          "grid gap-4 transition-all duration-500 ease-in-out cursor-pointer",
          isExpanded 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
            : "grid-cols-2 max-w-3xl mx-auto"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {metrics.map((m, i) => (
          <Card key={i} className={cn(
            "transition-all duration-300 hover:shadow-md border-primary/10",
            !isExpanded && "p-2"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between space-y-0",
              isExpanded ? "pb-2" : "p-2 pb-1"
            )}>
              <CardTitle className={cn(
                "font-medium truncate",
                isExpanded ? "text-sm" : "text-[10px] uppercase tracking-wider opacity-70"
              )}>
                {m.title}
              </CardTitle>
              <m.icon className={cn(
                m.color,
                isExpanded ? "h-4 w-4" : "h-3 w-3"
              )} />
            </CardHeader>
            <CardContent className={isExpanded ? "" : "p-2 pt-0"}>
              <div className={cn(
                "font-bold truncate",
                isExpanded ? "text-2xl" : "text-lg",
                m.type === 'income' && "text-green-600",
                m.type === 'expense' && "text-red-600",
                m.type === 'balance' && (stats.netBalance >= 0 ? "text-blue-600" : "text-red-600")
              )}>
                {m.type === 'savings' ? `${m.value.toFixed(1)}%` : `$${m.value.toFixed(2)}`}
              </div>
              
              {isExpanded && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  {m.comparison && (
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={m.type === 'income' 
                          ? (m.comparison.diff >= 0 ? "default" : "destructive")
                          : (m.comparison.diff <= 0 ? "default" : "destructive")
                        } 
                        className="text-[10px] px-1 py-0"
                      >
                        {m.comparison.diff >= 0 ? "+" : ""}{m.comparison.percent.toFixed(0)}%
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">vs last month</span>
                    </div>
                  )}
                  {m.type === 'savings' && (
                    <Progress value={Math.max(0, Math.min(100, m.value))} className="h-1.5 mt-2" />
                  )}
                  {m.type === 'balance' && (
                    <p className="text-[10px] text-muted-foreground">Total savings/loss</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center rounded-full shadow-sm border">
          {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
        </Badge>
      </div>
    </div>
  );
};

export default MetricGrid;