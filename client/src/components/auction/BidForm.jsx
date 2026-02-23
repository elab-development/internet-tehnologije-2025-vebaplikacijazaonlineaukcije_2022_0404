import { useMemo, useState } from 'react';
import { FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { formatMoney, parseLaravelDate } from '../../utils/formaters';
import { useCurrencyStore } from '../../stores/currency.store';

export default function BidForm({
  auction,
  isBuyer,
  isAuthed,
  loading,
  onSubmitBid,
  errorText,
}) {
  useCurrencyStore((s) => s.currency);
  const [amount, setAmount] = useState('');

  const now = new Date();
  const start = parseLaravelDate(auction?.start_time);
  const end = parseLaravelDate(auction?.end_time);

  const isNotStarted = start ? now < start : false;
  const isEnded = end ? now > end : false;
  const isActive = !isNotStarted && !isEnded;

  const minBid = useMemo(() => {
    const current = Number(auction?.highest_bid ?? auction?.start_price ?? 0);
    return Number.isFinite(current) ? current + 0.01 : null;
  }, [auction]);

  if (!isAuthed) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
        <h2 className='text-lg font-semibold'>Place a bid</h2>
        <p className='mt-2 text-white/70'>Log in as a buyer to place a bid.</p>
      </div>
    );
  }

  if (!isBuyer) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
        <h2 className='text-lg font-semibold'>Place a bid</h2>
        <p className='mt-2 text-white/70'>Only buyers can place bids.</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
        <h2 className='text-lg font-semibold'>Place a bid</h2>
        <p className='mt-2 text-white/70'>
          This auction is not active. You can’t place bids right now.
        </p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    await onSubmitBid(n);
    setAmount('');
  };

  return (
    <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
      <h2 className='text-lg font-semibold'>Place a bid</h2>
      <p className='mt-1 text-sm text-white/70'>
        Minimum bid: <span className='text-white'>{formatMoney(minBid)}</span>
      </p>

      {errorText && (
        <div className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex gap-2'>
          <FiAlertTriangle className='mt-0.5 shrink-0' />
          <div className='text-sm'>{errorText}</div>
        </div>
      )}

      <form onSubmit={submit} className='mt-4 space-y-3'>
        <label className='block'>
          <span className='text-sm text-white/80'>Your bid (EUR)</span>
          <div className='mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/30'>
            <FiDollarSign className='text-white/70' />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type='number'
              step='0.01'
              min={minBid ?? 0}
              required
              className='w-full bg-transparent outline-none text-white placeholder:text-white/40'
              placeholder={minBid ? String(minBid) : '0.00'}
            />
          </div>
        </label>

        <button
          disabled={loading}
          className='w-full rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white font-medium py-2.5 shadow-md transition disabled:opacity-60'
        >
          {loading ? 'Placing bid...' : 'Place bid'}
        </button>
      </form>
    </div>
  );
}
