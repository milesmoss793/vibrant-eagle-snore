import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of an income entry
export interface Income {
  id: string;
  amount: number;
  source: string;
  date: Date;
  description?: string;
}

// Define the shape of the context value
interface IncomeContextType {
  income: Income[];
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (updatedIncome: Income) => void; // New: Function to update an income entry
  deleteIncome: (id: string) => void; // New: Function to delete an income entry
}

// Create the context
const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

// Key for localStorage
const LOCAL_STORAGE_KEY = 'expenseTrackerIncome';

// Create the provider component
export const IncomeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [income, setIncome] = useState<Income[]>(() => {
    // Load income from localStorage on initial render
    try {
      const storedIncome = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedIncome) {
        // Parse dates back into Date objects
        return JSON.parse(storedIncome).map((entry: Income) => ({
          ...entry,
          date: new Date(entry.date),
        }));
      }
    } catch (error) {
      console.error("Failed to load income from localStorage:", error);
    }
    return [];
  });

  // Save income to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(income));
    } catch (error) {
      console.error("Failed to save income to localStorage:", error);
    }
  }, [income]);

  const addIncome = (newIncome: Omit<Income, 'id'>) => {
    const incomeWithId = { ...newIncome, id: Date.now().toString() }; // Simple ID generation
    setIncome((prevIncome) => [...prevIncome, incomeWithId]);
  };

  const updateIncome = (updatedIncome: Income) => {
    setIncome((prevIncome) =>
      prevIncome.map((inc) => (inc.id === updatedIncome.id ? updatedIncome : inc))
    );
  };

  const deleteIncome = (id: string) => {
    setIncome((prevIncome) => prevIncome.filter((inc) => inc.id !== id));
  };

  return (
    <IncomeContext.Provider value={{ income, addIncome, updateIncome, deleteIncome }}>
      {children}
    </IncomeContext.Provider>
  );
};

// Custom hook to use the income context
export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (context === undefined) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
};