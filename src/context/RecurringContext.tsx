import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryOrSource: string;
  frequency: Frequency;
  startDate: Date;
  endDate?: Date;
  lastProcessedDate?: Date;
  description?: string;
  isActive: boolean;
}

interface RecurringContextType {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'isActive'>) => void;
  updateRecurringTransaction: (transaction: RecurringTransaction) => void;
  deleteRecurringTransaction: (id: string) => void;
}

const RecurringContext = createContext<RecurringContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'expenseTracker_recurringTransactions';

export const RecurringProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).map((t: any) => ({
          ...t,
          startDate: new Date(t.startDate),
          endDate: t.endDate ? new Date(t.endDate) : undefined,
          lastProcessedDate: t.lastProcessedDate ? new Date(t.lastProcessedDate) : undefined,
        }));
      }
    } catch (error) {
      console.error("Failed to load recurring transactions:", error);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  const addRecurringTransaction = (newTransaction: Omit<RecurringTransaction, 'id' | 'isActive'>) => {
    const transactionWithId: RecurringTransaction = {
      ...newTransaction,
      id: Date.now().toString(),
      isActive: true,
    };
    setRecurringTransactions((prev) => [...prev, transactionWithId]);
  };

  const updateRecurringTransaction = (updated: RecurringTransaction) => {
    setRecurringTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <RecurringContext.Provider value={{ 
      recurringTransactions, 
      addRecurringTransaction, 
      updateRecurringTransaction, 
      deleteRecurringTransaction 
    }}>
      {children}
    </RecurringContext.Provider>
  );
};

export const useRecurring = () => {
  const context = useContext(RecurringContext);
  if (context === undefined) {
    throw new Error('useRecurring must be used within a RecurringProvider');
  }
  return context;
};