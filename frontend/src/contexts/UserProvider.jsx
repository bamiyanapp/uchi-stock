import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { UserContext } from './UserContext';

// ホーム画面に追加したPWA（standalone表示）は、iOS SafariのITP
// （Intelligent Tracking Prevention）により、一定期間操作が無いと
// IndexedDB・localStorage等のスクリプト書き込み可能なストレージが
// 消去されることがある。Firebase AuthのセッションもIndexedDBへ永続化
// されているため、これに巻き込まれてログインセッションが意図せず
// 切れる（issue #326）。navigator.storage.persist()でブラウザに
//永続ストレージを要求することで、この自動消去の対象になりにくくする
// （Safari 15.2+でサポート、未対応環境ではAPI自体が存在しないため
// フィーチャー検出で無視する。付与されるかはブラウザの裁量であり
// 確実な保証ではない）
async function requestPersistentStorage() {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch (error) {
    console.warn('[UserProvider] storage.persist() failed:', error);
  }
}

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

    requestPersistentStorage();
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('[UserProvider] setPersistence failed:', error);
    });

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
      return result.user;
    } catch (error) {
      console.error('[UserProvider] login error:', error);
      throw error;
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
