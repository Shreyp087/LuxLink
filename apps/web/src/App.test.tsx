import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('LightMule field console', () => {
  it('states the product boundary and offline status', () => {
    render(<App />);
    expect(screen.getByText('READY WITHOUT NETWORK')).toBeInTheDocument();
    expect(screen.getByText(/Not a replacement for emergency networks/i)).toBeInTheDocument();
  });

  it('advances a simulated optical handoff to verified', async () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /run field test/i }));
    expect(screen.getByText('Find signal').closest('li')).toHaveClass('is-reached');
    await act(async () => vi.advanceTimersByTimeAsync(1_500));
    await act(async () => vi.advanceTimersByTimeAsync(2_400));
    expect(screen.getByText('SIGNATURE VALID')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
