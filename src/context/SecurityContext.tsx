import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { encryptData, decryptData } from '@/utils/encryption';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SecurityContextType {
  encryptionKey: string | null;
  isLocked: boolean;
  isPersistent: boolean;
  setKey: (key: string) => void;
  updateKey: (oldKey: string, newKey: string) => boolean;
  lock: () => void;
  resetVault: () => void;
  setPersist: (persist: boolean) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const SESSION_KEY = 'expense_tracker_session_key';
const LOCAL_KEY = 'expense_tracker_local_key';
const PERSIST_SETTING_KEY = 'expense_tracker_persist_setting';

const STORAGE_KEYS = [
  'expenseTrackerExpenses',
  'expenseTrackerIncome',
  'expenseTracker_expenseCategories',
  'expenseTracker_incomeSources',
  'expenseTracker_budgets',
  'expenseTracker_recurringTransactions',
  'expenseTracker_goals',
  'expenseTrackerUserName'
];

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPersistent, setIsPersistent] = useState<boolean>(() => {
    return localStorage.getItem(PERSIST_SETTING_KEY) === 'true';
  });

  const [encryptionKey, setEncryptionKey] = useState<string | null>(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return session;
    
    const persist = localStorage.getItem(PERSIST_SETTING_KEY) === 'true';
    if (persist) {
      return localStorage.getItem(LOCAL_KEY);
    }
    return null;
  });

  const setKey = (key: string) => {
    setEncryptionKey(key);
    sessionStorage.setItem(SESSION_KEY, key);
    if (isPersistent) {
      localStorage.setItem(LOCAL_KEY, key);
    }
  };

  const lock = () => {
    setEncryptionKey(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCAL_KEY);
  };

  const resetVault = () => {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(PERSIST_SETTING_KEY);
    lock();
    window.location.reload();
  };

  const setPersist = (persist: boolean) => {
    setIsPersistent(persist);
    localStorage.setItem(PERSIST_SETTING_KEY, persist.toString());
    if (persist && encryptionKey) {
      localStorage.setItem(LOCAL_KEY, encryptionKey);
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }
  };

  const updateKey = (oldKey: string, newKey: string): boolean => {
    if (oldKey !== encryptionKey) return false;

    try {
      STORAGE_KEYS.forEach(key => {
        const encrypted = localStorage.getItem(key);
        if (encrypted) {
          const decrypted = decryptData(encrypted, oldKey);
          if (decrypted) {
            const reEncrypted = encryptData(decrypted, newKey);
            localStorage.setItem(key, reEncrypted);
          }
        }
      });
      setKey(newKey);
      return true;
    } catch (error) {
      console.error("Failed to update encryption key:", error);
      return false;
    }
  };

  if (!encryptionKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Vault Locked</CardTitle>
            <CardDescription>
              Enter your master password to access your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                setKey(password);
                toast.success("Vault unlocked!");
              }}
              className="space-y-4"
            >
              <Input
                name="password"
                type="password"
                placeholder="Master Password"
                autoFocus
                required
              />
              <Button type="submit" className="w-full">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Vault
              </Button>
            </form>
            
            <div className="pt-4 border-t text-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="link" className="text-xs text-muted-foreground">
                    Forgot password? Reset Application
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Reset All Data?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your financial records, budgets, and goals. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetVault} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SecurityContext.Provider value={{ 
      encryptionKey, 
      isLocked: !encryptionKey, 
      isPersistent,
      setKey, 
      updateKey, 
      lock, 
      resetVault,
      setPersist
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};