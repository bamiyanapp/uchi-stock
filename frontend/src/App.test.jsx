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

  it('renders household items management screen initially', async () => {
    fetch.mockImplementation(async (url) => {
      if (url.includes('/estimate')) {
        return {
          ok: true,
          json: async () => ({ estimatedDepletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }),
        };
      }
      return {
        ok: true,
        json: async () => [
          { itemId: '1', name: 'Toilet Paper', unit: 'rolls', currentStock: 5, updatedAt: new Date().toISOString() }
        ],
      };
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('家庭用品在庫管理')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Toilet Paper')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('rolls')).toBeInTheDocument();
      expect(screen.getByText(/時点の在庫/)).toBeInTheDocument();
      expect(screen.getByText(/あと5日で在庫切れの予想/)).toBeInTheDocument();
    });
  });

  it('can add a new item', async () => {
    fetch.mockImplementation(async (url, options) => {
      if (options?.method === 'POST') {
        return { ok: true, json: async () => ({}) };
      }
      return {
        ok: true,
        json: async () => [],
      };
    });

    await act(async () => {
      render(<App />);
    });

    fireEvent.change(screen.getByPlaceholderText('品目名（例: トイレットペーパー）'), { target: { value: 'Tissue' } });
    fireEvent.change(screen.getByPlaceholderText('単位（例: ロール, パック）'), { target: { value: 'packs' } });
    fireEvent.click(screen.getByRole('button', { name: '追加' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Tissue', unit: 'packs' })
      }));
    });
  });

  it('shows error alert when adding an item fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(<App />);
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Something went wrong' }),
    });

    fireEvent.change(screen.getByPlaceholderText('品目名（例: トイレットペーパー）'), { target: { value: 'Tissue' } });
    fireEvent.change(screen.getByPlaceholderText('単位（例: ロール, パック）'), { target: { value: 'packs' } });
    fireEvent.click(screen.getByRole('button', { name: '追加' }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('追加に失敗しました: Something went wrong'));
    });
  });

  it('can update stock using buttons', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { itemId: '1', name: 'Toilet Paper', unit: 'rolls', currentStock: 5, updatedAt: new Date().toISOString() }
      ],
    });

    await act(async () => {
      render(<App />);
    });

    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const consumeBtn = screen.getByTitle('消費');
    fireEvent.click(consumeBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items/1/consume'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ quantity: 1 })
      }));
    });

    const purchaseBtn = screen.getByTitle('購入');
    fireEvent.click(purchaseBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items/1/stock'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ quantity: 1 })
      }));
    });
  });

  it('can navigate to detail page', async () => {
    fetch.mockImplementation(async (url) => {
      if (url.includes('/history')) return { ok: true, json: async () => [] };
      if (url.includes('/estimate')) return { ok: true, json: async () => ({}) };
      return {
        ok: true,
        json: async () => [
          { itemId: '1', name: 'Toilet Paper', unit: 'rolls', currentStock: 5, updatedAt: new Date().toISOString() }
        ],
      };
    });

    await act(async () => {
      render(<App />);
    });

    const detailLink = await screen.findByText('詳細・履歴を見る');
    fireEvent.click(detailLink);

    await waitFor(() => {
      expect(screen.getByText('在庫一覧へ戻る')).toBeInTheDocument();
      expect(screen.getByText('在庫推定')).toBeInTheDocument();
      expect(screen.getByText('履歴詳細')).toBeInTheDocument();
    });
  });
});
