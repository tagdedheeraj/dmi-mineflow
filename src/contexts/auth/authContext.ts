
import { createContext, useContext } from 'react';
import { AuthContextType } from './types';

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  updateBalance: () => {},
  updateUser: () => {},
  changePassword: async () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
