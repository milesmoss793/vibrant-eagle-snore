import React from "react";
import { Link } from "react-router-dom";
import { Home, DollarSign, TrendingUp, PlusCircle, Wallet, LayoutDashboard } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Add Expense", path: "/add-expense", icon: PlusCircle },
    { name: "View Expenses", path: "/view-expenses", icon: DollarSign },
    { name: "Add Income", path: "/add-income", icon: Wallet },
    { name: "View Income", path: "/view-income", icon: TrendingUp },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-4 flex flex-col">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-primary">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-lg"
              asChild
              onClick={onClose}
            >
              <Link to={item.path}>
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto space-y-4 border-t pt-4">
          <p className="text-sm text-muted-foreground">Navigation options.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;