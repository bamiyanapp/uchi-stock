import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || 'user-1';
  });

  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  const value = {
    userId,
    setUserId,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
