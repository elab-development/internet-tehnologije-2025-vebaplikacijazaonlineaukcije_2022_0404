import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuctionDetails from '../pages/AuctionDetails';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '10' }),
    Link: ({ to, children, ...rest }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

const auctionsState = {
  currentAuction: null,
  fetchAuction: vi.fn().mockResolvedValue(null),
  loading: false,
  error: null,
  clearError: vi.fn(),
};

const bidsState = {
  createBid: vi.fn().mockResolvedValue(undefined),
  loading: false,
  error: null,
  clearError: vi.fn(),
};

const authState = { token: null, user: null };

vi.mock('../stores/auctions.store', () => ({
  useAuctionsStore: (sel) => sel(auctionsState),
}));

vi.mock('../stores/bids.store', () => ({
  useBidsStore: (sel) => sel(bidsState),
}));

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (sel) => sel(authState),
}));

vi.mock('../api/images.api', () => ({
  getAuctionImageUrl: () => 'http://test/image.jpg',
}));

// child components can be mocked to keep this test simple
vi.mock('../components/auction/AuctionSummary', () => ({
  default: () => <div>SUMMARY</div>,
}));
vi.mock('../components/auction/WinnerCard', () => ({
  default: () => <div>WINNER</div>,
}));
vi.mock('../components/auction/BidForm', () => ({
  default: () => <div>BIDFORM</div>,
}));

describe('AuctionDetails', () => {
  beforeEach(() => {
    auctionsState.fetchAuction.mockClear();
    auctionsState.currentAuction = null;
  });

  it('calls fetchAuction on mount', async () => {
    render(<AuctionDetails />);
    expect(auctionsState.fetchAuction).toHaveBeenCalledWith('10');
  });

  it('shows "Auction not found" when no auction', () => {
    render(<AuctionDetails />);
    expect(screen.getByText(/auction not found/i)).toBeInTheDocument();
  });
});
