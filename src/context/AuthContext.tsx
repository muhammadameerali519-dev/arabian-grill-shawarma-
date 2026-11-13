import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const BOOTSTRAPPED_ADMIN_EMAIL = '80880q0q0@gmail.com';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  checkingAdmin: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);

      if (!currentUser) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        setAuthReady(true);
        return;
      }

      setCheckingAdmin(true);
      try {
        if (
          currentUser.emailVerified &&
          currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL
        ) {
          setIsAdmin(true);
        } else if (currentUser.emailVerified) {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminSnap.exists());
          } catch {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } finally {
        setCheckingAdmin(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      setAuthError(msg);
      throw err;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        checkingAdmin,
        authError,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
