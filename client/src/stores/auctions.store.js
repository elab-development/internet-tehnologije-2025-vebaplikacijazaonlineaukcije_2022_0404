import { create } from 'zustand';
import { apiRequest } from '../api/http';
import { API } from '../api/endpoints';
import { useAuthStore } from './auth.store';

export const useAuctionsStore = create((set, get) => ({
  auctions: [],
  meta: { count: 0, page: 1, per_page: 10 },
  currentAuction: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAuctions: async (query = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.auctions, { query });
      set({
        auctions: data?.auctions ?? [],
        meta: {
          count: data?.count ?? 0,
          page: data?.page ?? 1,
          per_page: data?.per_page ?? query.per_page ?? 10,
        },
        loading: false,
      });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  fetchAuction: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.auction(id));
      set({ currentAuction: data?.auction ?? null, loading: false });
      return data?.auction ?? null;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  createAuction: async (payload) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.auctions, {
        method: 'POST',
        token,
        body: payload,
      });

      const created = data?.auction ?? null;
      if (created)
        set({ auctions: [created, ...get().auctions], loading: false });
      else set({ loading: false });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  updateAuction: async (id, patch) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.auction(id), {
        method: 'PUT',
        token,
        body: patch,
      });

      const updated = data?.auction ?? null;
      if (updated) {
        set({
          auctions: get().auctions.map((a) => (a.id === id ? updated : a)),
          currentAuction:
            get().currentAuction?.id === id ? updated : get().currentAuction,
          loading: false,
        });
      } else set({ loading: false });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  deleteAuction: async (id) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.auction(id), {
        method: 'DELETE',
        token,
      });

      set({
        auctions: get().auctions.filter((a) => a.id !== id),
        currentAuction:
          get().currentAuction?.id === id ? null : get().currentAuction,
        loading: false,
      });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },
}));
