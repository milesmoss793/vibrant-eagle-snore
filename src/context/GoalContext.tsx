import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).map((g: any) => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline) : undefined,
        }));
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

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