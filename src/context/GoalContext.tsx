import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecurity } from './SecurityContext';
import { encryptData, decryptData, isJson } from '@/utils/encryption';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category?: string;
}

interface GoalContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'expenseTracker_goals';

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { encryptionKey } = useSecurity();
  const [goals, setGoals] = useState<Goal[]>([]);

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
        const parsed = JSON.parse(rawData).map((g: any) => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline) : undefined,
        }));
        setGoals(parsed);
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  }, [encryptionKey]);

  useEffect(() => {
    if (!encryptionKey || goals.length === 0 && !localStorage.getItem(LOCAL_STORAGE_KEY)) return;
    try {
      const encrypted = encryptData(JSON.stringify(goals), encryptionKey);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
  }, [goals, encryptionKey]);

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goalWithId: Goal = { ...newGoal, id: Date.now().toString() };
    setGoals((prev) => [...prev, goalWithId]);
  };

  const updateGoal = (updated: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, contributeToGoal }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};