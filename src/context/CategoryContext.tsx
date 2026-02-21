import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  "Healthcare", "Education", "Rent", "Other"
];

const defaultIncomeSources = [
  "Salary", "Freelance", "Investment", "Gift", "Refund", "Other"
];

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_EXPENSE_CATEGORIES);
    return stored ? JSON.parse(stored) : defaultExpenseCategories;
  });

  const [incomeSources, setIncomeSources] = useState<string[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_INCOME_SOURCES);
    return stored ? JSON.parse(stored) : defaultIncomeSources;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EXPENSE_CATEGORIES, JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_INCOME_SOURCES, JSON.stringify(incomeSources));
  }, [incomeSources]);

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