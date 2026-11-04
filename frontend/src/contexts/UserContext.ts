import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';

export interface UserContextValue {
  userId: string;
  setUserId: (userId: string) => void;
  user: User | null;
  idToken: string | null;
  getIdToken: () => Promise<string | null>;
  loading: boolean;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
