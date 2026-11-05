import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary.jsx'; // symlink

function ThrowingComponent(): never {
  throw new Error('テスト用の例外');
}

describe('ErrorBoundary（main.tsxでのreportUrl連携）', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('子要素が例外を投げるとフォールバック画面を表示し、reportUrlへPOSTする', () => {
    render(
      <ErrorBoundary reportUrl="https://example.com/report-client-error">
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/report-client-error',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('テスト用の例外'),
      }),
    );
  });
});
