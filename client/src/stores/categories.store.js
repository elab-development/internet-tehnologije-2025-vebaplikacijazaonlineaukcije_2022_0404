import { create } from 'zustand';
import { apiRequest } from '../api/http';
import { API } from '../api/endpoints';
import { useAuthStore } from './auth.store';

export const useCategoriesStore = create((set, get) => ({
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.categories);
      set({ categories: data?.categories ?? [], loading: false });
      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  fetchCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.category(id));
      set({ currentCategory: data?.category ?? null, loading: false });
      return data?.category ?? null;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  createCategory: async ({ name, description }) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.categories, {
        method: 'POST',
        token,
        body: { name, description },
      });

      const created = data?.category ?? null;
      if (created)
        set({ categories: [created, ...get().categories], loading: false });
      else set({ loading: false });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },

  updateCategory: async (id, patch) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.category(id), {
        method: 'PUT',
        token,
        body: patch,
      });

      const updated = data?.category ?? null;
      if (updated) {
        set({
          categories: get().categories.map((c) => (c.id === id ? updated : c)),
          currentCategory:
            get().currentCategory?.id === id ? updated : get().currentCategory,
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

  deleteCategory: async (id) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await apiRequest(API.category(id), {
        method: 'DELETE',
        token,
      });

      set({
        categories: get().categories.filter((c) => c.id !== id),
        currentCategory:
          get().currentCategory?.id === id ? null : get().currentCategory,
        loading: false,
      });

      return data;
    } catch (e) {
      set({ error: e, loading: false });
      throw e;
    }
  },
}));
