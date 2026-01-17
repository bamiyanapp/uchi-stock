import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

  const mockItems = [
    { itemId: '1', name: 'Toilet Paper', unit: 'rolls', currentStock: 5, updatedAt: new Date().toISOString() }
  ];

  it('renders household items management screen initially', async () => {
    fetch.mockImplementation(async (url) => {
      if (url.includes('/estimate')) {
        return {
          ok: true,
          json: async () => ({ estimatedDepletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }),
        };
      }
      if (url.includes('/items')) {
        return {
          ok: true,
          json: async () => mockItems,
        };
      }
      return { ok: true, json: async () => ({}) };
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('家庭用品在庫管理')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Toilet Paper')).toBeInTheDocument();
    });
  });

  it('can navigate to update page and submit', async () => {
    fetch.mockImplementation(async (url) => {
      if (url.includes('/estimate')) return { ok: true, json: async () => ({}) };
      if (url.includes('/items')) {
        return {
          ok: true,
          json: async () => mockItems,
        };
      }
      return { ok: true, json: async () => ({}) };
    });

    await act(async () => {
      render(<App />);
    });

    // Home 画面の「在庫を更新する」ボタン
    const updateLinks = await screen.findAllByText('在庫を更新する');
    fireEvent.click(updateLinks[0]);

    // StockUpdate 画面への遷移を待機
    await waitFor(() => {
      expect(screen.getByText('在庫を更新する')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });

    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    fireEvent.click(screen.getByText('更新を保存する'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items/1/consume'), expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ quantity: 2, memo: "" })
      }));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items/1/stock'), expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ quantity: 1, memo: "" })
      }));
    });
  });
});
