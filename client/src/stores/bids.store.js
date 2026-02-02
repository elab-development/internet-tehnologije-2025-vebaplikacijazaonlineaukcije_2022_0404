import { create } from 'zustand';
import { apiRequest } from '../api/http';
import { API } from '../api/endpoints';
import { useAuthStore } from './auth.store';

export const useBidsStore = create((set, get) => ({
  bids: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchMyBids: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.bids, { token });
      set({ bids: data?.bids ?? [], loading: false });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  fetchAuctionBidsAdmin: async (auctionId) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.auctionBids(auctionId), { token });
      set({ bids: data?.bids ?? [], loading: false });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  fetchUserBidsAdmin: async (userId) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.userBids(userId), { token });
      set({ bids: data?.bids ?? [], loading: false });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  createBid: async ({ auction_id, amount }) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.bids, {
        method: 'POST',
        token,
        body: { auction_id, amount },
      });

      const created = data?.bid ?? null;
      if (created) set({ bids: [created, ...get().bids], loading: false });
      else set({ loading: false });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  updateBid: async (id, patch) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.bid(id), {
        method: 'PUT',
        token,
        body: patch,
      });
      const updated = data?.bid ?? null;

      if (updated) {
        set({
          bids: get().bids.map((b) => (b.id === id ? updated : b)),
          loading: false,
        });
      } else set({ loading: false });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  deleteBid: async (id) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.bid(id), { method: 'DELETE', token });
      set({ bids: get().bids.filter((b) => b.id !== id), loading: false });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },
}));
