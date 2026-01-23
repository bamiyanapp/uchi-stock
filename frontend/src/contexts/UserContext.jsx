import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const isE2E = import.meta.env.MODE === 'test';
const isDev = import.meta.env.MODE === 'development';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState('test-user');
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(!isE2E);

  useEffect(() => {
    if (isE2E || isDev || !auth.config?.apiKey || auth.config.apiKey === "mock-api-key") {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (error) {
          console.error('Error getting ID token:', error);
        }
      } else {
        setUser(null);
        setIdToken(null);
        setUserId('test-user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIdToken(null);
      setUserId('test-user'); // Reset to default or handle as needed
    } catch (error) {
      console.error('Error signing out:', error);
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
