import { Link } from 'react-router-dom';
import { formatMoney, formatDate } from '../../utils/formaters';

function StatusPill({ status }) {
  const base =
    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium';
  const map = {
    WINNING: 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100',
    OUTBID: 'border-amber-300/30 bg-amber-500/10 text-amber-100',
    WON: 'border-sky-300/30 bg-sky-500/10 text-sky-100',
    LOST: 'border-red-300/30 bg-red-500/10 text-red-100',
    UNKNOWN: 'border-white/15 bg-white/5 text-white/70',
  };
  return (
    <span className={`${base} ${map[status] || map.UNKNOWN}`}>{status}</span>
  );
}

export default function BuyerParticipationTable({
  rows,
  onPay,
  paidByAuctionId = {},
}) {
  if (!rows?.length) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80'>
        You haven’t placed any bids yet.
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-2xl border border-white/10 bg-white/5'>
      <table className='min-w-[760px] w-full text-left'>
        <thead className='text-xs text-white/70'>
          <tr className='border-b border-white/10'>
            <th className='px-4 py-3'>Auction</th>
            <th className='px-4 py-3'>Ends</th>
            <th className='px-4 py-3'>My max bid</th>
            <th className='px-4 py-3'>Current</th>
            <th className='px-4 py-3'>Status</th>
            <th className='px-4 py-3 text-right'>Action</th>
          </tr>
        </thead>
        <tbody className='text-sm text-white/90'>
          {rows.map((r) => {
            const a = r.auction;
            const auctionTitle = a?.title ?? `Auction #${r.auctionId}`;
            const canPay = r.status === 'WON';
            const isPaid = !!paidByAuctionId?.[r.auctionId];

            return (
              <tr
                key={r.auctionId}
                className='border-b border-white/10 last:border-b-0'
              >
                <td className='px-4 py-3'>
                  <Link
                    to={`/auctions/${r.auctionId}`}
                    className='hover:underline'
                  >
                    {auctionTitle}
                  </Link>
                  <div className='text-xs text-white/60'>
                    bids: {r.myBidsCount}
                  </div>
                </td>

                <td className='px-4 py-3 text-white/80'>
                  {formatDate(a?.end_time ?? a?.endTime)}
                </td>

                <td className='px-4 py-3 font-semibold'>
                  {formatMoney(r.myMaxBid)}
                </td>

                <td className='px-4 py-3 text-white/80'>
                  {formatMoney(r.currentHighest)}
                </td>

                <td className='px-4 py-3'>
                  <StatusPill status={r.status} />
                </td>

                <td className='px-4 py-3 text-right'>
                  {canPay ? (
                    isPaid ? (
                      <span className='inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/10 text-emerald-100 px-3 py-1 text-xs font-medium'>
                        Paid
                      </span>
                    ) : (
                      <button
                        type='button'
                        onClick={() => onPay?.(r)}
                        className='rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white font-medium px-4 py-2 shadow-md transition'
                      >
                        Pay
                      </button>
                    )
                  ) : (
                    <span className='text-white/50 text-xs'>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
