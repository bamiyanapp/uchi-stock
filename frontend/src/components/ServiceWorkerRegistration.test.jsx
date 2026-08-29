import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';

describe('ServiceWorkerRegistration', () => {
  let registerMock;

  beforeEach(() => {
    registerMock = vi.fn().mockResolvedValue({ update: vi.fn() });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: registerMock },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    delete navigator.serviceWorker;
    vi.restoreAllMocks();
  });

  it('registers sw.js under import.meta.env.BASE_URL (GitHub Pagesのサブパス配信に対応するため)', () => {
    render(<ServiceWorkerRegistration />);
    expect(registerMock).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}sw.js`);
  });

  it('does nothing when serviceWorker is not supported', () => {
    delete navigator.serviceWorker;
    expect(() => render(<ServiceWorkerRegistration />)).not.toThrow();
    expect(registerMock).not.toHaveBeenCalled();
  });
});
