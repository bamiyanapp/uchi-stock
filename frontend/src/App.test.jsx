import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // "かるた読み上げアプリ" というテキストが存在することを確認
    expect(screen.getByText('かるた読み上げアプリ')).toBeInTheDocument();
  });
});
