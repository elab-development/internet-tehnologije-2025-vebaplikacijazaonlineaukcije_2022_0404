import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  FiLogIn,
  FiUserPlus,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useCurrencyStore } from '../stores/currency.store';

const navLinkClass = ({ isActive }) =>
  [
    'px-3 py-2 rounded-xl text-sm font-medium transition',
    'hover:bg-white/10 hover:text-white',
    isActive ? 'bg-white/15 text-white' : 'text-white/80',
  ].join(' ');

export default function Navbar() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const loadRates = useCurrencyStore((s) => s.loadRates);

  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    loadRates().catch(() => {});
  }, []);

  return (
    <header className='sticky top-0 z-50'>
      <div className='mx-auto max-w-6xl px-4 pt-4'>
        <nav className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-3'>
          {/* Left */}
          <Link
            to='/'
            className='flex items-center gap-2 text-white font-semibold tracking-wide'
          >
            <span className='text-base sm:text-lg'>Auctions</span>
          </Link>

          {/* Desktop right */}
          <div className='hidden sm:flex items-center gap-2'>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className=' px-3 py-2 rounded-xl text-sm font-medium transition
             border border-white/10 bg-white/10 text-black
             hover:bg-white/15 outline-none'
            >
              <option value='EUR'>EUR</option>
              <option value='RSD'>RSD</option>
              <option value='USD'>USD</option>
            </select>
            {!token ? (
              <>
                <NavLink to='/login' className={navLinkClass}>
                  <span className='inline-flex items-center gap-2'>
                    <FiLogIn /> Login
                  </span>
                </NavLink>
                <NavLink to='/register' className={navLinkClass}>
                  <span className='inline-flex items-center gap-2'>
                    <FiUserPlus /> Register
                  </span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to='/profile' className={navLinkClass}>
                  <span className='inline-flex items-center gap-2'>
                    <FiUser /> {user?.name ?? 'Profile'}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className='px-3 py-2 rounded-xl text-sm font-medium transition text-white/80 hover:text-white hover:bg-white/10'
                >
                  <span className='inline-flex items-center gap-2'>
                    <FiLogOut /> Logout
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className='sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-white/10 border border-white/10 text-white shadow-md'
            aria-label='Toggle menu'
          >
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {open && (
          <div className='sm:hidden mt-2 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden'>
            <div className='p-2'>
              {!token ? (
                <div className='flex flex-col gap-1'>
                  <NavLink
                    to='/login'
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    <span className='inline-flex items-center gap-2'>
                      <FiLogIn /> Login
                    </span>
                  </NavLink>
                  <NavLink
                    to='/register'
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    <span className='inline-flex items-center gap-2'>
                      <FiUserPlus /> Register
                    </span>
                  </NavLink>
                </div>
              ) : (
                <div className='flex flex-col gap-1'>
                  <NavLink
                    to='/profile'
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    <span className='inline-flex items-center gap-2'>
                      <FiUser /> {user?.name ?? 'Profile'}
                    </span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className='w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition text-white/80 hover:text-white hover:bg-white/10'
                  >
                    <span className='inline-flex items-center gap-2'>
                      <FiLogOut /> Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
