import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Expense Tracker</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Manage your finances with ease.
        </p>
        <div className="flex space-x-4 justify-center">
          <Button asChild size="lg">
            <Link to="/add-expense">Add New Expense</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/view-expenses">View All Expenses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;