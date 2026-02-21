import React from "react";
import { Link } from "react-router-dom";
import { Target, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals } from "@/context/GoalContext";

const GoalProgress: React.FC = () => {
  const { goals } = useGoals();

  if (goals.length === 0) return null;

  // Show top 2 goals by progress percentage
  const topGoals = [...goals]
    .map(g => ({ ...g, percent: (g.currentAmount / g.targetAmount) * 100 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Target className="h-4 w-4 text-primary" />
          Savings Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topGoals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium truncate max-w-[120px]">{goal.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {goal.percent >= 100 ? (
                  <span className="flex items-center gap-1 text-green-600 font-bold">
                    <Trophy className="h-3 w-3" /> Done
                  </span>
                ) : (
                  `$${goal.currentAmount.toFixed(0)} / $${goal.targetAmount.toFixed(0)}`
                )}
              </span>
            </div>
            <Progress value={goal.percent} className="h-1.5" />
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-[10px] h-7" asChild>
          <Link to="/goals">Manage All Goals</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoalProgress;