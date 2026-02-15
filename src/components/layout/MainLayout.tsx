import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Repeat, PieChart, Home } from "lucide-react";
import Sidebar from "./Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNameInput } from "@/components/UserNameInput";

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation</span>
              </span>
            </Button>
            <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Home className="h-6 w-6" />
              Expense Tracker Pro 5000
            </Link>
          </div>
          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-2">
              <li>
                <Button variant="ghost" asChild className="text-xs px-2 py-1">
                  <Link to="/add-expense">Add Expense</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-xs px-2 py-1">
                  <Link to="/view-expenses">View Expenses</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-xs px-2 py-1">
                  <Link to="/add-income">Add Income</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-xs px-2 py-1">
                  <Link to="/view-income">View Income</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-xs px-2 py-1">
                  <Link to="/budgets">
                    <PieChart className="h-3 w-3 mr-1" />
                    Budgets
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-xs px-2 py-1">
                  <Link to="/recurring">
                    <Repeat className="h-3 w-3 mr-1" />
                    Recurring
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <UserNameInput />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <MadeWithDyad />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default MainLayout;