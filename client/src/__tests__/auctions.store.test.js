import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/http', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('../stores/auth.store', () => ({
  useAuthStore: { getState: () => ({ token: 't' }) },
}));

import { apiRequest } from '../api/http';
import { useAuctionsStore } from '../stores/auctions.store';
import { API } from '../api/endpoints';

describe('useAuctionsStore', () => {
  beforeEach(() => {
    useAuctionsStore.setState({
      auctions: [],
      meta: { count: 0, page: 1, per_page: 10 },
      currentAuction: null,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('fetchAuctions stores list and meta', async () => {
    apiRequest.mockResolvedValue({
      auctions: [{ id: 1 }, { id: 2 }],
      count: 2,
      page: 1,
      per_page: 10,
    });

    const data = await useAuctionsStore
      .getState()
      .fetchAuctions({ per_page: 10 });

    expect(apiRequest).toHaveBeenCalledWith(API.auctions, {
      query: { per_page: 10 },
    });
    expect(useAuctionsStore.getState().auctions).toHaveLength(2);
    expect(useAuctionsStore.getState().meta.count).toBe(2);
    expect(data.count).toBe(2);
  });

  it('fetchAuction stores currentAuction', async () => {
    apiRequest.mockResolvedValue({ auction: { id: 10, title: 'A' } });

    const a = await useAuctionsStore.getState().fetchAuction(10);

    expect(apiRequest).toHaveBeenCalledWith(API.auction(10));
    expect(useAuctionsStore.getState().currentAuction.id).toBe(10);
    expect(a.title).toBe('A');
  });

  it('sets error on failure', async () => {
    apiRequest.mockRejectedValue(new Error('boom'));

    await expect(useAuctionsStore.getState().fetchAuction(1)).rejects.toThrow(
      'boom',
    );
    expect(useAuctionsStore.getState().error).toBeTruthy();
    expect(useAuctionsStore.getState().loading).toBe(false);
  });
});
