import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a budget entry
export interface Budget {
  id: string;
  category: string;
  limit: number;
}

// Define the shape of the context value
interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (updatedBudget: Budget) => void;
  deleteBudget: (id: string) => void;
}

// Create the context
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Key for localStorage
const LOCAL_STORAGE_KEY = 'expenseTrackerBudgets';

// Create the provider component
export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    // Load budgets from localStorage on initial render
    try {
      const storedBudgets = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedBudgets) {
        return JSON.parse(storedBudgets);
      }
    } catch (error) {
      console.error("Failed to load budgets from localStorage:", error);
    }
    return [];
  });

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(budgets));
    } catch (error) {
      console.error("Failed to save budgets to localStorage:", error);
    }
  }, [budgets]);

  const addBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budgetWithId = { ...newBudget, id: Date.now().toString() }; // Simple ID generation
    setBudgets((prevBudgets) => [...prevBudgets, budgetWithId]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prevBudgets) => prevBudgets.filter((b) => b.id !== id));
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook to use the budget context
export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};