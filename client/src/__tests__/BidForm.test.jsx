import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BidForm from '../components/auction/BidForm';

vi.mock('../stores/currency.store', () => ({
  useCurrencyStore: () => 'EUR',
}));

vi.mock('../utils/formaters', () => ({
  formatMoney: (n) => `MONEY:${n}`,
  parseLaravelDate: (s) => (s ? new Date(s) : null),
}));

describe('BidForm', () => {
  const baseAuction = {
    start_price: 100,
    highest_bid: 120,
    start_time: '2020-01-01T00:00:00Z',
    end_time: '2099-01-01T00:00:00Z',
  };

  it('shows login message when not authed', () => {
    screen;
    const { container } = render(
      <BidForm
        auction={baseAuction}
        isBuyer={true}
        isAuthed={false}
        loading={false}
        onSubmitBid={vi.fn()}
      />,
    );
    expect(screen.getByText(/log in as a buyer/i)).toBeInTheDocument();
  });

  it('shows buyer-only message when not buyer', () => {
    render(
      <BidForm
        auction={baseAuction}
        isBuyer={false}
        isAuthed={true}
        loading={false}
        onSubmitBid={vi.fn()}
      />,
    );
    expect(screen.getByText(/only buyers can place bids/i)).toBeInTheDocument();
  });

  it('shows inactive message when auction ended', () => {
    const endedAuction = { ...baseAuction, end_time: '2000-01-01T00:00:00Z' };
    render(
      <BidForm
        auction={endedAuction}
        isBuyer={true}
        isAuthed={true}
        loading={false}
        onSubmitBid={vi.fn()}
      />,
    );
    expect(screen.getByText(/auction is not active/i)).toBeInTheDocument();
  });

  it('submits bid and clears input', async () => {
    const onSubmitBid = vi.fn().mockResolvedValue(undefined);

    render(
      <BidForm
        auction={baseAuction}
        isBuyer={true}
        isAuthed={true}
        loading={false}
        onSubmitBid={onSubmitBid}
      />,
    );

    // minBid should be current + 0.01 => 120.01
    expect(screen.getByText(/minimum bid/i)).toHaveTextContent('MONEY:120.01');

    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '130.5');

    await userEvent.click(screen.getByRole('button', { name: /place bid/i }));

    expect(onSubmitBid).toHaveBeenCalledWith(130.5);
    expect(input).toHaveValue(null); // number input after clear often becomes null/empty
  });
});
