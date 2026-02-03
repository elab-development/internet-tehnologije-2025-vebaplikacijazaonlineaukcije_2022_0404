import { FiAward } from 'react-icons/fi';
import { formatMoney } from '../../utils/formaters';

export default function WinnerCard({ auction, leadingBid }) {
  const hasAnyBid = !!auction?.highest_bid && Number(auction.highest_bid) > 0;
  const canShowLeader = !!leadingBid?.user?.name;

  return (
    <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
      <div className='flex items-center gap-2'>
        <FiAward className='text-white/80' />
        <h2 className='text-lg font-semibold'>Current leader</h2>
      </div>

      {!hasAnyBid ? (
        <p className='mt-3 text-white/70'>
          No bids yet. Starting price is{' '}
          <span className='text-white font-semibold'>
            {formatMoney(auction?.start_price)}
          </span>
          .
        </p>
      ) : canShowLeader ? (
        <div className='mt-3'>
          <p className='text-white/80'>
            Leading bidder:{' '}
            <span className='text-white font-semibold'>
              {leadingBid.user.name}
            </span>
          </p>
          <p className='text-white/60 text-sm'>{leadingBid.user.email}</p>
          <p className='mt-2 text-white/80'>
            Leading bid:{' '}
            <span className='text-white font-semibold'>
              {formatMoney(leadingBid.amount)}
            </span>
          </p>
        </div>
      ) : (
        <p className='mt-3 text-white/70'>
          There is a leading bid:{' '}
          <span className='text-white font-semibold'>
            {formatMoney(auction?.highest_bid)}
          </span>
          .{' '}
          <span className='text-white/60'>
            (Leader name is not available yet.)
          </span>
        </p>
      )}
    </div>
  );
}
