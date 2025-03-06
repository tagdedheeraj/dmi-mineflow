
import { useState } from 'react';
import { User } from '@/lib/storage/types';
import { useSignIn } from './useSignIn';
import { useSignUp } from './useSignUp';
import { useSignOut } from './useSignOut';

export function useAuthOperations(
  setUser: (user: User | null) => void,
  setIsAdmin: (isAdmin: boolean) => void
) {
  const [isLoading, setIsLoading] = useState(true);
  
  const { signIn } = useSignIn(setUser, setIsAdmin);
  const { signUp } = useSignUp(setUser);
  const { signOut } = useSignOut(setUser, setIsAdmin);

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    setIsLoading
  };
}
