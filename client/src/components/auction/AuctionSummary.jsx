import { FiTag, FiUser, FiClock, FiTrendingUp } from 'react-icons/fi';
import {
  formatMoney,
  formatDate,
  parseLaravelDate,
} from '../../utils/formaters';
import { useCurrencyStore } from '../../stores/currency.store';

export default function AuctionSummary({ auction }) {
  const current = auction?.highest_bid ?? auction?.start_price ?? null;
  const categoryName = auction?.category?.name || 'Uncategorized';
  const sellerName = auction?.user?.name || 'Unknown seller';
  useCurrencyStore((s) => s.currency);

  const start = parseLaravelDate(auction?.start_time);
  const end = parseLaravelDate(auction?.end_time);
  const now = new Date();

  const isNotStarted = start ? now < start : false;
  const isEnded = end ? now > end : false;

  const status = isEnded ? 'ENDED' : isNotStarted ? 'NOT STARTED' : 'ACTIVE';

  return (
    <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-semibold'>
            {auction?.title}
          </h1>
          <p className='mt-2 text-white/70'>
            {auction?.description || 'No description.'}
          </p>
        </div>

        <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs text-white/80'>
          <FiTag className='text-white/70' />
          {categoryName}
        </span>
      </div>

      <div className='mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='flex items-center gap-2 text-xs text-white/70'>
            <FiTrendingUp />
            Current price
          </div>
          <div className='mt-1 text-lg font-semibold text-white'>
            {formatMoney(current)}
          </div>
          <div className='mt-1 text-xs text-white/60'>
            {auction?.highest_bid ? 'Highest bid' : 'Start price'}
          </div>
        </div>

        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='flex items-center gap-2 text-xs text-white/70'>
            <FiUser />
            Seller
          </div>
          <div className='mt-1 text-white/90'>{sellerName}</div>
          <div className='mt-1 text-xs text-white/60'>
            {auction?.user?.email || ''}
          </div>
        </div>

        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='flex items-center gap-2 text-xs text-white/70'>
            <FiClock />
            Starts
          </div>
          <div className='mt-1 text-white/90'>
            {formatDate(auction?.start_time)}
          </div>
        </div>

        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='flex items-center gap-2 text-xs text-white/70'>
            <FiClock />
            Ends
          </div>
          <div className='mt-1 text-white/90'>
            {formatDate(auction?.end_time)}
          </div>
        </div>
      </div>

      <div className='mt-4 flex items-center justify-between text-xs'>
        <span className='text-white/60'>Auction ID: {auction?.id}</span>
        <span
          className={[
            'rounded-full px-3 py-1 border text-white/80',
            status === 'ACTIVE'
              ? 'border-emerald-300/30 bg-emerald-500/10'
              : status === 'ENDED'
                ? 'border-red-300/30 bg-red-500/10'
                : 'border-yellow-300/30 bg-yellow-500/10',
          ].join(' ')}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
