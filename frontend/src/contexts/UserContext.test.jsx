import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProvider } from './UserProvider';
import { useUser } from './UserContext';
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
  const handleLogin = async () => {
    try {
      await login();
    } catch {
      // Ignore in test component
    }
  };
  return (
    <div>
      <div data-testid="user-id">{userId}</div>
      <button onClick={handleLogin}>Login</button>
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

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('test-user');
    });
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
    
    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('test-user');
    });
  });

  it('provides getIdToken function that returns id token', async () => {
    const mockUser = {
      uid: 'real-user-uuid',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token')
    };

    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    let capturedContext;
    const TokenTestComponent = () => {
      const userContext = useUser();
      React.useEffect(() => {
        capturedContext = userContext;
      }, [userContext]);
      return <div data-testid="user-id">{userContext.userId}</div>;
    };

    await act(async () => {
      render(
        <UserProvider>
          <TokenTestComponent />
        </UserProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('real-user-uuid');
    });

    expect(typeof capturedContext.getIdToken).toBe('function');
    
    // Mock the current user in firebaseAuth
    const { auth } = await import('../firebaseConfig');
    auth.currentUser = mockUser;

    const token = await capturedContext.getIdToken();
    expect(token).toBe('mock-id-token');
    expect(mockUser.getIdToken).toHaveBeenCalled();
  });
});
