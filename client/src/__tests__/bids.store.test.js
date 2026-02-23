import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/http', () => ({ apiRequest: vi.fn() }));
vi.mock('../stores/auth.store', () => ({
  useAuthStore: { getState: () => ({ token: 't' }) },
}));

import { apiRequest } from '../api/http';
import { useBidsStore } from '../stores/bids.store';
import { API } from '../api/endpoints';

describe('useBidsStore', () => {
  beforeEach(() => {
    useBidsStore.setState({ bids: [], loading: false, error: null });
    vi.clearAllMocks();
  });

  it('createBid prepends created bid', async () => {
    apiRequest.mockResolvedValue({ bid: { id: 1, amount: 123 } });

    await useBidsStore.getState().createBid({ auction_id: 10, amount: 123 });

    expect(apiRequest).toHaveBeenCalledWith(API.bids, {
      method: 'POST',
      token: 't',
      body: { auction_id: 10, amount: 123 },
    });

    expect(useBidsStore.getState().bids[0].id).toBe(1);
  });
});
