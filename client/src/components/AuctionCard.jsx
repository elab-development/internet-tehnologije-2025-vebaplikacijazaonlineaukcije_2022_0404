import { Link } from 'react-router-dom';
import { FiTag, FiClock, FiTrendingUp, FiUser } from 'react-icons/fi';
import { formatDate, formatMoney } from '../utils/formaters';
import { useCurrencyStore } from '../stores/currency.store';

export default function AuctionCard({ auction }) {
  const highestOrStart = auction?.highest_bid ?? auction?.start_price ?? null;
  const categoryName = auction?.category?.name || 'Uncategorized';
  const sellerName = auction?.user?.name || 'Unknown seller';
  useCurrencyStore((s) => s.currency);

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className='group block rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg hover:bg-white/15 transition'
    >
      <div className='p-5'>
        <div className='flex items-start justify-between gap-3'>
          <h3 className='text-white font-semibold text-lg leading-snug line-clamp-2'>
            {auction.title}
          </h3>

          <span className='shrink-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80'>
            <FiTag className='text-white/70' />
            {categoryName}
          </span>
        </div>

        <div className='mt-2 flex items-center gap-2 text-xs text-white/70'>
          <FiUser className='text-white/60' />
          <span className='line-clamp-1'>{sellerName}</span>
        </div>

        {auction.description ? (
          <p className='mt-2 text-sm text-white/70 line-clamp-2'>
            {auction.description}
          </p>
        ) : (
          <p className='mt-2 text-sm text-white/50 italic'>No description</p>
        )}

        <div className='mt-4 grid grid-cols-2 gap-3'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
            <div className='flex items-center gap-2 text-xs text-white/70'>
              <FiTrendingUp />
              Current
            </div>
            <div className='mt-1 text-white font-semibold'>
              {formatMoney(highestOrStart)}
            </div>
          </div>

          <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
            <div className='flex items-center gap-2 text-xs text-white/70'>
              <FiClock />
              Ends
            </div>
            <div className='mt-1 text-white/90 text-sm'>
              {formatDate(auction.end_time)}
            </div>
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between'>
          <span className='text-xs text-white/60'>
            Starts: {formatDate(auction.start_time)}
          </span>

          <span className='text-sm text-white/90 group-hover:underline'>
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
