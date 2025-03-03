
import { createContext } from 'react';
import { AuthContextType } from './types';

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  updateBalance: () => {},
  updateUser: () => {},
  changePassword: async () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
