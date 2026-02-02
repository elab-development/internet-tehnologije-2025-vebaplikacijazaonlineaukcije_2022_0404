import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../api/http';
import { API } from '../api/endpoints';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      isAuthed: () => !!get().token,
      hasRole: (role) => get().user?.role === role,

      clearError: () => set({ error: null }),

      register: async ({ name, email, password, role }) => {
        set({ loading: true, error: null });
        try {
          const data = await apiRequest(API.register, {
            method: 'POST',
            body: { name, email, password, ...(role ? { role } : {}) },
          });

          set({
            user: data?.data ?? null,
            token: data?.access_token ?? null,
            loading: false,
          });

          return data;
        } catch (e) {
          set({ error: e, loading: false });
          throw e;
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const data = await apiRequest(API.login, {
            method: 'POST',
            body: { email, password },
          });

          set({
            user: data?.user ?? null,
            token: data?.access_token ?? null,
            loading: false,
          });

          return data;
        } catch (e) {
          set({ error: e, loading: false });
          throw e;
        }
      },

      me: async () => {
        const token = get().token;
        if (!token) return null;

        set({ loading: true, error: null });
        try {
          const data = await apiRequest(API.me, { token });
          set({ user: data?.user ?? null, loading: false });
          return data?.user ?? null;
        } catch (e) {
          set({ user: null, token: null, error: e, loading: false });
          return null;
        }
      },

      logout: async () => {
        const token = get().token;
        set({ loading: true, error: null });
        try {
          if (token) {
            await apiRequest(API.logout, { method: 'POST', token });
          }
        } catch (e) {
        } finally {
          set({ user: null, token: null, loading: false, error: null });
        }
      },
    }),
    {
      name: 'auction_app_auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
