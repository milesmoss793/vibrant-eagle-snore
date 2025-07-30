import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  updateExpense: (updatedExpense: Expense) => void; // New: Function to update an expense
  deleteExpense: (id: string) => void; // New: Function to delete an expense
}

// Create the context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Key for localStorage
const LOCAL_STORAGE_KEY = 'expenseTrackerExpenses';

// Create the provider component
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    // Load expenses from localStorage on initial render
    try {
      const storedExpenses = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedExpenses) {
        // Parse dates back into Date objects
        return JSON.parse(storedExpenses).map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date),
        }));
      }
    } catch (error) {
      console.error("Failed to load expenses from localStorage:", error);
    }
    return [];
  });

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expenses to localStorage:", error);
    }
  }, [expenses]);

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expenseWithId = { ...newExpense, id: Date.now().toString() }; // Simple ID generation
    setExpenses((prevExpenses) => [...prevExpenses, expenseWithId]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp.id !== id));
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense }}>
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