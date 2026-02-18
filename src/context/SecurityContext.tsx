import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityContextType {
  encryptionKey: string | null;
  isLocked: boolean;
  setKey: (key: string) => void;
  lock: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const SESSION_KEY = 'expense_tracker_session_key';

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_KEY);
  });

  const setKey = (key: string) => {
    setEncryptionKey(key);
    sessionStorage.setItem(SESSION_KEY, key);
  };

  const lock = () => {
    setEncryptionKey(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  if (!encryptionKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Secure Your Data</CardTitle>
            <CardDescription>
              Enter your master password to encrypt and access your financial records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                if (password.length < 4) {
                  toast.error("Password must be at least 4 characters.");
                  return;
                }
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
            <p className="text-[10px] text-muted-foreground mt-4 text-center">
              Note: This password is never sent to a server. If you forget it, your data cannot be recovered.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SecurityContext.Provider value={{ encryptionKey, isLocked: !encryptionKey, setKey, lock }}>
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