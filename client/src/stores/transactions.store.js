import { create } from 'zustand';
import { apiRequest } from '../api/http';
import { API } from '../api/endpoints';
import { useAuthStore } from './auth.store';

export const useTransactionsStore = create((set, get) => ({
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  // GET /transactions
  fetchTransactions: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });

    try {
      const data = await apiRequest(API.transactions, { token });

      set({
        transactions: data?.transactions ?? [],
        loading: false,
      });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  // GET /transactions/{id}
  fetchTransaction: async (id) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });

    try {
      const data = await apiRequest(API.transaction(id), { token });

      set({
        currentTransaction: data?.transaction ?? null,
        loading: false,
      });

      return data?.transaction ?? null;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  // POST /transactions  { auction_id }
  createTransaction: async ({ auction_id }) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });

    try {
      const data = await apiRequest(API.transactions, {
        method: 'POST',
        token,
        body: { auction_id },
      });

      const created = data?.transaction ?? null;

      if (created) {
        set({
          transactions: [created, ...get().transactions],
          currentTransaction: created,
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  findByAuctionId: (auctionId) =>
    (get().transactions || []).find((t) => t?.auction?.id === auctionId) ||
    null,

  clearCurrent: () => set({ currentTransaction: null }),
}));
