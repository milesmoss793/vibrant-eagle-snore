import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecurity } from './SecurityContext';
import { encryptData, decryptData, isJson } from '@/utils/encryption';

interface CategoryContextType {
  expenseCategories: string[];
  incomeSources: string[];
  addExpenseCategory: (category: string) => void;
  removeExpenseCategory: (category: string) => void;
  addIncomeSource: (source: string) => void;
  removeIncomeSource: (source: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const LOCAL_STORAGE_EXPENSE_CATEGORIES = 'expenseTracker_expenseCategories';
const LOCAL_STORAGE_INCOME_SOURCES = 'expenseTracker_incomeSources';

const defaultExpenseCategories = [
  "Food", "Transport", "Utilities", "Entertainment", "Shopping", 
  "Healthcare", "Education", "Rent", "Salary", "Other"
];

const defaultIncomeSources = [
  "Salary", "Freelance", "Investment", "Gift", "Refund", "Other"
];

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { encryptionKey } = useSecurity();
  const [expenseCategories, setExpenseCategories] = useState<string[]>(defaultExpenseCategories);
  const [incomeSources, setIncomeSources] = useState<string[]>(defaultIncomeSources);

  useEffect(() => {
    if (!encryptionKey) return;
    
    const loadData = (key: string, defaultVal: string[]) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        let rawData = stored;
        if (!isJson(stored)) {
          const decrypted = decryptData(stored, encryptionKey);
          if (decrypted) rawData = decrypted;
        }
        return JSON.parse(rawData);
      }
      return defaultVal;
    };

    setExpenseCategories(loadData(LOCAL_STORAGE_EXPENSE_CATEGORIES, defaultExpenseCategories));
    setIncomeSources(loadData(LOCAL_STORAGE_INCOME_SOURCES, defaultIncomeSources));
  }, [encryptionKey]);

  useEffect(() => {
    if (!encryptionKey) return;
    localStorage.setItem(LOCAL_STORAGE_EXPENSE_CATEGORIES, encryptData(JSON.stringify(expenseCategories), encryptionKey));
  }, [expenseCategories, encryptionKey]);

  useEffect(() => {
    if (!encryptionKey) return;
    localStorage.setItem(LOCAL_STORAGE_INCOME_SOURCES, encryptData(JSON.stringify(incomeSources), encryptionKey));
  }, [incomeSources, encryptionKey]);

  const addExpenseCategory = (category: string) => {
    if (!expenseCategories.includes(category)) {
      setExpenseCategories([...expenseCategories, category]);
    }
  };

  const removeExpenseCategory = (category: string) => {
    setExpenseCategories(expenseCategories.filter(c => c !== category));
  };

  const addIncomeSource = (source: string) => {
    if (!incomeSources.includes(source)) {
      setIncomeSources([...incomeSources, source]);
    }
  };

  const removeIncomeSource = (source: string) => {
    setIncomeSources(incomeSources.filter(s => s !== source));
  };

  return (
    <CategoryContext.Provider value={{ 
      expenseCategories, 
      incomeSources, 
      addExpenseCategory, 
      removeExpenseCategory, 
      addIncomeSource, 
      removeIncomeSource 
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};