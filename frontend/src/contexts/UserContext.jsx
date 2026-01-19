import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAuthSession, signInWithRedirect, signOut, getCurrentUser } from 'aws-amplify/auth';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState('test-user');
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      setUser(currentUser);
      setIdToken(session.tokens?.idToken?.toString());
      
      // CognitoのsubをuserIdとして使用
      if (currentUser.userId) {
        setUserId(currentUser.userId);
      }
    } catch (error) {
      console.log('User is not signed in', error);
      setUser(null);
      setIdToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut();
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
