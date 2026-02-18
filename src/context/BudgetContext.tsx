import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Budget {
  category: string;
  amount: number;
}

interface BudgetContextType {
  budgets: Budget[];
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'expenseTracker_budgets';

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load budgets:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const setBudget = (category: string, amount: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) {
        return prev.map((b) => (b.category === category ? { ...b, amount } : b));
      }
      return [...prev, { category, amount }];
    });
  };

  const removeBudget = (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  return (
    <BudgetContext.Provider value={{ budgets, setBudget, removeBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};