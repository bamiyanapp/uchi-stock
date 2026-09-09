import '@testing-library/jest-dom';
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// vitest v5がバンドルするjsdomではwindow.localStorageがgetterのみの
// アクセサプロパティになっており、直接代入（global.localStorage = ...）が
// 「Cannot set property localStorage of [object Window] which has only a
// getter」で例外になる。vi.stubGlobalはdefineProperty経由でグローバルを
// 上書きするため、アクセサプロパティに対しても安全に差し替えられる
vi.stubGlobal('localStorage', localStorageMock);

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // デフォルトでは未ログイン状態とする
    callback(null);
    return () => {};
  }),
  setPersistence: vi.fn(() => Promise.resolve()),
  browserLocalPersistence: {},
}));
