import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(() => Promise.resolve()),
  },
}));

describe('LightMule field console', () => {
  it('states the safety boundary and initializes an offline identity', async () => {
    render(<App />);
    expect(screen.getByText(/Not a replacement for emergency networks/i)).toBeTruthy();
    expect(await screen.findByText(/LOCAL CORE READY/)).toBeTruthy();
    expect(screen.getByText(/Local identity ready/i)).toBeTruthy();
  });

  it('signs, frames, reconstructs, and verifies a message through loopback', async () => {
    render(<App />);
    const signButton = await screen.findByRole('button', { name: /sign & prepare signal/i });
    await waitFor(() => expect(signButton.hasAttribute('disabled')).toBe(false));
    fireEvent.click(signButton);

    const verifyButton = await screen.findByRole('button', { name: /verify on this device/i });
    fireEvent.click(verifyButton);

    expect(await screen.findByText('CRYPTOGRAPHIC INTEGRITY VALID')).toBeTruthy();
    expect(screen.getByText('TRUSTED SOURCE')).toBeTruthy();
    expect(screen.getByText(/unique frames/i)).toBeTruthy();
  });
});
