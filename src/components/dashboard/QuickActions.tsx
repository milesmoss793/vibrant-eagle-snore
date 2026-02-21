import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button asChild className="w-full h-20 flex flex-col gap-1">
          <Link to="/add-expense">
            <PlusCircle className="h-5 w-5" />
            <span>Add Expense</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-20 flex flex-col gap-1">
          <Link to="/add-income">
            <Wallet className="h-5 w-5" />
            <span>Add Income</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;