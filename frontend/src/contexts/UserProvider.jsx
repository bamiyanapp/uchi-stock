import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { UserContext } from './UserContext';

const isE2E = import.meta.env.MODE === 'test';
const isDev = import.meta.env.MODE === 'development';

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState('test-user');
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  
  const hasApiKey = !!auth.config?.apiKey && auth.config.apiKey !== "mock-api-key";
  const isSkipAuth = (isE2E || !hasApiKey) && import.meta.env.MODE !== 'test' && !isDev;
  
  const [loading, setLoading] = useState(!isSkipAuth);

  useEffect(() => {
    if (isSkipAuth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('[UserProvider] State changed:', currentUser ? `User ${currentUser.uid}` : 'No user');
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (error) {
          console.error('[UserProvider] Token error:', error);
        }
      } else {
        setUser(null);
        setIdToken(null);
        setUserId('test-user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSkipAuth]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      console.log('[UserProvider] Popup login success:', result.user.displayName);
    } catch (error) {
      console.error('[UserProvider] login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIdToken(null);
      setUserId('test-user');
    } catch (error) {
      console.error('[UserProvider] logout error:', error);
    }
  };

  const value = {
    userId,
    setUserId,
    user,
    idToken,
    loading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
