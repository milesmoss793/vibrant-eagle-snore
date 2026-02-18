import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface UserPreferencesContextType {
  userName: string;
  setUserName: (name: string) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_NAME_KEY = 'expenseTrackerUserName';

export const UserPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const [userName, setUserNameState] = useState<string>(() => {
    try {
      const storedName = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY);
      return storedName || '';
    } catch (error) {
      console.error("Failed to load user name from localStorage:", error);
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_NAME_KEY, userName);
    } catch (error) {
      console.error("Failed to save user name to localStorage:", error);
    }
  }, [userName]);

  const setUserName = (name: string) => {
    setUserNameState(name);
  };

  return (
    <UserPreferencesContext.Provider value={{ userName, setUserName, theme, setTheme }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};