'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  profileCompleted: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthorized: false,
  profileCompleted: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Auth state changed', user ? 'User logged in' : 'No user');
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        const isUserAuthorized = userDoc.exists();
        const isProfileCompleted = userData?.profileCompleted || false;
        setIsAuthorized(isUserAuthorized);
        setProfileCompleted(isProfileCompleted);
        console.log('AuthContext: User data fetched', { 
          isAuthorized: isUserAuthorized,
          profileCompleted: isProfileCompleted 
        });
      } else {
        setIsAuthorized(false);
        setProfileCompleted(false);
        console.log('AuthContext: No user, resetting states');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthorized, profileCompleted }}>
      {children}
    </AuthContext.Provider>
  );
};

