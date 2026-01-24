import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProvider, useUser } from './UserContext';
import * as firebaseAuth from 'firebase/auth';

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn(),
  })),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock firebaseConfig
vi.mock('../firebaseConfig', () => ({
  auth: {},
}));

const TestComponent = () => {
  const { userId, login, logout } = useUser();
  return (
    <div>
      <div data-testid="user-id">{userId}</div>
      <button onClick={() => login()}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('provides default user (test-user) when not signed in', async () => {
    // onAuthStateChanged calls the callback with null (not signed in)
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => {}; // unsubscribe function
    });
    
    await act(async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    expect(screen.getByTestId('user-id').textContent).toBe('test-user');
  });

  it('provides user id when signed in', async () => {
    const mockUser = {
      uid: 'real-user-uuid',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token')
    };

    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('real-user-uuid');
    });
  });

  it('handles login failure', async () => {
    firebaseAuth.signInWithPopup.mockRejectedValue(new Error('Auth failed'));
    
    // Setup initial state as logged out
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(console.error).toHaveBeenCalledWith('[UserProvider] login error:', expect.any(Error));
  });

  it('handles logout', async () => {
    firebaseAuth.signOut.mockResolvedValue({});
    
    // Setup initial state as logged in
    const mockUser = {
      uid: 'real-user-uuid',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token')
    };

    // First call returns user, subsequent might return null if we simulated that properly,
    // but here we just test the logout function is called.
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(firebaseAuth.signOut).toHaveBeenCalled();
    // In a real app, onAuthStateChanged would fire again with null, updating the state.
    // Since we mock it to call once, the state update relies on the component logic if it manually resets
    // or waits for the listener. UserContext logic:
    // logout() calls signOut, then setUser(null), setUserId('test-user') manually.
    
    expect(screen.getByTestId('user-id').textContent).toBe('test-user');
  });
});
