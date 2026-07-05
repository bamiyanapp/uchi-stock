import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItemDetail from './ItemDetail';
import { UserContext } from '../contexts/UserContext';

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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div />,
  Package: () => <div />,
  History: () => <div />,
  TrendingDown: () => <div />,
  Minus: () => <div />,
  Plus: () => <div />,
  Edit: () => <div />,
  AlertCircle: () => <div />,
  Home: () => <div />,
}));

const mockUser = {
  userId: 'test-user',
  idToken: 'mock-token',
};

const mockItem = {
  itemId: 'item-1',
  name: 'Test Item',
  unit: 'pcs',
  currentStock: 10,
};

const mockHistory = [
  { historyId: 'h1', type: 'consumption', quantity: 2, date: '2023-01-01T12:00:00Z', memo: 'Used' },
  { historyId: 'h2', type: 'purchase', quantity: 5, date: '2023-01-02T12:00:00Z', memo: 'Bought' },
];

const mockEstimate = {
  estimatedDepletionDate: '2023-01-10T12:00:00Z',
  dailyConsumption: '0.5',
  predictedStock: 8.5,
};

describe('ItemDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const renderComponent = (itemId = 'item-1') => {
    return render(
      <UserContext.Provider value={mockUser}>
        <MemoryRouter initialEntries={[`/item/${itemId}`]}>
          <Routes>
            <Route path="/item/:itemId" element={<ItemDetail />} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('renders loading state initially', async () => {
    fetch.mockReturnValue(new Promise(() => {})); // Never resolves
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders item details and estimate successfully', async () => {
    fetch.mockImplementation((url) => {
      if (url.endsWith('/items')) return Promise.resolve({ ok: true, json: async () => [mockItem] });
      if (url.endsWith('/history')) return Promise.resolve({ ok: true, json: async () => mockHistory });
      if (url.endsWith('/estimate')) return Promise.resolve({ ok: true, json: async () => mockEstimate });
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('8.5')).toBeInTheDocument();
      expect(screen.getByText('pcs')).toBeInTheDocument();
      expect(screen.getByText('0.5 pcs / 日')).toBeInTheDocument();
    });
  });

  it('renders "Item not found" if item does not exist', async () => {
    fetch.mockImplementation((url) => {
      if (url.endsWith('/items')) return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await act(async () => {
      renderComponent('nonexistent');
    });

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('指定された品目が見つかりませんでした。既に削除された可能性があります。')).toBeInTheDocument();
    });
  });

  it('renders history table correctly', async () => {
    fetch.mockImplementation((url) => {
      if (url.endsWith('/items')) return Promise.resolve({ ok: true, json: async () => [mockItem] });
      if (url.endsWith('/history')) return Promise.resolve({ ok: true, json: async () => mockHistory });
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText('消費')).toBeInTheDocument();
      expect(screen.getByText('購入')).toBeInTheDocument();
      expect(screen.getByText('Used')).toBeInTheDocument();
      expect(screen.getByText('Bought')).toBeInTheDocument();
      // 残量の表示確認
      // mockHistoryは降順で届く想定。
      // 現在の在庫 10
      // 1件目 (h1): consumption 2 -> 直前の在庫は 10.
      // 2件目 (h2): purchase 5 -> 直前の在庫は 10 + 2 = 12. 直前の在庫は 12.
      expect(screen.getByText('10 pcs')).toBeInTheDocument();
      expect(screen.getByText('12 pcs')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('Fetch failed'));

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      // Still shows not found because item will be null
      expect(screen.getByText('404')).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('handles case with no history', async () => {
    fetch.mockImplementation((url) => {
      if (url.endsWith('/items')) return Promise.resolve({ ok: true, json: async () => [mockItem] });
      if (url.endsWith('/history')) return Promise.resolve({ ok: true, json: async () => null }); // null or empty
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText('履歴がありません')).toBeInTheDocument();
    });
  });
});
