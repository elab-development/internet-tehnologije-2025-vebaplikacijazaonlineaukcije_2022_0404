import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { FiMail, FiLock, FiAlertTriangle } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) navigate('/profile', { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate('/profile');
    } catch {}
  };

  const errorText =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    error?.message ||
    null;

  return (
    <div className='min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6'>
        <h2 className='text-xl font-semibold text-white'>Login</h2>
        <p className='text-white/70 text-sm mt-1'>
          Use your email and password.
        </p>

        {errorText && (
          <div className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex gap-2'>
            <FiAlertTriangle className='mt-0.5 shrink-0' />
            <div className='text-sm'>{errorText}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className='mt-5 space-y-4'>
          <label className='block'>
            <span className='text-sm text-white/80'>Email</span>
            <div className='mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/30'>
              <FiMail className='text-white/70' />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type='email'
                required
                className='w-full bg-transparent outline-none text-white placeholder:text-white/40'
                placeholder='you@example.com'
              />
            </div>
          </label>

          <label className='block'>
            <span className='text-sm text-white/80'>Password</span>
            <div className='mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/30'>
              <FiLock className='text-white/70' />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type='password'
                required
                className='w-full bg-transparent outline-none text-white placeholder:text-white/40'
                placeholder='••••••••'
              />
            </div>
          </label>

          <button
            disabled={loading}
            className='w-full rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white font-medium py-2.5 shadow-md transition disabled:opacity-60'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='mt-4 text-sm text-white/70'>
          Don&apos;t have an account?{' '}
          <Link to='/register' className='text-white hover:underline'>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
