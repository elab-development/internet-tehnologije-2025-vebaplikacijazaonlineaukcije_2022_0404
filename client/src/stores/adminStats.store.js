import { create } from 'zustand';
import { apiRequest } from '../api/http';
import { API } from '../api/endpoints';
import { useAuthStore } from './auth.store';

export const useAdminStatsStore = create((set) => ({
  stats: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAdminStats: async () => {
    const token = useAuthStore.getState().token;

    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.adminStats, {
        method: 'GET',
        token,
      });

      set({ stats: data ?? null, loading: false });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },
}));
