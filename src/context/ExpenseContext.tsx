import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of an expense
export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

// Define the shape of the context value
interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
}

// Create the context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Create the provider component
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expenseWithId = { ...newExpense, id: Date.now().toString() }; // Simple ID generation
    setExpenses((prevExpenses) => [...prevExpenses, expenseWithId]);
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook to use the expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};