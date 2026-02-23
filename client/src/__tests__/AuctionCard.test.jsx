import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import AuctionCard from '../components/AuctionCard';
import { renderWithRouter } from '../test/helpers';

// formaters (da test bude stabilan)
vi.mock('../utils/formaters', () => ({
  formatMoney: (n) => `MONEY:${n}`,
  formatDate: (d) => `DATE:${d}`,
}));

vi.mock('../stores/currency.store', () => ({
  useCurrencyStore: () => 'EUR',
}));

describe('AuctionCard', () => {
  it('renders title and link', () => {
    const auction = { id: 5, title: 'Test Auction', start_price: 10 };
    renderWithRouter(<AuctionCard auction={auction} />);

    expect(screen.getByText('Test Auction')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/auctions/5');
  });

  it('shows fallbacks when missing data', () => {
    const auction = {
      id: 1,
      title: 'A',
      start_price: 10,
      end_time: 'x',
      start_time: 'y',
    };
    renderWithRouter(<AuctionCard auction={auction} />);

    expect(screen.getByText(/uncategorized/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown seller/i)).toBeInTheDocument();
    expect(screen.getByText(/no description/i)).toBeInTheDocument();
  });
});
