import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProvider, useUser } from './UserContext';
import * as auth from 'aws-amplify/auth';

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
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
    localStorage.clear();
  });

  it('provides default user (user-1) when not signed in', async () => {
    auth.getCurrentUser.mockRejectedValue(new Error('Not signed in'));
    
    await act(async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    expect(screen.getByTestId('user-id').textContent).toBe('user-1');
  });

  it('provides user id when signed in', async () => {
    auth.getCurrentUser.mockResolvedValue({ userId: 'real-user-uuid' });
    auth.fetchAuthSession.mockResolvedValue({
      tokens: { idToken: { toString: () => 'mock-id-token' } }
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
    auth.signInWithRedirect.mockRejectedValue(new Error('Auth failed'));
    
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

    expect(console.error).toHaveBeenCalledWith('Error signing in:', expect.any(Error));
  });

  it('handles logout', async () => {
    auth.signOut.mockResolvedValue({});
    auth.getCurrentUser.mockRejectedValue(new Error('Not signed in'));

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

    expect(auth.signOut).toHaveBeenCalled();
    expect(screen.getByTestId('user-id').textContent).toBe('user-1');
  });
});
