import React, { useState } from "react";
import { useGoals, Goal } from "@/context/GoalContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Target, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Goals: React.FC = () => {
  const { goals, addGoal, deleteGoal, contributeToGoal } = useGoals();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", current: "0" });
  const [contribution, setContribution] = useState<{ id: string; amount: string } | null>(null);

  const handleAddGoal = () => {
    const target = parseFloat(newGoal.target);
    const current = parseFloat(newGoal.current);
    if (newGoal.name && !isNaN(target) && target > 0) {
      addGoal({
        name: newGoal.name,
        targetAmount: target,
        currentAmount: isNaN(current) ? 0 : current,
      });
      setNewGoal({ name: "", target: "", current: "0" });
      setIsAddOpen(false);
      toast.success("Goal added successfully!");
    }
  };

  const handleContribute = () => {
    if (contribution && !isNaN(parseFloat(contribution.amount))) {
      contributeToGoal(contribution.id, parseFloat(contribution.amount));
      setContribution(null);
      toast.success("Contribution added!");
    }
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground">Track your progress towards big purchases or savings targets.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input placeholder="e.g., New Car, Vacation" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Amount</Label>
                  <Input type="number" placeholder="0.00" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Starting Amount</Label>
                  <Input type="number" placeholder="0.00" value={newGoal.current} onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <Card className="col-span-full py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <Target className="h-12 w-12 text-muted-foreground opacity-20" />
              <div className="space-y-1">
                <p className="text-lg font-medium">No goals yet</p>
                <p className="text-sm text-muted-foreground">Start by adding your first financial target.</p>
              </div>
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>Add Goal</Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>Target: ${goal.targetAmount.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">${goal.currentAmount.toFixed(2)} saved</span>
                      <span className="text-muted-foreground">{percent.toFixed(0)}%</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                    {remaining > 0 ? (
                      <p className="text-xs text-muted-foreground">${remaining.toFixed(2)} more to go</p>
                    ) : (
                      <Badge className="bg-green-500">Goal Achieved!</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={contribution?.id === goal.id} onOpenChange={(open) => !open && setContribution(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setContribution({ id: goal.id, amount: "" })}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Contribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contribute to {goal.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Label>Amount to add</Label>
                          <Input 
                            type="number" 
                            autoFocus
                            placeholder="0.00" 
                            value={contribution?.amount || ""} 
                            onChange={(e) => setContribution({ ...contribution!, amount: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleContribute()}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleContribute}>Add Funds</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Goals;