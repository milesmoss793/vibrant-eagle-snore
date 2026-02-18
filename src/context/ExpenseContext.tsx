import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecurity } from './SecurityContext';
import { encryptData, decryptData, isJson } from '@/utils/encryption';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (updatedExpense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'expenseTrackerExpenses';

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { encryptionKey } = useSecurity();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load and decrypt
  useEffect(() => {
    if (!encryptionKey) return;
    
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        let rawData = stored;
        // Migration: if it's plain JSON, it's old data
        if (!isJson(stored)) {
          const decrypted = decryptData(stored, encryptionKey);
          if (decrypted) rawData = decrypted;
        }

        const parsed = JSON.parse(rawData).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
        setExpenses(parsed);
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  }, [encryptionKey]);

  // Encrypt and save
  useEffect(() => {
    if (!encryptionKey || expenses.length === 0 && !localStorage.getItem(LOCAL_STORAGE_KEY)) return;
    try {
      const encrypted = encryptData(JSON.stringify(expenses), encryptionKey);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error("Failed to save expenses:", error);
    }
  }, [expenses, encryptionKey]);

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expenseWithId = { ...newExpense, id: Date.now().toString() };
    setExpenses((prev) => [...prev, expenseWithId]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};