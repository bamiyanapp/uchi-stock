import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

window.alert = vi.fn();
window.confirm = vi.fn().mockReturnValue(true);

// Mock fetch
window.fetch = vi.fn();

describe('App', () => {
  beforeEach(() => {
    fetch.mockClear();
    vi.clearAllMocks();
  });

  it('renders household items management screen initially', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { itemId: '1', name: 'Toilet Paper', unit: 'rolls', currentStock: 5, updatedAt: new Date().toISOString() }
      ],
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('家庭用品在庫管理')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Toilet Paper')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('rolls')).toBeInTheDocument();
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

  it('can update stock', async () => {
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

    const addButton = await screen.findByText('+1 購入');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items/1/stock'), expect.objectContaining({
        method: 'POST'
      }));
    });
  });
});
