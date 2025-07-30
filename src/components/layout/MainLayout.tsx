import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
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
              {/* Wrap multiple children in a single span to satisfy React.Children.only requirement */}
              <span>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation</span>
              </span>
            </Button>
            <Link to="/" className="text-2xl font-bold tracking-tight">
              Expense Tracker Pro 5000
            </Link>
          </div>
          {/* Horizontal navigation for larger screens */}
          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-6">
              <li>
                <Button variant="ghost" asChild className="text-lg px-4 py-2">
                  <Link to="/add-expense">Add Expense</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-lg px-4 py-2">
                  <Link to="/view-expenses">View Expenses</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-lg px-4 py-2">
                  <Link to="/add-income">Add Income</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-lg px-4 py-2">
                  <Link to="/view-income">View Income</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild className="text-lg px-4 py-2">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </li>
            </ul>
          </nav>
          {/* Theme and User Name Input for all screen sizes */}
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