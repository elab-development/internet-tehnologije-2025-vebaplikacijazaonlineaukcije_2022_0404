import { create } from 'zustand';
import { fetchRates } from '../api/currency.api';

const STORAGE_KEY = 'currency_selected';

export const useCurrencyStore = create((set, get) => ({
  currency: localStorage.getItem(STORAGE_KEY) || 'EUR',
  base: 'EUR',
  rates: { EUR: 1 },
  loading: false,
  error: null,

  // učitaj kursnu listu
  loadRates: async () => {
    const { base } = get();
    set({ loading: true, error: null });
    try {
      const data = await fetchRates(base);
      set({ rates: { ...data.rates, [base]: 1 }, loading: false });
    } catch (e) {
      set({ error: e?.message || 'Rates error', loading: false });
    }
  },

  setCurrency: async (next) => {
    localStorage.setItem(STORAGE_KEY, next);
    set({ currency: next });

    const { rates, loadRates } = get();
    if (!rates || Object.keys(rates).length <= 1) {
      await loadRates();
    }
  },

  // konverzija iz EUR baze u target valutu
  convertFromEUR: (amountEUR) => {
    const n = Number(amountEUR);
    if (Number.isNaN(n)) return amountEUR;

    const { currency, rates } = get();
    if (currency === 'EUR') return n;

    const r = rates?.[currency];
    if (!r) return n; // fallback: ako nema kursa, vrati EUR vrednost

    return n * r;
  },
}));
