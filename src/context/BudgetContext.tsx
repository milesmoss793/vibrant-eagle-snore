import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecurity } from './SecurityContext';
import { encryptData, decryptData, isJson } from '@/utils/encryption';

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
  const { encryptionKey } = useSecurity();
  const [budgets, setBudgets] = useState<Budget[]>([]);

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
        setBudgets(JSON.parse(rawData));
      }
    } catch (error) {
      console.error("Failed to load budgets:", error);
    }
  }, [encryptionKey]);

  useEffect(() => {
    if (!encryptionKey || budgets.length === 0 && !localStorage.getItem(LOCAL_STORAGE_KEY)) return;
    try {
      const encrypted = encryptData(JSON.stringify(budgets), encryptionKey);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error("Failed to save budgets:", error);
    }
  }, [budgets, encryptionKey]);

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