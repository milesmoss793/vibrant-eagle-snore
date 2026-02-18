import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { useSecurity } from './SecurityContext';
import { encryptData, decryptData, isJson } from '@/utils/encryption';

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
  const { encryptionKey } = useSecurity();
  const [userName, setUserNameState] = useState<string>('');

  useEffect(() => {
    if (!encryptionKey) return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY);
      if (stored) {
        let rawData = stored;
        if (!isJson(stored)) {
          const decrypted = decryptData(stored, encryptionKey);
          if (decrypted) rawData = decrypted;
        }
        // If it's plain text (migration), it won't be JSON but also won't decrypt.
        // decryptData returns null on failure, so we handle that.
        setUserNameState(rawData || '');
      }
    } catch (error) {
      console.error("Failed to load user name:", error);
    }
  }, [encryptionKey]);

  useEffect(() => {
    if (!encryptionKey || !userName) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_NAME_KEY, encryptData(userName, encryptionKey));
    } catch (error) {
      console.error("Failed to save user name:", error);
    }
  }, [userName, encryptionKey]);

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