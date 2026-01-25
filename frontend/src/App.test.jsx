import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

window.alert = vi.fn();
window.confirm = vi.fn().mockReturnValue(true);

// Mock fetch
window.fetch = vi.fn();

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

describe('App', () => {
  beforeEach(() => {
    fetch.mockClear();
    vi.clearAllMocks();
  });

  it('renders top screen', async () => {
    fetch.mockImplementation(async () => {
      return { ok: true, json: async () => ({}) };
    });

    await act(async () => {
      render(<App />);
    });

    // 認証状態の解決を待つ（Top画面が表示されるはず）
    await waitFor(() => {
      expect(screen.getByText('利用開始')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
