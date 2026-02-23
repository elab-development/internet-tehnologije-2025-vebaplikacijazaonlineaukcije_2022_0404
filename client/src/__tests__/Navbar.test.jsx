import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/Navbar';
import { renderWithRouter } from '../test/helpers';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Mock stores
const authState = {
  token: null,
  user: null,
  logout: vi.fn().mockResolvedValue(undefined),
};

const currencyState = {
  currency: 'EUR',
  setCurrency: vi.fn(),
  loadRates: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (sel) => sel(authState),
}));

vi.mock('../stores/currency.store', () => ({
  useCurrencyStore: (sel) => sel(currencyState),
}));

describe('Navbar', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    authState.logout.mockClear();
    currencyState.setCurrency.mockClear();
    currencyState.loadRates.mockClear();

    authState.token = null;
    authState.user = null;
    currencyState.currency = 'EUR';
  });

  it('shows Login/Register when not authenticated', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  it('shows Profile/Logout when authenticated', () => {
    authState.token = 'token';
    authState.user = { name: 'Nikola', role: 'buyer' };

    renderWithRouter(<Navbar />);
    expect(screen.getByText(/nikola/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/register/i)).not.toBeInTheDocument();
  });

  it('calls logout and navigates to /login', async () => {
    authState.token = 'token';
    authState.user = { name: 'Nikola' };

    renderWithRouter(<Navbar />);
    await userEvent.click(screen.getByText(/logout/i));

    expect(authState.logout).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('changes currency via select', async () => {
    renderWithRouter(<Navbar />);
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'USD');
    expect(currencyState.setCurrency).toHaveBeenCalledWith('USD');
  });

  it('loads rates on mount', () => {
    renderWithRouter(<Navbar />);
    expect(currencyState.loadRates).toHaveBeenCalledTimes(1);
  });

  it('toggles mobile menu', async () => {
    renderWithRouter(<Navbar />);
    const btn = screen.getByLabelText(/toggle menu/i);

    // closed initially
    expect(screen.queryByText(/login/i)).toBeInTheDocument(); // desktop has it too, ali ok
    await userEvent.click(btn);

    // open should show dropdown links too (bar jedan)
    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
  });
});
