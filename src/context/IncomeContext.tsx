import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecurity } from './SecurityContext';
import { encryptData, decryptData, isJson } from '@/utils/encryption';

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: Date;
  description?: string;
}

interface IncomeContextType {
  income: Income[];
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (updatedIncome: Income) => void;
  deleteIncome: (id: string) => void;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'expenseTrackerIncome';

export const IncomeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { encryptionKey } = useSecurity();
  const [income, setIncome] = useState<Income[]>([]);

  useEffect(() => {
    if (!encryptionKey) return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        let rawData = stored;
        if (!isJson(stored)) {
          const decrypted = decryptData(stored, encryptionKey);
          if (decrypted) rawData = decrypted;
        }
        const parsed = JSON.parse(rawData).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setIncome(parsed);
      }
    } catch (error) {
      console.error("Failed to load income:", error);
    }
  }, [encryptionKey]);

  useEffect(() => {
    if (!encryptionKey || income.length === 0 && !localStorage.getItem(LOCAL_STORAGE_KEY)) return;
    try {
      const encrypted = encryptData(JSON.stringify(income), encryptionKey);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error("Failed to save income:", error);
    }
  }, [income, encryptionKey]);

  const addIncome = (newIncome: Omit<Income, 'id'>) => {
    const incomeWithId = { ...newIncome, id: Date.now().toString() };
    setIncome((prev) => [...prev, incomeWithId]);
  };

  const updateIncome = (updatedIncome: Income) => {
    setIncome((prev) =>
      prev.map((inc) => (inc.id === updatedIncome.id ? updatedIncome : inc))
    );
  };

  const deleteIncome = (id: string) => {
    setIncome((prev) => prev.filter((inc) => inc.id !== id));
  };

  return (
    <IncomeContext.Provider value={{ income, addIncome, updateIncome, deleteIncome }}>
      {children}
    </IncomeContext.Provider>
  );
};

export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (context === undefined) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
};