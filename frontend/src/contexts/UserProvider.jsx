import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { UserContext } from './UserContext';

const isE2E = import.meta.env.MODE === 'test';
const isDev = import.meta.env.MODE === 'development';

export const UserProvider = ({ children }) => {
  const hasApiKey = !!auth.config?.apiKey && auth.config.apiKey !== "mock-api-key";
  const isSkipAuth = (isE2E || !hasApiKey) && import.meta.env.MODE !== 'test' && !isDev;
  const isTest = import.meta.env.MODE === 'test';

  const [userId, setUserId] = useState(isSkipAuth || isTest ? 'test-user' : 'pending');
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  
  const [loading, setLoading] = useState(!isSkipAuth);

  useEffect(() => {
    if (isSkipAuth) {
      console.log('[UserProvider] Auth skipping (E2E or no API key)');
      return;
    }

    console.log('[UserProvider] Registering onAuthStateChanged');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('[UserProvider] State changed:', currentUser ? `User logged in: ${currentUser.uid}` : 'No user');
      setLoading(true);
      if (currentUser) {
        try {
          console.log('[UserProvider] Fetching ID token...');
          const token = await currentUser.getIdToken();
          console.log('[UserProvider] ID token fetched successfully. Length:', token.length);
          
          setUser(currentUser);
          setUserId(currentUser.uid);
          setIdToken(token);
        } catch (error) {
          console.error('[UserProvider] Token error:', error);
          // ユーザー情報は保持しつつトークンなしで続行（エラーハンドリングは各コンポーネントで行う）
          setUser(currentUser);
          setUserId(currentUser.uid);
          setIdToken(null);
        }
      } else {
        console.log('[UserProvider] No user found, setting to guest mode');
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
      console.log('[UserProvider] login called');
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
      console.log('[UserProvider] logout called');
      await signOut(auth);
      setUser(null);
      setIdToken(null);
      setUserId('test-user');
    } catch (error) {
      console.error('[UserProvider] logout error:', error);
    }
  };

  const getIdTokenFunc = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    if (isSkipAuth || isTest) {
      return 'test-token';
    }
    return idToken;
  };

  const value = {
    userId,
    setUserId,
    user,
    idToken,
    getIdToken: getIdTokenFunc,
    loading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
