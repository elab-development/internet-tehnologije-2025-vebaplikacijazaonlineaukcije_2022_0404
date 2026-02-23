import { Link } from 'react-router-dom';
import { formatMoney, formatDate } from '../../utils/formaters';
import { useCurrencyStore } from '../../stores/currency.store';

export default function SellerAuctionsTable({ rows }) {
  useCurrencyStore((s) => s.currency);

  if (!rows?.length) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80'>
        You haven’t created any auctions yet.
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-2xl border border-white/10 bg-white/5'>
      <table className='min-w-215 w-full text-left'>
        <thead className='text-xs text-white/70'>
          <tr className='border-b border-white/10'>
            <th className='px-4 py-3'>Title</th>
            <th className='px-4 py-3'>Category</th>
            <th className='px-4 py-3'>Start</th>
            <th className='px-4 py-3'>Current</th>
            <th className='px-4 py-3'>Ends</th>
            <th className='px-4 py-3 text-right'>Open</th>
          </tr>
        </thead>
        <tbody className='text-sm text-white/90'>
          {rows.map((a) => {
            const current = a?.highest_bid ?? a?.start_price ?? null;
            const categoryName = a?.category?.name ?? '—';

            return (
              <tr
                key={a.id}
                className='border-b border-white/10 last:border-b-0'
              >
                <td className='px-4 py-3'>
                  <div className='font-semibold'>{a.title}</div>
                  <div className='text-xs text-white/60 line-clamp-1'>
                    {a.description || 'No description'}
                  </div>
                </td>
                <td className='px-4 py-3 text-white/80'>{categoryName}</td>
                <td className='px-4 py-3 text-white/80'>
                  {formatMoney(a.start_price)}
                </td>
                <td className='px-4 py-3 font-semibold'>
                  {formatMoney(current)}
                </td>
                <td className='px-4 py-3 text-white/80'>
                  {formatDate(a.end_time)}
                </td>
                <td className='px-4 py-3 text-right'>
                  <Link
                    to={`/auctions/${a.id}`}
                    className='inline-flex items-center rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-2 text-white shadow-md transition'
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
